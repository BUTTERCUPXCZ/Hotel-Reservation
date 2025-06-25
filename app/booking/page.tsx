"use client"

import { useState, useEffect } from "react"
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
import { useGCashPayment } from "@/hooks/useGCashPayment"
import AuthGuard from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { trpc } from "@/hooks/trpc"
import { useRoomStore } from "@/hooks/useRooms"

export default function BookingPage() {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get room store to trigger refetching on the rooms page
  const { setShouldRefetchRooms, setLastBookedRoomId } = useRoomStore();

  // Get parameters from URL
  const roomId = searchParams.get("roomId")
  const checkInParam = searchParams.get("checkIn")
  const checkOutParam = searchParams.get("checkOut")
  const guestsParam = searchParams.get("guests") || "1"

  // TRPC mutation for creating a booking
  const { mutateAsync: createBookingMutation } = trpc.rooms.createBooking.useMutation()

  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const { processPayment, isLoading: paymentLoading, error: paymentError } = useGCashPayment()

  // Fetch room data using tRPC
  const {
    data: roomData,
    isLoading: isRoomLoading,
    error: roomError
  } = trpc.rooms.getRoomById.useQuery(
    { id: roomId || "" },
    {
      enabled: !!roomId,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Parse the dates and calculate nights
  const checkIn = checkInParam || new Date().toISOString().split('T')[0];
  const checkOut = checkOutParam || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const guests = parseInt(guestsParam, 10);

  // Transform room data for UI
  const room = roomData ? {
    id: roomData.id,
    name: roomData.name || "Room",
    description: roomData.description || "No description available",
    price: roomData.pricePerNight,
    image: roomData.imageUrl || "/placeholder.svg?height=200&width=400",
    capacity: roomData.maxOccupancy,
    floor: roomData.roomType?.name || "Standard",
    amenities: roomData.amenities ? roomData.amenities.split(',') : ["Free WiFi", "Air Conditioning"],
  } : {
    id: "dorm-4",
    name: "Shared Dorm (4 beds)",
    description: "Perfect for budget travelers",
    price: 800,
    image: "/placeholder.svg?height=200&width=400",
    capacity: 4,
    floor: "2nd Floor",
    amenities: ["Free WiFi", "Air Conditioning", "Shared Bathroom"],
  }

  const subtotal = room.price * nights
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee

  const validateForm = () => {
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
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Check if room exists
      if (!roomData || !roomId) {
        throw new Error("Room information is missing");
      }

      // Check if user is authenticated before proceeding
      if (!isAuthenticated) {
        // If not authenticated, redirect to login page with return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
        return;
      }

      console.log("User authenticated status:", isAuthenticated);
      console.log("Current user:", user);

      // Verify user data for booking
      if (!user || !user.email) {
        throw new Error("User information is missing. Please log out and log in again.");
      }

      // Show booking processing UI element
      setBookingSuccess(false);

      // Prepare the booking data - used for all payment methods
      const bookingData = {
        roomId: roomId,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        guestCount: guests,
        specialRequests: formData.specialRequests || "",
        totalAmount: total,
      };

      console.log("Preparing booking with data:", bookingData);

      // For card payment or pay at property, create the booking in the database
      if (paymentMethod === "card" || paymentMethod === "cash") {
        // First, check authentication status via the debug API to ensure cookies are set properly
        const authResponse = await fetch(`/api/auth-debug`);
        const authResult = await authResponse.json();
        console.log("Auth debug result:", authResult);

        if (!authResult.auth?.isAuthenticated) {
          console.error("Auth debug shows user is not authenticated");
          throw new Error("Authentication issue detected. Please log out and log in again.");
        }

        // Log the booking creation attempt
        console.log("Creating booking for:", user.email, "Room:", roomId);

        let bookingId;
        let bookingCreated = false;
        let errorDetails = "";

        // Try using the direct API first as it's more reliable for debugging
        try {
          console.log("Attempting booking via direct API...");
          const directResponse = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
          });

          const result = await directResponse.json();

          if (directResponse.ok && result.success) {
            console.log("✅ Booking created successfully via direct API:", result.booking);
            bookingId = result.booking.id;
            bookingCreated = true;
          } else {
            console.error("❌ Direct API booking failed:", result);
            errorDetails = result.error || "Unknown error from direct API";

            // If direct API fails, try the tRPC mutation as fallback
            console.log("Falling back to tRPC mutation...");
            const booking = await createBookingMutation(bookingData);
            console.log("✅ Booking created successfully via tRPC:", booking);
            bookingId = booking.id;
            bookingCreated = true;
          }
        } catch (apiError) {
          console.error("API error during booking creation:", apiError);

          // Try tRPC as a last resort if both approaches haven't been tried
          if (!bookingCreated) {
            try {
              console.log("Final attempt via tRPC...");
              const booking = await createBookingMutation(bookingData);
              console.log("✅ Booking created successfully on final attempt:", booking);
              bookingId = booking.id;
              bookingCreated = true;
            } catch (finalError) {
              console.error("All booking attempts failed:", finalError);
              errorDetails = errorDetails || (finalError instanceof Error ? finalError.message : "Unknown error");
              throw new Error(`Failed to create booking: ${errorDetails}`);
            }
          }
        }          // If we got here and booking was created, show success and redirect
        if (bookingCreated && bookingId) {
          // Show temporary success message before redirect
          setBookingSuccess(true);

          // Trigger room list refresh
          setLastBookedRoomId(roomId);
          setShouldRefetchRooms(true);

          // Redirect to success page after a brief delay to show success message
          setTimeout(() => {
            router.push(`/booking/success?booking=${bookingId}`);
          }, 1500);
          return;
        } else {
          throw new Error("Booking creation failed. Please try again.");
        }
      }

      // If GCash payment is selected, create booking record first, then process payment
      if (paymentMethod === "gcash") {
        try {
          // Create a booking record first with status "PENDING_PAYMENT"
          console.log("Creating pending booking before GCash payment...");

          // Use modified booking data for pending payment
          const pendingBookingData = {
            ...bookingData,
            status: "PENDING_PAYMENT"  // This will be updated upon successful payment
          };

          let pendingBookingId;

          try {
            // Create pending booking via direct API
            const directResponse = await fetch('/api/bookings/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(pendingBookingData),
            });

            const result = await directResponse.json();

            if (directResponse.ok && result.success) {
              console.log("✅ Pending booking created for GCash payment:", result.booking);
              pendingBookingId = result.booking.id;
            } else {
              throw new Error(result.error || "Failed to create pending booking");
            }
          } catch (bookingError) {
            console.error("Failed to create pending booking:", bookingError);
            throw new Error("Failed to prepare payment. Please try again.");
          }

          // Now process the GCash payment using the booking ID from our database
          console.log("Initiating GCash payment for booking:", pendingBookingId);

          // Mark the room for refetch in the rooms page
          setLastBookedRoomId(roomId);
          setShouldRefetchRooms(true);

          await processPayment({
            amount: total,
            description: `HostelHub Booking - ${room.name}`,
            bookingId: pendingBookingId, // Use actual booking ID from database
            successUrl: `${window.location.origin}/booking/success?booking=${pendingBookingId}`,
            failureUrl: `${window.location.origin}/booking/failed?booking=${pendingBookingId}`,
          });

          // Payment processing will redirect to GCash, so we don't continue here
          return;
        } catch (paymentError) {
          console.error("GCash payment preparation failed:", paymentError);
          throw new Error("Failed to process payment: " +
            (paymentError instanceof Error ? paymentError.message : "Payment initialization error"));
        }
      }
    } catch (error: any) {
      console.error("Booking failed:", error);
      setBookingSuccess(false);

      // Get detailed error information for debugging
      if (error && typeof error === 'object') {
        if (error.shape && error.shape.message) {
          console.error("TRPC error details:", error.shape);
        }

        if (error.cause) {
          console.error("Error cause:", error.cause);
        }

        if (error.stack) {
          console.error("Error stack:", error.stack);
        }
      }

      // Handle different error types with detailed messages
      let errorMessage = "Booking failed. Please try again.";
      let errorDetails = "";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle TRPC errors which have a shape property
        if ('shape' in error && error.shape && typeof error.shape === 'object') {
          if ('message' in error.shape) {
            errorMessage = String(error.shape.message);
          }
          if ('data' in error.shape) {
            errorDetails = JSON.stringify(error.shape.data);
          }
        } else if ('message' in error) {
          errorMessage = String(error.message);
        }
      }

      // Try to determine if it's an authentication issue
      if (
        errorMessage.toLowerCase().includes('authentication') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('login') ||
        errorMessage.toLowerCase().includes('user not found')
      ) {
        // Force a re-login for authentication issues
        alert("Your session has expired. Please log in again.");
        document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('user');

        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
        return;
      }

      // Set a descriptive error in the UI
      setErrors({
        submit: `${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`
      });

      // Scroll to the error message
      setTimeout(() => {
        document.querySelector('.text-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Set user's name and email from auth context if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstname || user.name?.split(' ')[0] || prev.firstName,
        lastName: user.lastname || user.name?.split(' ')[1] || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [isAuthenticated, user]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <Navbar currentPath="/booking" />
        </header>

        {/* Authentication status banner */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border-yellow-500 border-l-4 p-4 mb-4">
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

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

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

                    {paymentMethod === "gcash" && (
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
                    )}

                    {paymentMethod === "card" && (
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
                    )}

                    {paymentMethod === "cash" && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2">Pay at Property</h4>
                        <p className="text-sm text-muted-foreground">
                          You can pay the full amount when you arrive at the property. Please bring valid ID and the
                          booking confirmation.
                        </p>
                      </div>
                    )}
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
                        <Image src={room.image || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
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
                        <span>{checkIn}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-out
                        </span>
                        <span>{checkOut}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Guests
                        </span>
                        <span>{guests}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Nights</span>
                        <span>{nights}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Amenities */}
                    <div>
                      <h4 className="font-medium mb-2">Included Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          ₱{room.price.toLocaleString()} × {nights} nights
                        </span>
                        <span>₱{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>₱{serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₱{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        {bookingSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Your reservation has been successfully submitted. You will receive a confirmation email shortly.
                </p>
                <Link href="/dashboard">
                  <Button className="w-full">View My Bookings</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
