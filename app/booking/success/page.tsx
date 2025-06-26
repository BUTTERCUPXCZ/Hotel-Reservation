"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Mail, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { trpc } from "@/hooks/trpc"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { useRoomStore } from "@/hooks/useRooms"
import { useToast } from "@/hooks/use-toast"

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAuthenticated } = useAuth();
  const { setShouldRefetchRooms } = useRoomStore();
  const { toast } = useToast();

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

  // Effect to handle user bookings when authenticated
  useEffect(() => {
    if (isAuthenticated && userBookings && bookingRef && !bookingDetails) {
      const booking = userBookings.find((booking) => booking.id === bookingRef);
      if (booking) {
        setBookingDetails(booking as unknown as BookingDetails);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, userBookings, bookingRef, bookingDetails]);

  // Import once at the top rather than requiring inside a function
  // We use dynamic import to avoid SSR issues
  const [notifyUtil, setNotifyUtil] = useState<any>(null);

  // Load the utility once on component mount
  useEffect(() => {
    import('@/lib/utils').then(module => {
      setNotifyUtil(module);
    });
  }, []);

  // Memoized notification function to prevent unnecessary re-renders
  const notifyBookingUpdate = useCallback(() => {
    if (bookingRef && notifyUtil) {
      console.log("📢 Sending room booking update notification for:", bookingRef);
      try {
        notifyUtil.notifyRoomBookingUpdate(bookingRef);
      } catch (error) {
        console.log("Could not send booking notification:", error);
      }
    }
  }, [bookingRef, notifyUtil]);

  // Get tRPC utils for direct query invalidation
  const utils = trpc.useUtils();

  // Effect to ensure room data is refreshed when landing on this page (for GCash callbacks)
  useEffect(() => {
    console.log("🎯 Booking success page loaded - triggering room data refresh");

    // Function to perform a complete refresh of room data
    const refreshAllRoomData = async () => {
      try {
        console.log("🔄 Refreshing all room data...");
        // Set flag in global store
        setShouldRefetchRooms(true);

        // Directly invalidate all room-related queries
        utils.rooms.invalidate();

        // Also make a direct API call to ensure server has the latest data
        await fetch('/api/rooms/availability', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }).then(r => r.json()).then(data => {
          console.log("✅ Room availability data refreshed:", data.timestamp);
        }).catch(err => {
          console.error("Failed to refresh room data:", err);
        });
      } catch (error) {
        console.error("Error refreshing room data:", error);
      }
    };

    // Perform initial refresh immediately
    refreshAllRoomData();

    // Initial notification after a short delay as backup
    const initialNotificationTimeout = setTimeout(notifyBookingUpdate, 500);

    // Set up periodic refresh for the first 10 seconds
    const refreshInterval = setInterval(() => {
      refreshAllRoomData();
      notifyBookingUpdate();
    }, 2000);

    // Stop periodic refresh after 10 seconds
    const stopRefreshTimeout = setTimeout(() => {
      clearInterval(refreshInterval);
      console.log("🛑 Stopped periodic room data refresh");
    }, 10000);

    return () => {
      clearTimeout(initialNotificationTimeout);
      clearInterval(refreshInterval);
      clearTimeout(stopRefreshTimeout);
    };
  }, [setShouldRefetchRooms, notifyBookingUpdate, utils.rooms]);

  // Manual refresh function with user feedback
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log("🔄 Manual room refresh triggered by user");

    try {
      // 1. Set global refresh flag
      setShouldRefetchRooms(true);

      // 2. Directly invalidate relevant room queries
      utils.rooms.getAvailableRooms.invalidate();
      utils.rooms.getRoomById.invalidate();

      // 3. Send booking notification
      notifyBookingUpdate();

      // 4. Try to fetch fresh room data from API
      try {
        const response = await fetch('/api/rooms/availability');
        if (response.ok) {
          const data = await response.json();
          console.log("✓ Fresh room data fetched:", data.rooms.length, "rooms");
        }
      } catch (apiError) {
        console.log("API fetch failed, continuing with tRPC invalidation");
      }

      // Give some time for the refresh to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success notification
      toast({
        title: "Room Availability Updated",
        description: "The latest room availability has been refreshed successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.log("Could not refresh room data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh room availability. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [setShouldRefetchRooms, notifyBookingUpdate, toast]);
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

            <Button
              variant="outline"
              className="w-full"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Update Room Availability'}
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
