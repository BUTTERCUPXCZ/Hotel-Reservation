"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RoomCardSkeleton } from "@/components/loading-states"
import { useAuth } from "@/hooks/useAuth"
import { Navbar } from "@/components/navbar"
import {
  MapPin,
  Users,
  Star,
  Search,
  SlidersHorizontal,
  Heart,
  Share2,
  ChevronDown,
  Wifi,
  Car,
  Coffee,
  Shield,
  Tv,
  Bath,
  Snowflake,
  ChevronRight,
  Home,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function RoomsPage() {
  const [priceRange, setPriceRange] = useState([500, 3000])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<any[]>([])
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Simulate loading rooms data
  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockRooms = [
        {
          id: "dorm-4",
          name: "Shared Dorm (4 beds)",
          description: "Perfect for budget travelers looking for a social experience",
          price: 800,
          originalPrice: 1000,
          rating: 4.8,
          reviewCount: 124,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
          capacity: 4,
          floor: "2nd Floor",
          size: "20 sqm",
          amenities: ["Free WiFi", "Air Conditioning", "Shared Bathroom", "Lockers", "Reading Light"],
          features: ["wifi", "ac", "bathroom", "security"],
          popular: true,
          discount: 20,
          availability: "3 beds left",
        },
        {
          id: "dorm-6",
          name: "Shared Dorm (6 beds)",
          description: "Great value accommodation with modern facilities",
          price: 650,
          originalPrice: 750,
          rating: 4.6,
          reviewCount: 89,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400"],
          capacity: 6,
          floor: "2nd Floor",
          size: "25 sqm",
          amenities: ["Free WiFi", "Air Conditioning", "Shared Bathroom", "Lockers"],
          features: ["wifi", "ac", "bathroom"],
          discount: 13,
          availability: "5 beds left",
        },
        {
          id: "private",
          name: "Private Room",
          description: "Your own private sanctuary with premium amenities",
          price: 1500,
          rating: 4.9,
          reviewCount: 67,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400"],
          capacity: 2,
          floor: "3rd Floor",
          size: "15 sqm",
          amenities: ["Free WiFi", "Air Conditioning", "Private Bathroom", "TV", "Mini Fridge"],
          features: ["wifi", "ac", "bathroom", "tv", "fridge"],
          availability: "2 rooms left",
        },
        {
          id: "deluxe",
          name: "Deluxe Private Room",
          description: "Premium comfort with luxury touches and city views",
          price: 2000,
          rating: 4.9,
          reviewCount: 45,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400"],
          capacity: 2,
          floor: "4th Floor",
          size: "18 sqm",
          amenities: ["Free WiFi", "Air Conditioning", "Private Bathroom", "TV", "Mini Fridge", "City View"],
          features: ["wifi", "ac", "bathroom", "tv", "fridge"],
          availability: "1 room left",
        },
        {
          id: "family",
          name: "Family Room",
          description: "Spacious accommodation perfect for families and groups",
          price: 2200,
          rating: 4.7,
          reviewCount: 78,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400"],
          capacity: 6,
          floor: "1st Floor",
          size: "30 sqm",
          amenities: ["Free WiFi", "Air Conditioning", "Private Bathroom", "TV", "Kitchenette", "Balcony"],
          features: ["wifi", "ac", "bathroom", "tv", "kitchen"],
          availability: "Available",
        },
        {
          id: "suite",
          name: "Executive Suite",
          description: "Luxury accommodation with premium amenities and services",
          price: 3500,
          rating: 5.0,
          reviewCount: 23,
          image: "/placeholder.svg?height=300&width=400",
          images: ["/placeholder.svg?height=300&width=400"],
          capacity: 4,
          floor: "5th Floor",
          size: "35 sqm",
          amenities: [
            "Free WiFi",
            "Air Conditioning",
            "Private Bathroom",
            "TV",
            "Mini Fridge",
            "Balcony",
            "Room Service",
          ],
          features: ["wifi", "ac", "bathroom", "tv", "fridge", "balcony"],
          availability: "Available",
        },
      ]

      setRooms(mockRooms)
      setIsLoading(false)
    }

    loadRooms()
  }, [])

  const getFeatureIcon = (feature: string) => {
    const icons = {
      wifi: <Wifi className="w-4 h-4" />,
      ac: <Snowflake className="w-4 h-4" />,
      bathroom: <Bath className="w-4 h-4" />,
      tv: <Tv className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      parking: <Car className="w-4 h-4" />,
      kitchen: <Coffee className="w-4 h-4" />,
    }
    return icons[feature as keyof typeof icons] || null
  }

  const toggleFavorite = (roomId: string) => {
    setFavorites((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }

  const handleBookNow = async (roomId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking?room=${roomId}`)
      return
    }

    setBookingLoading(roomId)
    // Simulate booking process
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/booking?room=${roomId}`)
    setBookingLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <Navbar currentPath="/rooms" />
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
            <span className="text-foreground font-medium">Available Rooms</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Room</h1>
          <p className="text-lg text-gray-600">Discover comfortable accommodations tailored to your needs</p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search rooms by name, type, or amenities..." className="pl-10 h-12" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 px-4">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
                <Select>
                  <SelectTrigger className="w-48 h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Check-in & Check-out</h3>
                    <div className="space-y-2">
                      <Input type="date" />
                      <Input type="date" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Guests</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                        <SelectItem value="5">5+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={5000}
                        min={500}
                        step={100}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₱{priceRange[0]}</span>
                        <span>₱{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Room Type</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Shared Dorm</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Private Room</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Family Room</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{rooms.length} rooms available</h2>
                <p className="text-sm text-gray-600">Showing results for your search</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Rooms Grid */}
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="relative">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={room.image || "/placeholder.svg"}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {room.popular && (
                        <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">Popular</Badge>
                      )}
                      {room.discount && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">-{room.discount}%</Badge>
                      )}
                      <div className="absolute bottom-3 right-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => toggleFavorite(room.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${favorites.includes(room.id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </Button>
                        <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                      </div>
                      <div className="flex items-center ml-4">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium text-sm">{room.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({room.reviewCount})</span>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{room.capacity} guests</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{room.floor}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{room.size}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center space-x-3 mb-4">
                      {room.features.slice(0, 4).map((feature: string) => (
                        <div
                          key={feature}
                          className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full"
                        >
                          {getFeatureIcon(feature)}
                        </div>
                      ))}
                      {room.features.length > 4 && (
                        <span className="text-xs text-gray-500">+{room.features.length - 4} more</span>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${room.availability.includes("left")
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                          }`}
                      >
                        {room.availability}
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    {/* Pricing and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">₱{room.price.toLocaleString()}</span>
                          {room.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₱{room.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">per night</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/rooms/${room.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                        <Button size="sm" onClick={() => handleBookNow(room.id)} disabled={bookingLoading === room.id}>
                          {bookingLoading === room.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Loading...
                            </>
                          ) : (
                            "Book Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Rooms
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
