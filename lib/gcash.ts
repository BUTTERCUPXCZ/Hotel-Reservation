// GCash Payment Integration
export interface GCashPaymentRequest {
  amount: number
  currency: string
  description: string
  redirectUrl: {
    success: string
    failure: string
    cancel: string
  }
  requestReferenceNumber: string
  metadata?: Record<string, any>
}

export interface GCashPaymentResponse {
  checkoutId: string
  redirectUrl: string
  status: string
  requestReferenceNumber: string
}

export class GCashPaymentService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private isProduction: boolean

  constructor() {
    this.apiKey = process.env.GCASH_API_KEY || ""
    this.apiSecret = process.env.GCASH_API_SECRET || ""
    this.isProduction = process.env.NODE_ENV === "production"
    this.baseUrl = this.isProduction ? "https://api.paymongo.com/v1" : "https://api.paymongo.com/v1" // Use PayMongo as GCash processor

    // Validate API keys
    if (!this.apiKey || !this.apiSecret) {
      console.warn("GCash API keys are missing. Payment functionality will not work correctly.")
    }
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiKey}:`).toString("base64")
    return `Basic ${credentials}`
  }

  async createPaymentIntent(paymentData: GCashPaymentRequest): Promise<GCashPaymentResponse> {
    try {
      // Validate API keys first
      if (!this.apiKey || !this.apiSecret) {
        throw new Error("GCash API keys are missing. Please configure GCASH_API_KEY and GCASH_API_SECRET in your environment variables.")
      }

      // Validate payment data
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error("Invalid payment amount. Amount must be greater than 0.")
      }

      if (!paymentData.redirectUrl?.success || !paymentData.redirectUrl?.failure) {
        throw new Error("Redirect URLs are required for GCash payment.")
      }

      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: paymentData.amount * 100, // Convert to centavos
              payment_method_allowed: ["gcash"],
              payment_method_options: {
                gcash: {
                  redirect: {
                    success: paymentData.redirectUrl.success,
                    failed: paymentData.redirectUrl.failure,
                  },
                },
              },
              currency: paymentData.currency.toLowerCase(),
              description: paymentData.description,
              statement_descriptor: "HostelHub Booking",
              metadata: {
                booking_reference: paymentData.requestReferenceNumber,
                ...paymentData.metadata,
              },
            },
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("GCash API error response:", result);
        const errorDetail = result.errors?.[0]?.detail || JSON.stringify(result);
        throw new Error(`Payment creation failed: ${errorDetail}`)
      }

      return {
        checkoutId: result.data.id,
        redirectUrl: result.data.attributes.next_action?.redirect?.url || "",
        status: result.data.attributes.status,
        requestReferenceNumber: paymentData.requestReferenceNumber,
      }
    } catch (error) {
      console.error("GCash payment creation error:", error)

      // For development environment, return mock data instead of failing
      if (process.env.NODE_ENV !== "production") {
        console.log("Using mock GCash payment response for development")
        return {
          checkoutId: "mock_" + Date.now(),
          redirectUrl: `/booking/success?mockPayment=true&ref=${paymentData.requestReferenceNumber}`,
          status: "awaiting_payment_method",
          requestReferenceNumber: paymentData.requestReferenceNumber,
        }
      }

      throw error
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error("Payment verification failed")
      }

      return result.data
    } catch (error) {
      console.error("Payment verification error:", error)
      throw error
    }
  }

  generateReferenceNumber(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `HH${timestamp}${random}`
  }

  /**
   * Verify PayMongo webhook signature
   * @param payload Raw request body as string
   * @param signature PayMongo signature from headers
   * @param webhookSecret Webhook secret from environment variables
   * @returns boolean indicating if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string | null, webhookSecret: string): boolean {
    if (!signature || !webhookSecret) {
      return false
    }

    try {
      const crypto = require('crypto')

      // PayMongo uses comma-separated timestamps and signatures
      const signatureParts = signature.split(',')

      for (const part of signatureParts) {
        const [timestamp, signatureValue] = part.split('=')

        if (!timestamp || !signatureValue) continue

        // Calculate expected signature
        const signedPayload = `${timestamp}.${payload}`
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(signedPayload)
          .digest('hex')

        // If any signature matches, the request is valid
        if (signatureValue === expectedSignature) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }
}
