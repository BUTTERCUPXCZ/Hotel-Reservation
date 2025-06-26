"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { trpc } from "@/hooks/trpc"

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const { user, logout } = useAuth()

  const userBookingsQuery = trpc.rooms.getUserBookings.useQuery(undefined, {
    enabled: !!user, // Only run the query if the user is logged in
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (authentication issues)
      if (error.data?.code === 'UNAUTHORIZED') {
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    refetchOnMount: false // Don't refetch when component remounts if data is still fresh
  })

  useEffect(() => {
    if (userBookingsQuery.data) {
      const formattedBookings = userBookingsQuery.data.map(booking => ({
        id: booking.id,
        roomName: booking.room?.name || "Unknown Room",
        checkIn: new Date(booking.checkInDate).toLocaleDateString(),
        checkOut: new Date(booking.checkOutDate).toLocaleDateString(),
        guests: booking.guestCount,
        total: booking.totalAmount,
        status: booking.status.toLowerCase(), // Convert to lowercase for consistent UI handling
        image: booking.room?.imageUrl || "/placeholder.svg?height=100&width=150", // Use room image if available
      }))
      setBookings(formattedBookings)
      setIsLoading(false)
    } else if (userBookingsQuery.isError) {
      // Handle specific error types
      if (userBookingsQuery.error.data?.code === 'UNAUTHORIZED') {
        // The user is not authenticated, we should handle this gracefully
      }
      setIsLoading(false)
    }
  }, [userBookingsQuery.data, userBookingsQuery.isError, userBookingsQuery.error])

  // Update loading state based on query status
  useEffect(() => {
    setIsLoading(userBookingsQuery.isLoading || userBookingsQuery.isFetching)
  }, [userBookingsQuery.isLoading, userBookingsQuery.isFetching])

  // Memoized status helpers for better performance
  const statusIcons = useMemo(() => ({
    confirmed: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-500" />,
    cancelled: <XCircle className="w-4 h-4 text-red-500" />,
    default: <AlertCircle className="w-4 h-4 text-gray-500" />
  }), []);

  const statusColors = useMemo(() => ({
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800"
  }), []);

  const getStatusIcon = (status: string) => {
    return statusIcons[status.toLowerCase() as keyof typeof statusIcons] || statusIcons.default;
  }

  const getStatusColor = (status: string) => {
    return statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.default;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <span className="text-xl font-bold">HostelHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section Skeleton */}
            <div className="mb-8">
              <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content Skeleton - only render 1 skeleton item for faster loading */}
            <div className="space-y-6">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-3">
                      <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="text-xl font-bold">HostelHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/rooms">
              <Button variant="ghost">Browse Rooms</Button>
            </Link>
            <span className="font-medium">Hi, {user?.name || "Guest"}</span>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Guest"}!</h1>
            <p className="text-muted-foreground">Manage your bookings and account settings</p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Only render active tab content to improve performance */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <Link href="/rooms">
                  <Button>Book New Room</Button>
                </Link>
              </div>

              <div className="grid gap-6">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="relative w-full md:w-32 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={booking.image || "/placeholder.svg"}
                              alt={booking.roomName}
                              fill
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, 128px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.roomName}</h3>
                                <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(booking.status)}
                                  <span className="capitalize">{booking.status}</span>
                                </div>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">Check-in</div>
                                  <div className="text-muted-foreground">{booking.checkIn}</div>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">Check-out</div>
                                  <div className="text-muted-foreground">{booking.checkOut}</div>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">Guests</div>
                                  <div className="text-muted-foreground">{booking.guests}</div>
                                </div>
                              </div>
                            </div>                              <div className="flex items-center justify-between">
                              <div className="text-lg font-bold">₱{booking.total.toLocaleString()}</div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                {booking.status.toLowerCase() === "confirmed" && (
                                  <Button variant="outline" size="sm">
                                    Modify
                                  </Button>
                                )}
                                {["confirmed", "pending"].includes(booking.status.toLowerCase()) && (
                                  <Button variant="destructive" size="sm">
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-4">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                    <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                    <Link href="/rooms">
                      <Button>Browse Rooms</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} loading="lazy" />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <input className="w-full p-2 border rounded-md" defaultValue={user?.name?.split(" ")[0] || ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <input className="w-full p-2 border rounded-md" defaultValue={user?.name?.split(" ")[1] || ""} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input className="w-full p-2 border rounded-md" defaultValue={user?.email || ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input className="w-full p-2 border rounded-md" defaultValue="+63 912 345 6789" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Email notifications for bookings</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">SMS notifications for check-in reminders</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Privacy</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Make my profile visible to other guests</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Share my reviews publicly</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Security</h3>
                    <div className="space-y-2">
                      <Button variant="outline">Change Password</Button>
                      <Button variant="outline">Enable Two-Factor Authentication</Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
