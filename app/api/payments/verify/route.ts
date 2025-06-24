import { type NextRequest, NextResponse } from "next/server"
import { GCashPaymentService } from "@/lib/gcash"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 })
    }

    const gcashService = new GCashPaymentService()
    const paymentData = await gcashService.verifyPayment(paymentIntentId)

    // Update booking status based on payment status
    const isSuccessful = paymentData.attributes.status === "succeeded"

    // Here you would update your database
    // await updateBookingPaymentStatus(paymentData.attributes.metadata.booking_reference, {
    //   status: isSuccessful ? 'paid' : 'failed',
    //   paymentIntentId,
    //   paidAt: isSuccessful ? new Date() : null
    // })

    return NextResponse.json({
      success: true,
      data: {
        status: paymentData.attributes.status,
        amount: paymentData.attributes.amount / 100, // Convert back from centavos
        currency: paymentData.attributes.currency,
        referenceNumber: paymentData.attributes.metadata.booking_reference,
        paidAt: paymentData.attributes.status === "succeeded" ? new Date().toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
