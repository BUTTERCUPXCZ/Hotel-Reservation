import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { GCashPaymentService } from "@/lib/gcash"
import { db } from "@/lib/db"
import { PrismaClient } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("paymongo-signature")

    // Verify webhook signature
    const gcashService = new GCashPaymentService()
    const isValidSignature = gcashService.verifyWebhookSignature(
      body,
      signature,
      process.env.GCASH_WEBHOOK_SECRET || ""
    )

    if (!isValidSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.data.attributes.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data)
        break
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data)
        break
      default:
        console.log("Unhandled webhook event:", event.data.attributes.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentData: any) {
  try {
    const bookingReference = paymentData.attributes.metadata.booking_reference
    const bookingId = paymentData.attributes.metadata.bookingId

    console.log(`Payment succeeded for booking: ${bookingReference || bookingId}`)

    // Use bookingId from metadata if available
    if (bookingId) {
      // Find the booking
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          status: true,
          roomId: true
        }
      });

      if (!booking) {
        console.error(`Booking not found for ID: ${bookingId}`);
        return;
      }

      // Only update if the booking isn't already confirmed
      if (booking.status !== 'CONFIRMED') {
        // Use a transaction to update both booking status and room count
        await db.$transaction(async (tx: PrismaClient) => {
          // 1. Update booking status to CONFIRMED
          await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CONFIRMED',
              // You could also store payment information
              specialRequests: `Payment completed via GCash. Transaction ID: ${paymentData.id}`
            }
          });

          // 2. Decrement room count
          await tx.room.update({
            where: { id: booking.roomId },
            data: {
              numberofrooms: {
                decrement: 1
              }
            }
          });

          console.log(`Booking ${bookingId} confirmed and room ${booking.roomId} count decremented`);
        });
      } else {
        console.log(`Booking ${bookingId} was already confirmed.`);
      }
    } else {
      console.error("Missing bookingId in payment metadata");
    }

    // Send confirmation email
    // await sendBookingConfirmationEmail(bookingReference)
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailure(paymentData: any) {
  try {
    const bookingReference = paymentData.attributes.metadata.booking_reference
    const bookingId = paymentData.attributes.metadata.bookingId

    console.log(`Payment failed for booking: ${bookingReference || bookingId}`)

    // Use bookingId from metadata if available
    if (bookingId) {
      // Update booking status to PAYMENT_FAILED (won't affect room count)
      await db.booking.update({
        where: { id: bookingId },
        data: {
          status: 'PAYMENT_FAILED',
          specialRequests: `Payment failed via GCash. Transaction ID: ${paymentData.id}`
        }
      });

      console.log(`Booking ${bookingId} marked as payment failed`);
    } else {
      console.error("Missing bookingId in payment metadata");
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
