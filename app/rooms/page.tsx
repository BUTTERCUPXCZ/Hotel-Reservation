"use client"

import { useState, useMemo, useEffect, memo } from "react"
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
    bedType: string | null;
    roomType: {
        id: string;
        name: string;
    };
    // Room features are derived from amenities, not a separate property
}

interface UIRoom {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    capacity: number;
    amenities: string[];
    features: string[];
    availability: string;
    roomType: string;
    bedType: string;
}

// Create a memoized RoomCard component for better performance
const RoomCard = memo(({
    room,
    getFeatureIcon,
    router,
    index = 0
}: {
    room: UIRoom;
    getFeatureIcon: (feature: string) => React.ReactNode;
    router: any;
    index?: number;
}) => {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative">
                <div className="relative h-64 overflow-hidden">
                    <Image
                        src={room.image || "/placeholder.svg"}
                        alt={room.name}
                        fill
                        loading={index < 3 ? "eager" : "lazy"} // Only load first 3 images eagerly
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                    />
                </div>
            </div>

            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                            {room.roomType}
                        </h3>
                        <div className="flex items-center mb-1">
                            <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                                Room {room.name}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{room.capacity} guests</span>
                    </div>
                </div>
                <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                        <path d="M2 4v16"></path>
                        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                        <path d="M2 17h20"></path>
                        <path d="M6 8v9"></path>
                    </svg>
                    <span className="text-sm font-medium">{room.bedType}</span>
                </div>

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

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">₱{room.price.toLocaleString()}</span>
                        </div>
                        <span className="text-sm text-gray-600">per night</span>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/rooms/${room.id}`)}
                            className="bg-white text-[#6AB19A] border-[#6AB19A] hover:bg-[#6AB19A] hover:text-white transition-colors"
                        >
                            Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default function RoomsPage() {
    const [priceRange, setPriceRange] = useState([500, 3000])
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [visibleRooms, setVisibleRooms] = useState(9)

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

    const errorMessage = error?.message;

    // State for initial loading
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Precomputed feature map for better performance
    const featureMap: Record<string, string> = useMemo(() => ({
        wifi: 'wifi',
        internet: 'wifi',
        air: 'ac',
        conditioning: 'ac',
        bath: 'bathroom',
        tv: 'tv',
        television: 'tv',
        kitchen: 'kitchen',
        parking: 'parking'
    }), []);

    // Transform the data to match the UI expectations with memoization
    const rooms: UIRoom[] = useMemo(() => {
        if (!roomsData) return [];

        return roomsData.map((room: DBRoom) => {
            // Safely parse amenities JSON string or provide default
            let amenitiesArray: string[] = ["Free WiFi", "Air Conditioning"];
            let featuresArray: string[] = ["wifi", "ac"];

            if (room.amenities) {
                try {
                    // Check if it's a JSON string
                    if (room.amenities.startsWith('[') && room.amenities.endsWith(']')) {
                        amenitiesArray = JSON.parse(room.amenities);
                    } else {
                        // If not valid JSON, treat as comma-separated string
                        amenitiesArray = room.amenities.split(',').map(item => item.trim());
                    }

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
                    // Fallback to treating it as a single item
                    if (typeof room.amenities === 'string') {
                        amenitiesArray = [room.amenities];
                    }
                }
            }

            return {
                id: room.id,
                name: room.name,
                description: room.description || "Comfortable room with amenities",
                price: room.pricePerNight,
                image: room.imageUrl || "/placeholder.svg?height=300&width=400",
                capacity: room.maxOccupancy,
                bedType: room.bedType || room.roomType?.name || (room.maxOccupancy > 1 ? "Double/Twin" : "Single"),
                amenities: amenitiesArray,
                features: [...new Set(featuresArray)], // Remove duplicates
                availability: room.numberofrooms > 0
                    ? `${room.numberofrooms} room${room.numberofrooms !== 1 ? 's' : ''} left`
                    : "Fully booked",
                roomType: room.roomType?.name || "Standard Room",
            };
        });
    }, [roomsData, featureMap]);
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

    const handleRoomDetails = (roomId: string) => {
        router.push(`/rooms/${roomId}`);
    }

    // Mark initial load complete after first data arrives
    useEffect(() => {
        if (roomsData && !initialLoadComplete) {
            setInitialLoadComplete(true);
        }
    }, [roomsData, initialLoadComplete]);

    // Fetch data when component mounts and handle tab visibility
    useEffect(() => {
        // Initial fetch if data doesn't already exist
        if (!roomsData) {
            refetchRooms();
        }

        // Set up polling and visibility handling with a single event listener
        let lastRefreshTime = Date.now();
        let intervalId: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const currentTime = Date.now();
                // Only refresh if it's been at least 30 seconds since the last refresh
                if (currentTime - lastRefreshTime > 30000) {
                    refetchRooms();
                    lastRefreshTime = currentTime;
                }

                // Set up polling only when tab is visible
                intervalId = setInterval(() => {
                    refetchRooms();
                    lastRefreshTime = Date.now();
                }, 120000); // Poll every 2 minutes for better performance
            } else {
                // Clear interval when tab is hidden
                clearInterval(intervalId);
            }
        };

        // Initial setup based on visibility
        handleVisibilityChange();

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(intervalId);
        };
    }, [refetchRooms, roomsData]);

    // Show toast notification when room availability changes
    useEffect(() => {
        if (lastBookedRoomId) {
            const bookedRoom = rooms.find(room => room.id === lastBookedRoomId);

            if (bookedRoom) {
                toast({
                    title: "Room availability updated",
                    description: `Room availability has changed. Refreshing data.`,
                    variant: "default",
                });

                // Refresh data to show updated availability
                refetchRooms();
            }
        }
    }, [lastBookedRoomId, refetchRooms, rooms, toast]);

    return (
        <div className="min-h-screen bg-gray-100">
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
                {/* Page Header */}
                <div className="mt-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Stay at Kayan</h1>
                    <p className="text-sm text-gray-600">Our spaces are designed for comfort, creativity, and connection. Whether you're solo, with a partner, or rolling with friends.</p>
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
                                                <span className="text-sm">Private Room</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm">Shared Room (4pax max)</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm">Shared Room (6pax max)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Loading State - Only show on initial load */}
                {isLoading && !initialLoadComplete ? (
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
                            {/* Just show 3 skeleton cards for faster perceived loading */}
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-[480px] bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="h-64 bg-gray-200 animate-pulse"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="flex space-x-2">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                            ))}
                                        </div>
                                        <div className="pt-4 flex justify-between items-end">
                                            <div className="space-y-2">
                                                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
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
                                    className={viewMode === "grid" ? "bg-[#6AB19A] text-white hover:bg-[#5a9c87]" : "text-[#6AB19A] border-[#6AB19A] hover:bg-[#6AB19A] hover:text-white"}
                                >
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className={viewMode === "list" ? "bg-[#6AB19A] text-white hover:bg-[#5a9c87]" : "text-[#6AB19A] border-[#6AB19A] hover:bg-[#6AB19A] hover:text-white"}
                                >
                                    List
                                </Button>
                            </div>
                        </div>

                        {/* Rooms Grid */}
                        {rooms.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                                {rooms.slice(0, visibleRooms).map((room: UIRoom, index) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        getFeatureIcon={getFeatureIcon}
                                        router={router}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium mb-2">No rooms available</h3>
                                <p className="text-gray-500 mb-6">
                                    {!roomsData
                                        ? "There was a problem fetching room data from the server."
                                        : "There are currently no rooms available that match your criteria."}
                                </p>
                                {errorMessage && <p className="text-sm text-gray-500 mb-6">Error: {errorMessage}</p>}
                                <Button onClick={() => window.location.reload()} className="bg-[#6AB19A] hover:bg-[#5a9c87] text-white">
                                    {!roomsData ? "Try Again" : "Refresh"}
                                </Button>
                            </div>
                        )}

                        {/* Load More */}
                        {rooms.length > 0 && rooms.length > visibleRooms && (
                            <div className="text-center mt-12">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                        // Increase the batch size for fewer clicks
                                        const batchSize = Math.min(9, rooms.length - visibleRooms);
                                        setVisibleRooms(prev => prev + batchSize);
                                    }}
                                >
                                    Load More Rooms ({rooms.length - visibleRooms} remaining)
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
