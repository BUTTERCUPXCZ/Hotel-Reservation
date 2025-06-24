"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RoomDetailsSkeleton } from "@/components/loading-states"
import { useAuth } from "@/hooks/useAuth"
import { Navbar } from "@/components/navbar"
import {
  MapPin,
  Users,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Coffee,
  Shield,
  Tv,
  Bath,
  Snowflake,
  Home,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

export default function RoomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [room, setRoom] = useState<any>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  const { isAuthenticated } = useAuth()

  // Simulate loading room data
  useEffect(() => {
    const loadRoom = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock room data - in real app, this would come from API based on roomId
      const mockRoom = {
        id: roomId,
        name: "Shared Dorm (4 beds)",
        description: "Perfect for budget travelers looking for a social experience in the heart of the city",
        longDescription:
          "Our shared dorm rooms offer the perfect balance of comfort, affordability, and social interaction. Each bed comes with privacy curtains, personal reading light, and secure locker. The room features modern air conditioning, high-speed WiFi, and is cleaned daily by our housekeeping team.",
        price: 800,
        originalPrice: 1000,
        rating: 4.8,
        reviewCount: 124,
        images: [
          "/placeholder.svg?height=400&width=600&text=Room+Interior",
          "/placeholder.svg?height=400&width=600&text=Bathroom",
          "/placeholder.svg?height=400&width=600&text=Common+Area",
          "/placeholder.svg?height=400&width=600&text=Exterior+View",
        ],
        capacity: 4,
        floor: "2nd Floor",
        size: "20 sqm",
        bedType: "Bunk beds with privacy curtains",
        checkInTime: "3:00 PM",
        checkOutTime: "11:00 AM",
        amenities: [
          { name: "Free WiFi", icon: "wifi", description: "High-speed internet throughout the property" },
          { name: "Air Conditioning", icon: "ac", description: "Climate controlled for your comfort" },
          { name: "Shared Bathroom", icon: "bathroom", description: "Clean, modern shared facilities" },
          { name: "Security Lockers", icon: "security", description: "Secure storage for your belongings" },
          { name: "Reading Light", icon: "light", description: "Personal LED reading light for each bed" },
          { name: "Privacy Curtains", icon: "curtain", description: "Individual privacy curtains for each bed" },
        ],
        features: ["wifi", "ac", "bathroom", "security", "parking", "coffee"],
        policies: [
          "Check-in: 3:00 PM - 11:00 PM",
          "Check-out: 8:00 AM - 11:00 AM",
          "Quiet hours: 10:00 PM - 8:00 AM",
          "No smoking inside the property",
          "Maximum 2 guests per booking",
          "Valid ID required at check-in",
        ],
        location: {
          address: "123 Hostel Street, Makati City, Metro Manila",
          nearby: ["Mall of Asia - 2km", "Rizal Park - 1.5km", "Airport - 15km", "Train Station - 500m"],
        },
        availability: "3 beds available",
        popular: true,
        discount: 20,
      }

      setRoom(mockRoom)
      setIsLoading(false)
    }

    loadRoom()
  }, [roomId])

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "2 days ago",
      comment: "Amazing hostel! Clean, comfortable, and great location. The staff was super helpful and friendly.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 4,
      date: "1 week ago",
      comment: "Good value for money. The room was clean and the WiFi was fast. Would definitely stay again.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emma Wilson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Perfect for solo travelers! Met some great people and the location is unbeatable.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const similarRooms = [
    {
      id: "dorm-6",
      name: "Shared Dorm (6 beds)",
      price: 650,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "private",
      name: "Private Room",
      price: 1500,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const getFeatureIcon = (feature: string) => {
    const icons = {
      wifi: <Wifi className="w-5 h-5" />,
      ac: <Snowflake className="w-5 h-5" />,
      bathroom: <Bath className="w-5 h-5" />,
      tv: <Tv className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      parking: <Car className="w-5 h-5" />,
      coffee: <Coffee className="w-5 h-5" />,
    }
    return icons[feature as keyof typeof icons] || null
  }

  const nextImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleReserveNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking?room=${roomId}&checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)
      return
    }

    setBookingLoading(true)
    // Simulate booking process
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/booking?room=${roomId}&checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)
    setBookingLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <span className="text-xl font-bold">HostelHub</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RoomDetailsSkeleton />
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    )
  }

  const nights = calculateNights()
  const subtotal = room.price * nights
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <Navbar currentPath={`/rooms/${roomId}`} />
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/rooms" className="hover:text-foreground transition-colors">
              Rooms
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{room.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Room Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              {room.popular && <Badge className="bg-orange-500">Popular</Badge>}
              {room.discount && <Badge className="bg-red-500">-{room.discount}% OFF</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{room.rating}</span>
                <span className="ml-1">({room.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{room.location.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              <span>Save</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={room.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${room.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {room.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {room.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    className={`relative h-20 rounded-lg overflow-hidden ${index === currentImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Room Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{room.longDescription}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Capacity:</span>
                    <div className="flex items-center mt-1">
                      <Users className="w-4 h-4 mr-1" />
                      {room.capacity} guests
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>
                    <div className="mt-1">{room.size}</div>
                  </div>
                  <div>
                    <span className="font-medium">Bed Type:</span>
                    <div className="mt-1">{room.bedType}</div>
                  </div>
                  <div>
                    <span className="font-medium">Floor:</span>
                    <div className="mt-1">{room.floor}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.amenities.map((amenity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full mt-1">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{amenity.name}</div>
                        <div className="text-sm text-gray-600">{amenity.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>House Rules & Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Check-in/out Times
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Check-in: {room.checkInTime}</div>
                      <div>Check-out: {room.checkOutTime}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Important Policies</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {room.policies.slice(2).map((policy: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {policy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Rooms */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarRooms.map((similarRoom) => (
                    <Link key={similarRoom.id} href={`/rooms/${similarRoom.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <div className="relative h-32">
                          <Image
                            src={similarRoom.image || "/placeholder.svg"}
                            alt={similarRoom.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{similarRoom.name}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-sm">{similarRoom.rating}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">₱{similarRoom.price.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">per night</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">₱{room.price.toLocaleString()}</span>
                      {room.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₱{room.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{room.availability}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i > 0 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {checkIn && checkOut && nights > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>
                        ₱{room.price.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
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
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!checkIn || !checkOut || bookingLoading}
                  onClick={handleReserveNow}
                >
                  {bookingLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : checkIn && checkOut ? (
                    "Reserve Now"
                  ) : (
                    "Select Dates"
                  )}
                </Button>

                <p className="text-xs text-center text-gray-600">
                  {!isAuthenticated ? "You'll need to login to complete booking" : "You won't be charged yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
