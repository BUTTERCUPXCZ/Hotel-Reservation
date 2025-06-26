"use client"

import { useState, useMemo, useEffect } from "react"
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
import { useRooms } from "@/hooks/useRooms"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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

// Define types for database Room and UI Room
interface DBRoom {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  maxOccupancy: number;
  isActive: boolean;
  numberofrooms: number;
  roomTypeId: string;
  createdAt: Date;
  updatedAt: Date;
  amenities: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  roomType: {
    id: string;
    name: string;
  };
}

interface UIRoom {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  capacity: number;
  floor: string;
  size: string;
  bedType: string;
  amenities: string[];
  features: string[];
  popular?: boolean;
  discount?: number;
  availability: string;
  roomType: string;
}

export default function RoomsPage() {
  const [priceRange, setPriceRange] = useState([500, 3000])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<string[]>([])
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)
  const [visibleRooms, setVisibleRooms] = useState(6)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Use our custom rooms hook for data fetching and real-time updates
  const {
    data: roomsData,
    isLoading,
    error,
    refetchRooms,
    lastBookedRoomId
  } = useRooms();

  const errorMessage = error?.message;// Transform the data to match the UI expectations with memoization
  const rooms: UIRoom[] = useMemo(() => {
    if (!roomsData) return [];

    return roomsData.map((room: DBRoom) => {
      // Safely parse amenities JSON string or provide default
      let amenitiesArray: string[] = ["Free WiFi", "Air Conditioning"];
      let featuresArray: string[] = ["wifi", "ac"]; if (room.amenities) {
        try {
          // Check if it's a JSON string
          if (room.amenities.startsWith('[') && room.amenities.endsWith(']')) {
            amenitiesArray = JSON.parse(room.amenities);
          } else {
            // If not valid JSON, treat as comma-separated string
            amenitiesArray = room.amenities.split(',').map(item => item.trim());
          }

          // Create a map for feature lookups
          const featureMap: Record<string, string> = {
            wifi: 'wifi',
            internet: 'wifi',
            air: 'ac',
            conditioning: 'ac',
            bath: 'bathroom',
            tv: 'tv',
            television: 'tv',
            kitchen: 'kitchen',
            parking: 'parking'
          };

          featuresArray = amenitiesArray
            .map((amenity: string) => {
              const lowercaseAmenity = amenity.toLowerCase();
              for (const [keyword, feature] of Object.entries(featureMap)) {
                if (lowercaseAmenity.includes(keyword)) return feature;
              }
              return '';
            })
            .filter(Boolean);
        } catch (e) {
          console.error("Failed to parse amenities:", e);
          // Fallback to treating it as a single item
          if (typeof room.amenities === 'string') {
            amenitiesArray = [room.amenities];
          }
        }
      } return {
        id: room.id,
        name: room.name,
        description: room.description || "Comfortable room with amenities",
        price: room.pricePerNight,
        rating: 4.8,
        reviewCount: 45,
        image: room.imageUrl || "/placeholder.svg?height=300&width=400",
        images: [room.imageUrl || "/placeholder.svg?height=300&width=400"],
        capacity: room.maxOccupancy,
        floor: `${Math.floor(Math.random() * 5) + 1}nd Floor`,
        size: `${room.maxOccupancy * 5} sqm`,
        bedType: room.roomType?.name || (room.maxOccupancy > 1 ? "Double/Twin" : "Single"),
        amenities: amenitiesArray,
        features: [...new Set(featuresArray)], // Remove duplicates
        availability: room.numberofrooms > 0
          ? `${room.numberofrooms} room${room.numberofrooms !== 1 ? 's' : ''} left`
          : "Fully booked",
        roomType: room.roomType?.name || "Standard Room",
      };
    });
  }, [roomsData]);
  // Memoize the feature icons for better performance
  const featureIconsMap = useMemo(() => ({
    wifi: <Wifi className="w-4 h-4" />,
    ac: <Snowflake className="w-4 h-4" />,
    bathroom: <Bath className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    kitchen: <Coffee className="w-4 h-4" />,
  }), []);

  const getFeatureIcon = (feature: string) => {
    return featureIconsMap[feature as keyof typeof featureIconsMap] || null;
  }

  const toggleFavorite = (roomId: string) => {
    setFavorites((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
  }
  const handleBookNow = async (roomId: string) => {
    // Check if room is available before proceeding
    const selectedRoom = rooms.find(room => room.id === roomId);
    if (selectedRoom?.availability === "Fully booked") {
      toast({
        title: "Room Unavailable",
        description: "This room is currently fully booked. Please try another room.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking?roomId=${roomId}`);
      return;
    }

    try {
      setBookingLoading(roomId);
      // Get today and tomorrow's date in YYYY-MM-DD format
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkIn = today.toISOString().split('T')[0];
      const checkOut = tomorrow.toISOString().split('T')[0];

      // Navigate to booking page with the room ID and default dates
      router.push(`/booking?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=1`);
    } catch (error) {
      console.error("Error navigating to booking page:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to booking page. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Ensure loading state is cleared even if there's an error
      setBookingLoading(null);
    }
  }

  // Add real-time update listeners for room availability
  useEffect(() => {
    // Force refresh when component mounts
    refetchRooms();

    // Set up a polling interval for room data
    const intervalId = setInterval(() => {
      refetchRooms();
    }, 15000); // Poll every 15 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refetchRooms]);

  // Aggressive polling for better real-time room availability updates
  useEffect(() => {
    // Create an event listener for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("🔄 Tab became visible - refreshing room data");
        refetchRooms();
      }
    };

    // Listen for when tab becomes visible again
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh when window gets focus
    window.addEventListener('focus', refetchRooms);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refetchRooms);
    };
  }, [refetchRooms]);

  // Show toast notification when room count changes and force immediate refetch
  useEffect(() => {
    if (lastBookedRoomId) {
      // Find the booked room details
      const bookedRoom = rooms.find(room => room.id === lastBookedRoomId);

      if (bookedRoom) {
        // Show a toast notification about the update
        toast({
          title: "Room availability updated",
          description: `${bookedRoom.name} has been booked. There are now ${bookedRoom.availability === "0" ? "no" : bookedRoom.availability} rooms available.`,
          variant: "default",
        });

        // Force an immediate refetch to ensure UI is up-to-date
        refetchRooms();
      }
    }
  }, [lastBookedRoomId, refetchRooms, rooms, toast]);

  // Add debugging state for development
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Debug function to check room status
  const checkRoomStatus = async () => {
    try {
      const response = await fetch('/api/debug-booking');
      const data = await response.json();
      setDebugInfo(data);
      console.log("Current room status:", data);
    } catch (error) {
      console.error("Failed to fetch room status:", error);
    }
  };

  // Auto-check room status on component mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkRoomStatus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
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
        {/* Debug Panel for Development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">Debug Panel</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={checkRoomStatus}
                    className="h-8 text-xs"
                  >
                    Refresh Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDebug(!showDebug)}
                    className="h-8 text-xs"
                  >
                    {showDebug ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>
              {showDebug && debugInfo && (
                <div className="mt-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Current Rooms:</h4>
                      {debugInfo.rooms?.map((room: any) => (
                        <div key={room.id} className="mb-1">
                          <span className="font-medium">{room.name}:</span> {room.numberofrooms} available
                          {room._count && <span className="text-gray-600"> ({room._count.bookings} bookings)</span>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Recent Bookings:</h4>
                      {debugInfo.recentBookings?.slice(0, 3).map((booking: any) => (
                        <div key={booking.id} className="mb-1">
                          <span className="font-medium">{booking.room?.name}</span> - {booking.status}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
        ) : errorMessage ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Error loading rooms</h3>
            <p className="text-gray-500 mb-6">There was a problem fetching the room data.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            {rooms.length > 0 ? (<div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {rooms.slice(0, visibleRooms).map((room: UIRoom) => (
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

                  <CardContent className="p-6">                    <div className="flex items-start justify-between mb-3">                    <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {room.roomType}
                    </h3>
                    <div className="flex items-center mb-1">
                      <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                        Room {room.name}
                      </Badge>
                    </div>                    <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                  </div>
                  </div>                    {/* Room Details */}
                    <div className="grid grid-cols-1 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{room.capacity} guests</span>
                      </div>
                    </div>{/* Bed Type */}
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                        <path d="M2 4v16"></path>
                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                        <path d="M2 17h20"></path>
                        <path d="M6 8v9"></path>
                      </svg>
                      <span className="text-sm font-medium">{room.bedType}</span>
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
                        className={`text-xs ${room.availability === "Fully booked"
                          ? "bg-red-100 text-red-800"
                          : room.availability.includes("left")
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/rooms/${room.id}`)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleBookNow(room.id)}
                          disabled={bookingLoading === room.id || room.availability === "Fully booked"}
                          variant={room.availability === "Fully booked" ? "secondary" : "default"}
                        >
                          {bookingLoading === room.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Loading...
                            </>
                          ) : room.availability === "Fully booked" ? (
                            "Fully Booked"
                          ) : (
                            "Book Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}            </div>
            ) : !roomsData ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Error loading rooms</h3>
                <p className="text-gray-500 mb-6">There was a problem fetching room data from the server.</p>
                <p className="text-sm text-gray-500 mb-6">{errorMessage ? `Error: ${errorMessage}` : "No room data available"}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : null}

            {/* Load More */}
            {rooms.length > 0 && rooms.length > visibleRooms && (
              <div className="text-center mt-12">                <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setIsLoadingMore(true);
                  // Simply update state without using setTimeout, since this is a client-side operation
                  // that doesn't actually need to wait for a server response
                  setVisibleRooms((prev) => prev + 3);
                  // Use requestAnimationFrame to ensure UI updates before turning off loading state
                  requestAnimationFrame(() => {
                    setIsLoadingMore(false);
                  });
                }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  `Load More Rooms (${visibleRooms}/${rooms.length})`
                )}
              </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
