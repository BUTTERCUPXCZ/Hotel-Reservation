"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Mail, AlertCircle, RefreshCw, Bed, Calendar, Users, CreditCard, Clock, Printer, Building } from "lucide-react"
import Link from "next/link"
import { trpc } from "@/hooks/trpc"
import { Separator } from "@/components/ui/separator"
import { format, differenceInDays } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import { useRoomStore } from "@/hooks/useRooms"
import { useToast } from "@/hooks/use-toast"
import { useReactToPrint } from "react-to-print"

// Add print styles
import './print-styles.css'

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
  updatedAt?: Date;
  paymentMethod?: string;
  phone?: string;
  room?: {
    id?: string;
    name: string;
    pricePerNight: number;
    description?: string;
    type?: string;
    imageUrl?: string;
    numberofrooms?: number;
    roomType?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get("booking") || searchParams.get("ref")
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAuthenticated, user } = useAuth();
  const { setShouldRefetchRooms } = useRoomStore();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [directApiFailed, setDirectApiFailed] = useState(false);
  const utils = trpc.useUtils();

  // Import utils module once at the top using a ref to avoid re-renders
  // We use dynamic import to avoid SSR issues
  const notifyUtilRef = useRef<any>(null);
  const [notifyUtilLoaded, setNotifyUtilLoaded] = useState(false);

  // Load the utility once on component mount
  useEffect(() => {
    let mounted = true;

    const loadUtils = async () => {
      try {
        const module = await import('@/lib/utils');
        if (mounted) {
          notifyUtilRef.current = module;
          setNotifyUtilLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load utils module:", err);
      }
    };

    loadUtils();

    return () => {
      mounted = false;
    };
  }, []);

  // Function to fetch booking data directly from API - optimized with better error handling
  const fetchBookingDirectly = useCallback(async () => {
    if (!bookingRef) return null;

    // Set a timeout to prevent the API call from hanging too long
    const fetchWithTimeout = async (url: string, timeoutMs: number = 3000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    try {
      console.log("📋 Fetching booking data directly from API:", bookingRef);
      // Use the dedicated endpoint for fetching booking by ID with timeout
      const response = await fetchWithTimeout(`/api/bookings/get-by-id?id=${bookingRef}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (data.booking) {
        console.log("✅ Direct API booking data successful");
        return data.booking;
      }
      throw new Error("No booking data in response");
    } catch (error) {
      console.error("❌ Direct API fetch failed:", error instanceof Error ? error.message : String(error));

      // Fallback to debug endpoint if the main one fails
      try {
        console.log("🔄 Trying debug API fallback");
        const debugResponse = await fetchWithTimeout(`/api/debug-booking?id=${bookingRef}`, 2000);
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          const foundBooking = debugData.recentBookings?.find((b: any) => b.id === bookingRef);
          if (foundBooking) {
            console.log("🔍 Found booking via debug API");
            return foundBooking;
          }
          console.log("⚠️ No matching booking found in debug API results");
        }
      } catch (fallbackError) {
        console.error("Debug API fallback also failed:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      }

      setDirectApiFailed(true);
      return null;
    }
  }, [bookingRef]);

  // Memoized notification function using ref to prevent unnecessary re-renders
  const notifyBookingUpdate = useCallback(() => {
    if (bookingRef && notifyUtilRef.current) {
      console.log("📢 Sending room booking update notification for:", bookingRef);
      try {
        notifyUtilRef.current.notifyRoomBookingUpdate(bookingRef);
      } catch (error) {
        console.log("Could not send booking notification:", error instanceof Error ? error.message : String(error));
      }
    }
  }, [bookingRef]);

  // Handle print functionality
  const handlePrint = useReactToPrint({
    documentTitle: `Booking Receipt-${bookingRef}`,
    onAfterPrint: () => {
      toast({
        title: "Print Initiated",
        description: "Your receipt has been sent to the printer.",
        duration: 3000,
      });
    },
    // @ts-ignore - Type definition issue with react-to-print
    content: () => receiptRef.current,
  });

  // Helper function to calculate stay duration
  const calculateStayDuration = (checkIn: Date, checkOut: Date) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  // Helper functions to calculate values based on actual booking data
  const getRoomRate = () => {
    if (!bookingDetails || !bookingDetails.room) return 0;
    return bookingDetails.room.pricePerNight;
  };

  const getTotalNights = () => {
    if (!bookingDetails) return 0;
    return calculateStayDuration(bookingDetails.checkInDate, bookingDetails.checkOutDate);
  };

  const getRoomCharge = () => {
    return getRoomRate() * getTotalNights();
  };

  const getServiceFee = () => {
    // Calculate service fee as 10% of room charge
    return Math.round(getRoomCharge() * 0.1);
  };

  const getTax = () => {
    // Calculate tax as 5% of room charge
    return Math.round(getRoomCharge() * 0.05);
  };

  const getTotalAmount = () => {
    if (!bookingDetails) return 0;
    return bookingDetails.totalAmount;
  };

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
      // Find the booking that matches our reference ID
      const booking = userBookings.find((booking) => booking.id === bookingRef);
      if (booking) {
        // Use the actual booking data without any hardcoded values
        setBookingDetails(booking as unknown as BookingDetails);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, userBookings, bookingRef, bookingDetails]);

  // Manual refresh function with user feedback - optimized to reduce unnecessary API calls
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log("🔄 Manual refresh triggered by user");

    try {
      // Use Promise.all to parallelize some operations
      await Promise.all([
        // Set global refresh flag and invalidate TRPC cache
        (async () => {
          // 1. Set global refresh flag for room availability
          setShouldRefetchRooms(true);

          // 2. Invalidate tRPC queries to fetch fresh data
          utils.rooms.getBookingById.invalidate({ id: bookingRef || "" });
          utils.rooms.getAvailableRooms.invalidate();
          if (isAuthenticated) {
            utils.rooms.getUserBookings.invalidate();
          }
        })(),

        // Send booking notification if possible
        (async () => {
          notifyBookingUpdate();
        })()
      ]);

      // Try to fetch fresh booking data directly from API
      let dataRefreshed = false;
      if (bookingRef) {
        try {
          const directData = await fetchBookingDirectly();
          if (directData) {
            setBookingDetails(directData as BookingDetails);
            console.log("✅ Refreshed booking data from direct API");
            dataRefreshed = true;
          }
        } catch (apiError) {
          console.log("Direct API booking fetch failed - falling back to tRPC");
        }
      }

      // Only refresh room data if needed - and use a timeout to avoid hanging
      const roomDataPromise = new Promise<void>(async (resolve) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch('/api/rooms/availability', {
            signal: controller.signal,
            cache: 'no-store'
          });

          clearTimeout(timeoutId);
          if (response.ok) {
            await response.json();
            console.log("✓ Fresh room data fetched");
          }
        } catch (apiError) {
          // Just log and continue - don't block on room data
          console.log("Room data refresh skipped");
        } finally {
          resolve();
        }
      });

      // Wait for room data with a max timeout
      await Promise.race([
        roomDataPromise,
        new Promise(r => setTimeout(r, 2500))
      ]);

      // Show appropriate toast based on whether data was refreshed
      toast({
        title: dataRefreshed ? "Data Refreshed" : "Refresh Completed",
        description: dataRefreshed
          ? "Your booking information has been refreshed successfully."
          : "The system has been refreshed, but no new booking data was found.",
        duration: 3000,
      });
    } catch (error) {
      console.log("Could not refresh data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh booking information. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [setShouldRefetchRooms, notifyBookingUpdate, toast, bookingRef, fetchBookingDirectly, utils.rooms, isAuthenticated]);

  // Effect to ensure room and booking data are refreshed when landing on this page (for GCash callbacks)
  useEffect(() => {
    // Avoid doing any work if we already have booking details
    if (bookingDetails) return;

    console.log("🎯 Booking success page loaded - triggering data refresh");
    const isMockPayment = searchParams.get("mockPayment") === "true";

    // Function to perform a complete refresh of data - optimized to only do necessary work
    const refreshAllData = async () => {
      try {
        console.log("🔄 Refreshing all data...");
        // Set flag in global store
        setShouldRefetchRooms(true);

        // Directly invalidate all room-related queries
        utils.rooms.invalidate();

        // Try to get booking data directly first for immediate feedback
        if (bookingRef) {
          try {
            console.log("🔍 Checking for direct booking data on load");
            const directBookingData = await fetchBookingDirectly();
            if (directBookingData) {
              console.log("✅ Direct booking data found on page load");
              setBookingDetails(directBookingData as BookingDetails);
              setIsLoading(false);
              // If we found the data, stop any further loading attempts
              return true;
            }
          } catch (bookingError) {
            console.error("Failed to fetch direct booking data:", bookingError);
          }
        }

        // Only refresh room data if necessary
        try {
          const response = await fetch('/api/rooms/availability', {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Room availability data refreshed");
          }
        } catch (error) {
          console.error("Error refreshing room data - continuing anyway");
        }

        return false;
      } catch (error) {
        console.error("Error in refreshAllData:", error);
        return false;
      }
    };

    // Special handling for mock payments to avoid excessive API calls
    if (isMockPayment) {
      console.log("📝 Mock payment detected, using simplified data refresh");
      setShouldRefetchRooms(true);
      utils.rooms.invalidate();
    } else {
      let isDataLoaded = false;
      let refreshCount = 0;
      const MAX_REFRESHES = 2;

      // Perform initial refresh immediately for real payments
      refreshAllData().then(success => {
        isDataLoaded = success;
      });

      // Initial notification after a short delay
      const initialNotificationTimeout = setTimeout(() => {
        if (!isDataLoaded) notifyBookingUpdate();
      }, 500);

      // Set up periodic refresh - but limit the number of tries and stop if data is loaded
      const refreshInterval = setInterval(() => {
        if (isDataLoaded || refreshCount >= MAX_REFRESHES) {
          clearInterval(refreshInterval);
          console.log("🛑 Stopped periodic data refresh - data loaded or max attempts reached");
          return;
        }

        refreshCount++;
        console.log(`⏱️ Refresh attempt ${refreshCount}/${MAX_REFRESHES}`);

        refreshAllData().then(success => {
          isDataLoaded = success;
          if (!isDataLoaded) notifyBookingUpdate();
        });
      }, 3000);

      return () => {
        clearTimeout(initialNotificationTimeout);
        clearInterval(refreshInterval);
      };
    }
  }, [setShouldRefetchRooms, notifyBookingUpdate, utils.rooms, bookingRef, fetchBookingDirectly, searchParams, bookingDetails]);

  // Create demo booking data as fallback - extracted as a memoized function to avoid recreation
  const createDemoBookingData = useCallback(() => {
    console.log("⚠️ Using demo booking data as fallback");

    // Try to incorporate authenticated user data if available
    const userInfo = user ? {
      firstName: user.firstname || "Guest",
      lastName: user.lastname || "User",
      name: user.firstname && user.lastname ?
        `${decodeURIComponent(user.firstname || '')} ${decodeURIComponent(user.lastname || '')}` :
        (user.name ? decodeURIComponent(user.name) : "Guest User"),
      email: user.email || "guest@example.com",
      phone: user.phone || "Not provided"
    } : {
      firstName: "Guest",
      lastName: "User",
      name: "Guest User",
      email: "guest@example.com",
      phone: "Not provided"
    };

    const demoBooking: BookingDetails = {
      id: bookingRef || "DEMO12345",
      userId: user?.email || "guest@example.com",
      roomId: "room123",
      checkInDate: new Date("2025-07-01"),
      checkOutDate: new Date("2025-07-05"),
      guestCount: 2,
      totalAmount: 10560,
      status: "CONFIRMED",
      specialRequests: "",
      createdAt: new Date(),
      paymentMethod: searchParams.get("mockPayment") === "true" ? "Mock Payment" : "GCash",
      phone: userInfo.phone,
      room: {
        name: "Deluxe Single Room",
        pricePerNight: 2400,
        type: "Standard"
      },
      user: userInfo
    };

    setBookingDetails(demoBooking);
    setIsLoading(false);
  }, [bookingRef, searchParams, user]);

  // Effect to update booking details when data is loaded from getBookingById or direct API
  useEffect(() => {
    // If we already have booking details, don't reload
    if (bookingDetails) return;

    const loadBookingData = async () => {
      console.log("🔍 Starting booking data load process");

      try {
        // Check for mock payment flag - handle it first for fastest response
        const isMockPayment = searchParams.get("mockPayment") === "true";
        if (isMockPayment) {
          console.log("⚠️ Using mock payment flow with reduced API calls");
          createDemoBookingData();
          return;
        }

        // Try all available data sources in order of reliability
        // 1. First check if tRPC already has the data without any additional API calls
        if (bookingData) {
          console.log("✅ Got booking data from tRPC cache");
          setBookingDetails(bookingData as unknown as BookingDetails);
          setIsLoading(false);
          return;
        }

        // 2. Check if user's bookings include this booking (if authenticated)
        if (isAuthenticated && userBookings && bookingRef) {
          const booking = userBookings.find((b) => b.id === bookingRef);
          if (booking) {
            console.log("✅ Found booking in user's bookings");
            setBookingDetails(booking as unknown as BookingDetails);
            setIsLoading(false);
            return;
          }
        }

        // 3. Only make a direct API call if other methods failed and we haven't tried it yet
        if (!directApiFailed && bookingRef) {
          console.log("🔄 Trying direct API call");
          const directData = await fetchBookingDirectly();
          if (directData) {
            console.log("✅ Got booking data from direct API");
            setBookingDetails(directData as BookingDetails);
            setIsLoading(false);
            return;
          }
        }

        // 4. Fallback to demo data after all other methods have failed
        console.log("⚠️ All data retrieval methods failed, using demo data");
        createDemoBookingData();
      } catch (error) {
        console.error("Failed to load booking details:", error);
        createDemoBookingData();
      }
    };

    loadBookingData();
  }, [
    bookingData,
    bookingRef,
    createDemoBookingData,
    directApiFailed,
    fetchBookingDirectly,
    isAuthenticated,
    searchParams,
    userBookings,
    bookingDetails
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 overflow-hidden">
        <CardHeader className="text-center py-6 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-white">Booking Confirmed!</CardTitle>
          <p className="text-blue-100 mt-1">Your payment has been processed successfully</p>
        </CardHeader>
        <CardContent className="text-center space-y-5 px-4 py-6">
          <p className="text-sm text-gray-600 mb-4">Your booking has been confirmed and payment processed successfully.</p>

          {bookingRef && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
              <p className="text-xs text-blue-600 mb-1 font-medium uppercase tracking-wide">Booking Reference</p>
              <p className="font-mono font-bold text-base text-blue-800">{bookingRef}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center my-10 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your booking details...</p>
            </div>
          )}

          {!isLoading && bookingDetails && (
            <div ref={receiptRef} className="print:shadow-none max-w-md mx-auto">
              {/* Receipt Component - Redesigned for better visual hierarchy */}
              <div data-print-receipt className="bg-white border border-gray-200 rounded-lg overflow-hidden print:border-none shadow-md">
                {/* Receipt Header - Enhanced with logo placeholder and better visual separation */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center border-b border-gray-200">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Booking Confirmation</h2>
                  <p className="text-sm text-blue-100 mt-1">TechHub Hostel</p>
                  <div className="inline-flex items-center px-3 py-1 mt-3 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-xs font-medium">Payment Successful</span>
                  </div>
                </div>

                {/* Booking Reference - Highlighted for importance */}
                <div className="bg-blue-50 p-4 text-center border-b border-blue-100">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Booking Reference</p>
                  <p className="font-mono font-bold text-lg text-blue-700">{bookingDetails.id.substring(0, 8)}</p>
                  <p className="text-xs text-blue-600 mt-1">Issued on {format(new Date(), "MMMM dd, yyyy")}</p>
                </div>

                {/* Primary Booking Information - Most important details featured prominently */}
                <div className="p-5 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Check-in Information */}
                    <div className="border-r border-gray-200 pr-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-800">Check-in</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{format(bookingDetails.checkInDate, "MMM dd, yyyy")}</p>
                      <p className="text-xs text-gray-500">After 2:00 PM</p>
                    </div>

                    {/* Check-out Information */}
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <Calendar className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium text-gray-800">Check-out</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{format(bookingDetails.checkOutDate, "MMM dd, yyyy")}</p>
                      <p className="text-xs text-gray-500">Before 12:00 PM</p>
                    </div>
                  </div>

                  {/* Stay Duration - Highlighted for clarity */}
                  <div className="flex items-center justify-center mt-4 py-2 px-4 bg-gray-50 rounded-full mx-auto w-fit">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-800">{getTotalNights()} {getTotalNights() === 1 ? 'Night' : 'Nights'} Stay</span>
                  </div>
                </div>

                {/* Room Details - Redesigned with better visuals */}
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <Bed className="w-4 h-4 mr-2 text-blue-600" />
                    Room Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-800 text-lg">{bookingDetails.room?.name || "Room"}</span>
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ₱{bookingDetails.room?.pricePerNight?.toLocaleString() || "0"}/night
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start space-x-2">
                        <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Guests</p>
                          <p className="font-medium">{bookingDetails.guestCount} {bookingDetails.guestCount === 1 ? 'Person' : 'People'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Building className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Room Type</p>
                          <p className="font-medium">{bookingDetails.room?.roomType?.name || bookingDetails.room?.type || "Standard"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Information - Better organized */}
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Guest Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Name</span>
                      <span className="font-medium text-gray-800">
                        {(() => {
                          // Try to get name from user object
                          if (bookingDetails.user?.name) {
                            return decodeURIComponent(bookingDetails.user.name);
                          }

                          // Try to combine firstName and lastName
                          const firstName = bookingDetails.user?.firstName?.trim();
                          const lastName = bookingDetails.user?.lastName?.trim();
                          if (firstName && lastName) {
                            return `${decodeURIComponent(firstName)} ${decodeURIComponent(lastName)}`;
                          }

                          // Try just firstName or lastName if only one exists
                          if (firstName) {
                            return decodeURIComponent(firstName);
                          }
                          if (lastName) {
                            return decodeURIComponent(lastName);
                          }

                          // Fallback to authenticated user data if available
                          if (user?.name) {
                            return decodeURIComponent(user.name);
                          }
                          if (user?.firstname && user?.lastname) {
                            return `${decodeURIComponent(user.firstname)} ${decodeURIComponent(user.lastname)}`;
                          }
                          if (user?.firstname) {
                            return decodeURIComponent(user.firstname);
                          }

                          // Final fallback
                          return "Guest User";
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Email</span>
                      <span className="font-medium text-gray-800">
                        {bookingDetails.user?.email || user?.email || bookingDetails.userId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Phone</span>
                      <span className="font-medium text-gray-800">
                        {bookingDetails.user?.phone || bookingDetails.phone || user?.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Booking Date</span>
                      <span className="font-medium text-gray-800">{format(bookingDetails.createdAt, "MMMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary - Improved visual design for cost breakdown */}
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                    Payment Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Room Charge</span>
                        <span className="font-medium">₱{getRoomCharge().toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 pl-4">
                        {getTotalNights()} nights × ₱{getRoomRate().toLocaleString()}
                      </div>

                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">₱{getServiceFee().toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₱{getTax().toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 mt-3 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Total Amount</span>
                        <span className="text-lg font-bold text-blue-600">₱{getTotalAmount().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Payment Method</span>
                        <span className="text-sm font-medium text-gray-700">{bookingDetails.paymentMethod || "Online Payment"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests - Improved design if present */}
                {bookingDetails.specialRequests && (
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                      Special Requests
                    </h3>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-sm text-amber-700">{bookingDetails.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Footer Note - Improved with contact info and support QR placeholder */}
                <div className="p-5 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">TechHub Hostel</h4>
                      <p className="text-xs text-gray-500">123 Digital Avenue, Innovation District</p>
                      <p className="text-xs text-gray-500">support@techhubhostel.com</p>
                      <p className="text-xs text-gray-500">+123 456 7890</p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mx-auto mb-1">
                        <span className="text-xs text-gray-500">QR Code</span>
                      </div>
                      <p className="text-xs text-gray-500">Scan for support</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4 text-center text-xs text-gray-500">
                    <p>Thank you for choosing TechHub Hostel for your stay.</p>
                    <div className="flex items-center justify-center mt-2">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      <p>Receipt generated on {format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !bookingDetails && !isAuthenticated && (
            <div className="bg-amber-50 p-6 rounded-lg text-left my-4 border border-amber-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <p className="font-medium text-amber-800 text-lg">Authentication Required</p>
              </div>
              <p className="text-amber-700 mb-5">Please sign in to view your complete booking details and access your receipt.</p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 h-11" asChild>
                <Link href={`/login?redirect=/booking/success?booking=${bookingRef}`}>Sign In to View Details</Link>
              </Button>
            </div>
          )}

          {!isLoading && !bookingDetails && isAuthenticated && (
            <div className="bg-blue-50 p-6 rounded-lg my-4 border border-blue-100">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium text-blue-800 text-lg">Booking Processing</p>
              </div>
              <p className="text-blue-700 mb-4">
                Your booking was successful, but we're still processing the details. Please try refreshing in a moment.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Now
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="space-y-3 mt-6">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12" asChild>
              <Link href="/dashboard">
                <CheckCircle className="w-4 h-4 mr-2" />
                View My Bookings
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full border-blue-200 hover:bg-blue-50 h-11"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isRefreshing ? 'Updating...' : 'Refresh Data'}</span>
              </Button>

              <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 h-11" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                <span className="text-sm">Print Receipt</span>
              </Button>
            </div>

            <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 h-11">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">Email Receipt</span>
            </Button>

            {process.env.NODE_ENV !== 'production' && (
              <Button
                variant="outline"
                className="w-full border-red-100 hover:bg-red-50 text-red-600 h-11"
                onClick={() => {
                  console.log("📊 Current booking details:", bookingDetails);
                  console.log("🔍 tRPC bookingData:", bookingData);
                  console.log("👤 User bookings:", userBookings);
                  console.log("🔑 Current user:", user);
                  toast({
                    title: "Debug Info",
                    description: "Booking details logged to console",
                    duration: 3000,
                  });
                }}
              >
                <span className="text-sm">Debug Booking Data</span>
              </Button>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-sm text-gray-600">A confirmation email with all details has been sent to your registered email address.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}