"use client"

import { useState } from "react"

interface PaymentData {
  amount: number
  description: string
  bookingId: string
  successUrl?: string
  failureUrl?: string
}

export function useGCashPayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = async (paymentData: PaymentData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate payment data before sending request
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error("Invalid payment amount. Amount must be greater than 0.")
      }

      if (!paymentData.bookingId) {
        throw new Error("Booking ID is required for payment processing.")
      }

      const response = await fetch("/api/payments/gcash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("GCash payment error:", result);
        throw new Error(result.error || result.message || "Payment processing failed. Please check your payment details and try again.")
      }

      // Redirect to GCash payment page
      if (result.data.redirectUrl) {
        window.location.href = result.data.redirectUrl
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPayment = async (paymentIntentId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Payment verification failed")
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    processPayment,
    verifyPayment,
    isLoading,
    error,
  }
}
