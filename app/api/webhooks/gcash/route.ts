import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { GCashPaymentService } from "@/lib/gcash"

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
  const bookingReference = paymentData.attributes.metadata.booking_reference

  // Update booking status to confirmed
  // await updateBookingStatus(bookingReference, 'confirmed')

  // Send confirmation email
  // await sendBookingConfirmationEmail(bookingReference)

  console.log(`Payment succeeded for booking: ${bookingReference}`)
}

async function handlePaymentFailure(paymentData: any) {
  const bookingReference = paymentData.attributes.metadata.booking_reference

  // Update booking status to failed
  // await updateBookingStatus(bookingReference, 'payment_failed')

  console.log(`Payment failed for booking: ${bookingReference}`)
}
