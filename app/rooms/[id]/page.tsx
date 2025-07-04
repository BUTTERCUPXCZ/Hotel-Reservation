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
import { trpc } from "@/hooks/trpc"
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
import { useParams, useRouter } from "next/navigation"

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
  // Features are derived from amenities, not a separate property in the database
}

interface UIRoomDetails {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  capacity: number;
  bedType: string;
  roomType: string;
  checkInTime: string;
  checkOutTime: string;
  amenities: {
    name: string;
    icon: string;
    description: string;
  }[];
  features: string[];
  dbFeatures: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
  }[];
  policies: string[];
  location: {
    address: string;
    nearby: string[];
  };
  availability: string;
}

export default function RoomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [room, setRoom] = useState<UIRoomDetails | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  const { isAuthenticated } = useAuth()

  // Fetch room data from the database using tRPC
  const {
    data: roomData,
    isLoading,
    error
  } = trpc.rooms.getRoomById.useQuery(
    { id: roomId },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      enabled: !!roomId
    }
  );

  // Transform database room data to the UI format once data is loaded
  useEffect(() => {
    if (roomData) {
      try {
        // Parse amenities JSON string or provide default
        let amenitiesArray: string[] = ["Free WiFi", "Air Conditioning"];
        let featuresArray: string[] = ["wifi", "ac"];

        if (roomData.amenities) {
          // Check if the amenities is already a string array or parse JSON if it's a JSON string
          try {
            // Check if it's a JSON string
            if (roomData.amenities.startsWith('[') && roomData.amenities.endsWith(']')) {
              amenitiesArray = JSON.parse(roomData.amenities);
            } else {
              // If not valid JSON, treat as comma-separated string
              amenitiesArray = roomData.amenities.split(',').map((item: string) => item.trim());
            }

            const featureMap: Record<string, string> = {
              wifi: 'wifi',
              internet: 'wifi',
              air: 'ac',
              conditioning: 'ac',
              bath: 'bathroom',
              tv: 'tv',
              television: 'tv',
              kitchen: 'kitchen',
              parking: 'parking',
              security: 'security'
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
            if (typeof roomData.amenities === 'string') {
              amenitiesArray = [roomData.amenities];
            }
          }
        }

        // Format amenities as objects with name, icon, and description
        const formattedAmenities = amenitiesArray.map(amenity => {
          let icon = 'wifi'; // default icon
          if (amenity.toLowerCase().includes('wifi')) icon = 'wifi';
          if (amenity.toLowerCase().includes('air')) icon = 'ac';
          if (amenity.toLowerCase().includes('bath')) icon = 'bathroom';
          if (amenity.toLowerCase().includes('tv')) icon = 'tv';
          if (amenity.toLowerCase().includes('security')) icon = 'security';
          if (amenity.toLowerCase().includes('parking')) icon = 'parking';
          if (amenity.toLowerCase().includes('kitchen')) icon = 'coffee';

          return {
            name: amenity,
            icon,
            description: `${amenity} available in this room`
          };
        });

        const transformedRoom: UIRoomDetails = {
          id: roomData.id,
          name: roomData.name,
          description: roomData.description || "Comfortable accommodation with modern amenities",
          longDescription: roomData.description ||
            (roomData.roomType?.name === "Private Room" || (!roomData.roomType?.name && roomData.maxOccupancy === 1) ?
              "Cozy queen bed, A/C, private bathroom, and tranquil jungle or garden views—perfect for a peaceful retreat." :
              roomData.roomType?.name === "Shared Room (4 pax max)" || (!roomData.roomType?.name && roomData.maxOccupancy <= 4) ?
                "Single bed in a mixed or all-female dorm with lockers, privacy curtains, A/C, and shared bath." :
                "Spacious mixed dorm with six single beds, individual lockers and privacy curtains, air conditioning and shared bathroom. Ideal for budget travelers or small groups."),
          price: roomData.pricePerNight,
          images: roomData.imageUrl ?
            [
              roomData.imageUrl,
              "/placeholder.svg?height=400&width=600&text=Room+Interior",
              "/placeholder.svg?height=400&width=600&text=Bathroom",
              "/placeholder.svg?height=400&width=600&text=Room+View"
            ] :
            [
              "/placeholder.svg?height=400&width=600&text=Room+Interior",
              "/placeholder.svg?height=400&width=600&text=Bathroom",
              "/placeholder.svg?height=400&width=600&text=Room+View",
              "/placeholder.svg?height=400&width=600&text=Amenities"
            ],
          capacity: roomData.maxOccupancy,
          bedType: roomData.roomType?.name || (roomData.maxOccupancy > 1 ? "Double/Twin" : "Single"),
          roomType: roomData.roomType?.name ||
            (roomData.maxOccupancy === 1 ? "Private Room" :
              roomData.maxOccupancy <= 4 ? "Shared Room (4 pax max)" :
                "Shared Room (6 pax max)"),
          checkInTime: "2:00 PM",
          checkOutTime: "12:00 PM",
          amenities: formattedAmenities,
          features: [...new Set(featuresArray)], // Remove duplicates
          dbFeatures: [], // Since the features property doesn't exist, we initialize with an empty array
          policies: [
            "Check-in: 2:00 PM - 10:00 PM",
            "Check-out: 11:00 AM - 12:00 PM",
            "Quiet hours: 10:00 PM - 7:00 AM",
            "No smoking inside the property",
            `Maximum ${roomData.maxOccupancy} guests per room`,
            "Valid ID required at check-in",
          ],
          location: {
            address: "123 Hostel Street, Makati City, Metro Manila",
            nearby: ["Mall of Asia - 2km", "Rizal Park - 1.5km", "Airport - 15km", "Train Station - 500m"],
          },
          availability: `${roomData.numberofrooms} room${roomData.numberofrooms !== 1 ? 's' : ''} left`,
        };

        setRoom(transformedRoom);
      } catch (error) {
        console.error("Error transforming room data:", error);
      }
    }
  }, [roomData]);

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
    if (!checkIn || !checkOut) {
      return; // Don't proceed if dates aren't selected
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${adults + children}`);
      return;
    }

    try {
      setBookingLoading(true);

      // Navigate to booking page with all required parameters
      router.push(
        `/booking?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${adults + children}`
      );
    } catch (error) {
      console.error("Error navigating to booking page:", error);
    } finally {
      setBookingLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
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
            <span className="text-foreground font-medium">{room.roomType}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Room Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.roomType}</h1>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                Room {room.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
              className="flex items-center space-x-2 text-[#6AB19A] border-[#6AB19A] hover:bg-[#6AB19A] hover:text-white"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              <span>Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-[#6AB19A] border-[#6AB19A] hover:bg-[#6AB19A] hover:text-white"
            >
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
                <img
                  src={room.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${room.name} - Image ${currentImageIndex + 1}`}
                  className="object-cover w-full h-full"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-[#6AB19A] hover:text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-[#6AB19A] hover:text-white"
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
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Room Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  About this room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main description with highlighted text */}
                <div className="bg-muted/50 p-4 rounded-lg border border-muted">
                  <p className="text-gray-700 leading-relaxed">{room.longDescription}</p>
                </div>

                {/* Key Info Section */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-background p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all">
                    <Users className="w-5 h-5 text-primary mb-2" />
                    <span className="font-semibold">Capacity</span>
                    <span className="text-gray-700">2 guests</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all">
                    <Clock className="w-5 h-5 text-primary mb-2" />
                    <span className="font-semibold">Check-in</span>
                    <span className="text-gray-700">2:00 PM</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all">
                    <Clock className="w-5 h-5 text-primary mb-2" />
                    <span className="font-semibold">Check-out</span>
                    <span className="text-gray-700">11:00 AM</span>
                  </div>
                </div>



                <div className="pt-4">
                  {room.roomType === "Private Room" && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Home className="w-5 h-5 text-primary mr-2" />
                        <span className="text-lg">Private Room Details</span>
                      </h4>
                      <div className="bg-background p-4 rounded-lg border">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Queen bed</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Air conditioning</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>En-suite bathroom</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Jungle or garden view</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {room.roomType === "Shared Room (4 pax max)" && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Users className="w-5 h-5 text-primary mr-2" />
                        <span className="text-lg">Shared Room Details (4 pax max)</span>
                      </h4>
                      <div className="bg-background p-4 rounded-lg border">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Single bed in mixed/female dorm</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Lockers provided</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Privacy curtains</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Shared bathroom</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {room.roomType === "Shared Room (6 pax max)" && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Users className="w-5 h-5 text-primary mr-2" />
                        <span className="text-lg">Shared Room Details (6 pax max)</span>
                      </h4>
                      <div className="bg-background p-4 rounded-lg border">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Six single beds in mixed dorm</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Individual lockers</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Privacy curtains</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Air conditioning</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Shared bathroom</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Budget-friendly</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
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
                  {room.amenities.map((amenity, index: number) => (
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
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  House Rules & Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background p-4 rounded-lg border">
                    <h4 className="font-medium mb-4 flex items-center text-lg border-b pb-2">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      Check-In and Check-Out
                    </h4>
                    <div className="text-sm text-gray-700 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Check-in: 2:00 PM</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Check-out: 11:00 AM</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Early check-in and late check-out are subject to availability—just ask!</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Please have your ID ready upon arrival.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Balance (if any) is payable at check-in via cash, GCash, or bank transfer.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background p-4 rounded-lg border">
                    <h4 className="font-medium mb-4 flex items-center text-lg border-b pb-2">
                      <Home className="w-5 h-5 text-primary mr-2" />
                      House Rules
                    </h4>
                    <div className="text-sm text-gray-700 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Respect the space, the people, and the island.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Quiet hours begin at 10 PM in shared areas.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Visitors are not allowed inside dorm rooms.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Keep shared spaces clean. Leave them how you'd want to find them.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Kayan is pet-friendly, but please let us know ahead if you're bringing one.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>Smoking is allowed in designated outdoor areas only.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg text-primary font-light flex-shrink-0">·</span>
                        <span>We're here to help. Talk to us about any concerns during your stay.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border-dashed border border-muted">
                  <p className="text-sm text-center text-gray-600 italic">
                    These policies help us ensure all guests have a comfortable and enjoyable stay.
                    Thank you for your cooperation!
                  </p>
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
                          <img
                            src={similarRoom.image || "/placeholder.svg"}
                            alt={similarRoom.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{similarRoom.name}</h4>
                          <div className="flex items-center justify-between">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adults">Adults</Label>
                    <Input
                      id="adults"
                      type="number"
                      min={1}
                      max={room.capacity}
                      value={adults}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 1 && value <= room.capacity) {
                          setAdults(value);
                          setGuests(value + children);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      min={0}
                      max={Math.max(0, room.capacity - adults)}
                      value={children}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0 && value + adults <= room.capacity) {
                          setChildren(value);
                          setGuests(adults + value);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
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
                  className="w-full bg-[#6AB19A] hover:bg-[#5a9c87] text-white"
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
