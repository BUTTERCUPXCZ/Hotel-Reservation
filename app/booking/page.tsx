"use client"

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AuthGuard from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { trpc } from "@/hooks/trpc"
import { useRooms, useRoomStore } from "@/hooks/useRooms"
import { notifyRoomBookingUpdate } from "@/lib/utils"

// Lazy load heavy components
const Dialog = lazy(() => import("@/components/ui/dialog").then(module => ({
  default: module.Dialog
})))
const DialogContent = lazy(() => import("@/components/ui/dialog").then(module => ({
  default: module.DialogContent
})))
const DialogHeader = lazy(() => import("@/components/ui/dialog").then(module => ({
  default: module.DialogHeader
})))
const DialogTitle = lazy(() => import("@/components/ui/dialog").then(module => ({
  default: module.DialogTitle
})))
const DialogFooter = lazy(() => import("@/components/ui/dialog").then(module => ({
  default: module.DialogFooter
})))

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  capacity: number;
  floor: string;
  amenities: string[];
  numberofrooms?: number;
  roomType?: {
    name: string;
  };
  imageUrl?: string;
  maxOccupancy?: number;
  pricePerNight?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  gcashNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
  terms: boolean;
  cancellation: boolean;
}

// Memoized loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
)

// Memoized fallback component for lazy loading
const ComponentFallback = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

