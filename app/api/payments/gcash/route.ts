import { type NextRequest, NextResponse } from "next/server"
import { GCashPaymentService } from "@/lib/gcash"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, bookingId, successUrl, failureUrl } = body

    // Validate required fields
    if (!amount || !description || !bookingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const gcashService = new GCashPaymentService()
    const referenceNumber = gcashService.generateReferenceNumber()

    const paymentData = {
      amount: Number.parseFloat(amount),
      currency: "PHP",
      description,
      redirectUrl: {
        success: successUrl || `${process.env.NEXTAUTH_URL || window.location.origin}/booking/success?ref=${referenceNumber}`,
        failure: failureUrl || `${process.env.NEXTAUTH_URL || window.location.origin}/booking/failed?ref=${referenceNumber}`,
        cancel: `${process.env.NEXTAUTH_URL || window.location.origin}/booking/cancelled?ref=${referenceNumber}`,
      },
      requestReferenceNumber: referenceNumber,
      metadata: {
        bookingId,
        paymentMethod: "gcash",
      },
    }

    const paymentResponse = await gcashService.createPaymentIntent(paymentData)

    // Here you would typically save the payment intent to your database
    // await savePaymentIntent({
    //   bookingId,
    //   paymentIntentId: paymentResponse.checkoutId,
    //   referenceNumber,
    //   amount,
    //   status: 'pending'
    // })

    return NextResponse.json({
      success: true,
      data: {
        checkoutId: paymentResponse.checkoutId,
        redirectUrl: paymentResponse.redirectUrl,
        referenceNumber: paymentResponse.requestReferenceNumber,
      },
    })
  } catch (error) {
    console.error("GCash payment API error:", error)
    return NextResponse.json(
      { error: "Payment processing failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
