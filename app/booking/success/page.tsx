"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"
import { trpc } from "@/hooks/trpc"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { useRoomStore } from "@/hooks/useRooms"

interface BookingDetails {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalAmount: number;
  status: string;
  specialRequests?: string;
  createdAt: Date;
  room?: {
    name: string;
    pricePerNight: number;
  };
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get("booking") || searchParams.get("ref")
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth();
  const { setShouldRefetchRooms } = useRoomStore();

  // Use the new getBookingById endpoint which doesn't require authentication
  const {
    data: bookingData,
    isLoading: bookingLoading,
    error: bookingError
  } = trpc.rooms.getBookingById.useQuery(
    { id: bookingRef || "" },
    {
      enabled: !!bookingRef,
      refetchOnWindowFocus: false,
      retry: 1 // Only retry once
    }
  );

  // If the user is authenticated, also try to get their bookings for more details
  const {
    data: userBookings,
    isLoading: userBookingsLoading,
  } = trpc.rooms.getUserBookings.useQuery(
    undefined,
    {
      enabled: !!isAuthenticated && !!bookingRef,
      refetchOnWindowFocus: false,
      retry: 1 // Only retry once
    }
  );

  useEffect(() => {
    // If the user is authenticated and we have their bookings
    if (userBookings && bookingRef && !bookingDetails) {
      const booking = userBookings.find((booking) => booking.id === bookingRef);
      if (booking) {
        setBookingDetails(booking as unknown as BookingDetails);
      }
      setIsLoading(false);
    }
  }, [bookingRef, userBookings, bookingDetails]);

  // Effect to ensure room data is refreshed when landing on this page (for GCash callbacks)
  useEffect(() => {
    // Trigger a refresh of the room data when landing on the success page
    setShouldRefetchRooms(true);
  }, [setShouldRefetchRooms]);

  // Effect to update booking details when data is loaded from getBookingById
  useEffect(() => {
    if (bookingData) {
      setBookingDetails(bookingData as unknown as BookingDetails);
      setIsLoading(false);
    } else if (bookingError || (!bookingLoading && bookingRef)) {
      // If there's an error or loading is complete but no data
      setIsLoading(false);
    }
  }, [bookingData, bookingError, bookingLoading, bookingRef]);

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

          {isLoading && (
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!isLoading && bookingDetails && (
            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
              <p className="font-medium">Booking Details</p>
              <Separator />

              <div className="grid grid-cols-2 gap-1 text-sm">
                <p className="text-gray-600">Room:</p>
                <p className="font-medium">{bookingDetails.room?.name || "Standard Room"}</p>

                <p className="text-gray-600">Check-in:</p>
                <p className="font-medium">{format(new Date(bookingDetails.checkInDate), "MMM dd, yyyy")}</p>

                <p className="text-gray-600">Check-out:</p>
                <p className="font-medium">{format(new Date(bookingDetails.checkOutDate), "MMM dd, yyyy")}</p>

                <p className="text-gray-600">Guests:</p>
                <p className="font-medium">{bookingDetails.guestCount}</p>

                <p className="text-gray-600">Status:</p>
                <p className="font-medium text-green-600">{bookingDetails.status}</p>

                <p className="text-gray-600">Total Amount:</p>
                <p className="font-medium">₱{bookingDetails.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          )}

          {!isLoading && !bookingDetails && !isAuthenticated && (
            <div className="bg-yellow-50 p-4 rounded-lg text-left">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="font-medium text-yellow-700">Authentication Required</p>
              </div>
              <p className="text-sm text-yellow-600 mb-4">Please sign in to view your complete booking details.</p>
              <Button className="w-full" asChild>
                <Link href={`/login?redirect=/booking/success?booking=${bookingRef}`}>Sign In to View Details</Link>
              </Button>
            </div>
          )}

          {!isLoading && !bookingDetails && isAuthenticated && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Your booking was successful, but we couldn't retrieve the complete details at this moment.
              </p>
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