export default function BookingPage() {
  // All useState hooks must be at the top level and in consistent order
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastBookingId, setLastBookingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    gcashNumber: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
    terms: false,
    cancellation: false,
  })

  // All useContext hooks (from custom hooks) must be called consistently
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get room functions and state management - these must be called consistently
  const { markRoomAsBooked, refetchRooms } = useRooms();
  const { setShouldRefetchRooms } = useRoomStore();

  // Memoize search params parsing - must be called before any conditional logic
  const searchParamsData = useMemo(() => {
    const roomId = searchParams?.get("roomId") || ""
    const checkInParam = searchParams?.get("checkIn") || ""
    const checkOutParam = searchParams?.get("checkOut") || ""
    const guestsParam = searchParams?.get("guests") || "1"
    return { roomId, checkInParam, checkOutParam, guestsParam }
  }, [searchParams])

  const { roomId, checkInParam, checkOutParam, guestsParam } = searchParamsData

  // TRPC hooks must always be called in the same order
  const createBookingMutation = trpc.rooms.createBooking.useMutation()

  // Room query - always call this hook, use enabled to control execution
  const roomQuery = trpc.rooms.getRoomById.useQuery(
    { id: roomId },
    {
      enabled: !!roomId,
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      select: useCallback((data: any) => ({
        id: data.id,
        name: data.name || "Room",
        description: data.description || "No description available",
        pricePerNight: data.pricePerNight || 0,
        imageUrl: data.imageUrl,
        maxOccupancy: data.maxOccupancy || 1,
        numberofrooms: data.numberofrooms,
        amenities: data.amenities,
        roomType: data.roomType
      }), [])
    }
  )

  // Parse the dates and calculate nights
  const dateCalculations = useMemo(() => {
    const checkIn = checkInParam || new Date().toISOString().split('T')[0]
    const checkOut = checkOutParam || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const guests = parseInt(guestsParam, 10)

    return { checkIn, checkOut, checkInDate, checkOutDate, nights, guests }
  }, [checkInParam, checkOutParam, guestsParam])

  // Memoize room transformation
  const room = useMemo(() => {
    if (!roomQuery.data) {
      return {
        id: "dorm-4",
        name: "Shared Dorm (4 beds)",
        description: "Perfect for budget travelers",
        price: 800,
        image: "/placeholder.svg?height=200&width=400",
        capacity: 4,
        floor: "2nd Floor",
        amenities: ["Free WiFi", "Air Conditioning", "Shared Bathroom"],
      }
    }

    const data = roomQuery.data
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.pricePerNight,
      image: data.imageUrl || "/placeholder.svg?height=200&width=400",
      capacity: data.maxOccupancy,
      floor: data.roomType?.name || "Standard",
      amenities: data.amenities ? data.amenities.split(',') : ["Free WiFi", "Air Conditioning"],
      numberofrooms: data.numberofrooms
    }
  }, [roomQuery.data])

  // Memoize price calculations
  const priceCalculations = useMemo(() => {
    const subtotal = room.price * dateCalculations.nights
    const serviceFee = Math.round(subtotal * 0.1)
    const total = subtotal + serviceFee
    return { subtotal, serviceFee, total }
  }, [room.price, dateCalculations.nights])

  // Memoized validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!paymentMethod) newErrors.payment = "Please select a payment method"
    if (!formData.terms) newErrors.terms = "You must agree to the terms and conditions"
    if (!formData.cancellation) newErrors.cancellation = "You must understand the cancellation policy"

    // Payment method specific validation
    if (paymentMethod === "gcash" && !formData.gcashNumber.trim()) {
      newErrors.gcashNumber = "GCash number is required"
    }
    if (paymentMethod === "card") {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required"
      if (!formData.expiry.trim()) newErrors.expiry = "Expiry date is required"
      if (!formData.cvv.trim()) newErrors.cvv = "CVV is required"
      if (!formData.cardName.trim()) newErrors.cardName = "Name on card is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, paymentMethod])

  // Optimized form input handler
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  // Mock processPayment function for GCash (replace with your actual implementation)
  const processPayment = useCallback(async (paymentData: {
    amount: number;
    description: string;
    bookingId: string;
    successUrl: string;
    failureUrl: string;
  }) => {
    setPaymentLoading(true)
    try {
      // Replace this with your actual GCash payment implementation
      console.log("Processing GCash payment:", paymentData)
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Redirect to success URL on successful payment
      window.location.href = paymentData.successUrl
    } catch (error) {
      console.error("Payment processing failed:", error)
      throw error
    } finally {
      setPaymentLoading(false)
    }
  }, [])

  // Optimized submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log("🚀 Starting booking process...");

      if (!roomQuery.data || !roomId) {
        throw new Error("Room information is missing");
      }

      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
        return;
      }

      if (!user || !user.email) {
        throw new Error("User information is missing. Please log out and log in again.");
      }

      if (roomQuery.data.numberofrooms && roomQuery.data.numberofrooms <= 0) {
        throw new Error("Sorry, this room is no longer available. Please select another room.");
      }

      // Reset success state
      setBookingSuccess(false);

      // Prepare the booking data
      const bookingData = {
        roomId: roomId,
        checkInDate: new Date(dateCalculations.checkIn),
        checkOutDate: new Date(dateCalculations.checkOut),
        guestCount: dateCalculations.guests,
        specialRequests: formData.specialRequests || "",
        totalAmount: priceCalculations.total,
      };

      // For card payment or pay at property
      if (paymentMethod === "card" || paymentMethod === "cash") {
        let bookingId: string | undefined;

        const createWithApi = async () => {
          try {
            const response = await fetch('/api/bookings/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "API booking failed");
            }

            return await response.json();
          } catch (error) {
            console.log("API booking error:", error);
            throw error;
          }
        };

        const createWithTrpc = async () => {
          try {
            return await createBookingMutation.mutateAsync(bookingData);
          } catch (error) {
            console.error("tRPC booking error:", error);
            throw error;
          }
        };

        try {
          let booking;

          try {
            // Try API first
            booking = await createWithApi();
            console.log("Booking created with API:", booking);
          } catch (apiError) {
            console.log("API booking failed, falling back to tRPC");

            // If API fails, try tRPC
            try {
              booking = await createWithTrpc();
              console.log("Booking created with tRPC:", booking);
            } catch (trpcError) {
              console.error("tRPC booking also failed:", trpcError);
              throw new Error("All booking methods failed. Please try again later.");
            }
          }

          if (!booking) {
            throw new Error("Booking creation failed: No response received");
          }

          // Handle different response formats from API vs tRPC
          let bookingResponse: any;

          if ('booking' in booking && booking.booking) {
            bookingResponse = booking.booking;
          } else if ('id' in booking) {
            bookingResponse = booking;
          } else {
            throw new Error("Booking creation failed: Unknown response format");
          }

          if (!bookingResponse.id) {
            throw new Error("Booking creation failed: Invalid booking data returned");
          }

          bookingId = String(bookingResponse.id);
          setLastBookingId(bookingId);
          setBookingSuccess(true);
          setShowSuccessModal(true);

          // Update room availability
          try {
            await fetch('/api/rooms/availability', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: roomId,
                operation: 'decrement'
              })
            });
          } catch (updateError) {
            console.error("Error updating room availability:", updateError);
          }

          // Trigger room list refresh
          markRoomAsBooked(roomId);
          notifyRoomBookingUpdate(roomId);
          setShouldRefetchRooms(true);
          if (typeof refetchRooms === 'function') {
            refetchRooms();
          }

          setTimeout(() => {
            if (bookingId) {
              router.push(`/booking/success?booking=${bookingId}`);
            } else {
              router.push('/booking/success');
            }
          }, 1500);
          return;
        } catch (bookingError) {
          console.error("All booking creation methods failed:", bookingError);
          throw new Error("Unable to complete your booking. Please try again.");
        }
      }

      // GCash payment
      if (paymentMethod === "gcash") {
        try {
          const pendingBookingData = {
            ...bookingData,
            status: "PENDING_PAYMENT"
          };

          const response = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingBookingData),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to create pending booking");
          }

          const pendingBookingId = result.booking.id;

          // Mark the room for refetch
          markRoomAsBooked(roomId);
          notifyRoomBookingUpdate(roomId);
          setShouldRefetchRooms(true);
          if (typeof refetchRooms === 'function') {
            refetchRooms();
          }

          await processPayment({
            amount: priceCalculations.total,
            description: `HostelHub Booking - ${room.name}`,
            bookingId: pendingBookingId,
            successUrl: `${window.location.origin}/booking/success?booking=${pendingBookingId}`,
            failureUrl: `${window.location.origin}/booking/failed?booking=${pendingBookingId}`,
          });

          return;
        } catch (paymentError) {
          console.error("GCash payment preparation failed:", paymentError);
          throw new Error("Failed to process payment: " +
            (paymentError instanceof Error ? paymentError.message : "Payment initialization error"));
        }
      }
    } catch (error: unknown) {
      console.error("Booking failed:", error);
      setBookingSuccess(false);

      let errorMessage = "Booking failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'shape' in error) {
        const trpcError = error as { shape?: { message?: string, data?: unknown } };
        if (trpcError.shape?.message) {
          errorMessage = String(trpcError.shape.message);
        }
      }

      if (errorMessage.toLowerCase().includes('authentication') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('login') ||
        errorMessage.toLowerCase().includes('user not found')) {
        // Clear auth data and redirect to login
        document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('user');

        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
        return;
      }

      setErrors({
        submit: errorMessage
      });

      setTimeout(() => {
        document.querySelector('.text-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, roomQuery.data, isAuthenticated, user, dateCalculations, priceCalculations, formData, paymentMethod, roomId, room.name, createBookingMutation, markRoomAsBooked, notifyRoomBookingUpdate, setShouldRefetchRooms, refetchRooms, router, processPayment])

  // Auto-fill user data with memoization
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstname || user.name?.split(' ')[0] || prev.firstName,
        lastName: user.lastname || user.name?.split(' ')[1] || prev.lastName,
        email: user.email || prev.email
      }))
    }
  }, [isAuthenticated, user])

  // Memoized payment method components
  const PaymentMethodSection = useMemo(() => {
    if (paymentMethod === "gcash") {
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">GCash Payment</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You will be redirected to GCash to complete your payment securely.
          </p>
          <div className="space-y-2">
            <Label htmlFor="gcashNumber">GCash Mobile Number</Label>
            <Input
              id="gcashNumber"
              placeholder="+63 912 345 6789"
              value={formData.gcashNumber}
              onChange={(e) => handleInputChange("gcashNumber", e.target.value)}
              className={errors.gcashNumber ? "border-red-500" : ""}
            />
            {errors.gcashNumber && <p className="text-sm text-red-500 mt-1">{errors.gcashNumber}</p>}
          </div>
        </div>
      )
    }

    if (paymentMethod === "card") {
      return (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              className={errors.cardNumber ? "border-red-500" : ""}
            />
            {errors.cardNumber && <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) => handleInputChange("expiry", e.target.value)}
                className={errors.expiry ? "border-red-500" : ""}
              />
              {errors.expiry && <p className="text-sm text-red-500 mt-1">{errors.expiry}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                className={errors.cvv ? "border-red-500" : ""}
              />
              {errors.cvv && <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={formData.cardName}
              onChange={(e) => handleInputChange("cardName", e.target.value)}
              className={errors.cardName ? "border-red-500" : ""}
            />
            {errors.cardName && <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>}
          </div>
        </div>
      )
    }

    if (paymentMethod === "cash") {
      return (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium mb-2">Pay at Property</h4>
          <p className="text-sm text-muted-foreground">
            You can pay the full amount when you arrive at the property. Please bring valid ID and the
            booking confirmation.
          </p>
        </div>
      )
    }

    return null
  }, [paymentMethod, formData, errors, handleInputChange])

  // Handle loading state AFTER all hooks are called
  if (roomQuery.isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-100">
          <header className="border-b shadow-sm" style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
            <Navbar currentPath="/booking" />
          </header>
          <div className="container mx-auto px-4 pt-16 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 mt-8">
                <ComponentFallback className="h-10 w-80 mb-2" />
                <ComponentFallback className="h-6 w-96" />
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <ComponentFallback className="h-96" />
                  <ComponentFallback className="h-64" />
                </div>
                <div className="lg:col-span-1">
                  <ComponentFallback className="h-96" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <Navbar currentPath="/booking" />
        </header>

        {/* Authentication status banner */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border-yellow-500 border-l-4 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are not logged in. Please <a href="/login" className="font-medium underline hover:text-yellow-600">sign in</a> to save your booking details to your account.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 mt-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
              <p className="text-lg text-gray-600">Please fill in your details to secure your reservation</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Guest Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                    <CardDescription>Please provide your details for the reservation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={errors.firstName ? "border-red-500" : ""}
                          required
                        />
                        {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={errors.lastName ? "border-red-500" : ""}
                          required
                        />
                        {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                        required
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                        required
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                      <Textarea
                        id="specialRequests"
                        placeholder="Any special requests or requirements..."
                        rows={3}
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gcash"
                          name="payment"
                          value="gcash"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <Label htmlFor="gcash" className="flex items-center space-x-3 cursor-pointer">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">GCash</span>
                          </div>
                          <span>GCash</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="card"
                          name="payment"
                          value="card"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer">
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                          <span>Credit/Debit Card</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="cash"
                          name="payment"
                          value="cash"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <Label htmlFor="cash" className="flex items-center space-x-3 cursor-pointer">
                          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs">₱</span>
                          </div>
                          <span>Pay at Property</span>
                        </Label>
                      </div>
                    </div>

                    {PaymentMethodSection}
                    {errors.payment && <p className="text-sm text-red-500 mt-1">{errors.payment}</p>}
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1"
                          required
                          checked={formData.terms}
                          onChange={(e) => handleInputChange("terms", e.target.checked)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                        {errors.terms && <p className="text-sm text-red-500 mt-1">{errors.terms}</p>}
                      </div>
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="cancellation"
                          className="mt-1"
                          required
                          checked={formData.cancellation}
                          onChange={(e) => handleInputChange("cancellation", e.target.checked)}
                        />
                        <Label htmlFor="cancellation" className="text-sm">
                          I understand the{" "}
                          <Link href="/cancellation" className="text-primary hover:underline">
                            Cancellation Policy
                          </Link>
                        </Label>
                        {errors.cancellation && <p className="text-sm text-red-500 mt-1">{errors.cancellation}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Room Details */}
                    <div className="flex space-x-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={room.image}
                          alt={room.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          priority={false}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">{room.description}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Booking Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-in
                        </span>
                        <span>{dateCalculations.checkIn}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-out
                        </span>
                        <span>{dateCalculations.checkOut}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Guests
                        </span>
                        <span>{dateCalculations.guests}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Nights</span>
                        <span>{dateCalculations.nights}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          ₱{room.price.toLocaleString()} × {dateCalculations.nights} nights
                        </span>
                        <span>₱{priceCalculations.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>₱{priceCalculations.serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₱{priceCalculations.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isLoading || paymentLoading}
                    >
                      {isLoading || paymentLoading ? (
                        <>
                          <LoadingSpinner />
                          Processing...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>

                    {errors.submit && <p className="text-sm text-red-500 text-center mt-2">{errors.submit}</p>}

                    <p className="text-xs text-muted-foreground text-center">
                      You won't be charged yet. Review your booking details before final confirmation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal with Suspense */}
        <Suspense fallback={<ComponentFallback className="fixed inset-0 bg-black bg-opacity-50" />}>
          {showSuccessModal && (
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Booking Confirmed!</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="mb-4">Your booking was successful. You will receive a confirmation email shortly.</div>
                </div>
                <DialogFooter className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowSuccessModal(false)
                      router.push("/dashboard")
                    }}
                    variant="default"
                  >
                    View bookings
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </Suspense>
      </div>
    </AuthGuard>
  )
}