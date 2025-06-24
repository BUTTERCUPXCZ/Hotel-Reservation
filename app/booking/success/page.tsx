"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Mail } from "lucide-react"
import Link from "next/link"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get("booking") || searchParams.get("ref")
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    // Fetch booking details using the reference
    if (bookingRef) {
      // This would typically fetch from your API
      // fetchBookingDetails(bookingRef)
    }
  }, [bookingRef])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Your booking has been confirmed and payment processed successfully.</p>

          {bookingRef && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="font-mono font-bold text-lg">{bookingRef}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/dashboard">View My Bookings</Link>
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email Receipt
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500">A confirmation email has been sent to your registered email address.</p>
        </CardContent>
      </Card>
    </div>
  )
}
