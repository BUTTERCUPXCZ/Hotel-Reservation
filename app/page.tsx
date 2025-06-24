import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Wifi, Car, Coffee, Shield, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="text-xl font-bold">HostelHub</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/rooms" className="text-sm font-medium text-muted-foreground">
              Rooms
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-20 bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: "url('/placeholder.svg?height=600&width=1200&text=Hotel+Exterior')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Perfect Stay Awaits</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover comfortable, affordable hostel accommodations with modern amenities and exceptional service.
          </p>

          {/* Quick Search */}
          <Link href="/rooms">
            <Button size="lg" className="text-lg px-8 py-4">
              Book a Room
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose HostelHub?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for a comfortable and memorable stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Wifi className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Free WiFi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  High-speed internet access throughout the property
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>24/7 Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Round-the-clock security for your peace of mind
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Coffee className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Common Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Comfortable spaces to relax and meet other travelers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Car className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Free Parking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">Complimentary parking for all guests</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Rooms</h2>
            <p className="text-muted-foreground">Choose from our variety of comfortable accommodations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Dorm Room" fill className="object-cover" />
                <Badge className="absolute top-2 left-2">Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Shared Dorm (4 beds)
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                </CardTitle>
                <CardDescription>Perfect for budget travelers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />4 guests
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      2nd Floor
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₱800</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
                <Link href="/rooms/dorm-4">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Private Room" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Private Room
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">4.9</span>
                  </div>
                </CardTitle>
                <CardDescription>Your own private space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />2 guests
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      3rd Floor
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₱1,500</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
                <Link href="/rooms/private">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=200&width=400" alt="Family Room" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Family Room
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">4.7</span>
                  </div>
                </CardTitle>
                <CardDescription>Spacious room for families</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />6 guests
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      1st Floor
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₱2,200</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
                <Link href="/rooms/family">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">H</span>
                </div>
                <span className="text-xl font-bold">HostelHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for comfortable and affordable hostel stays.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/rooms">Rooms</Link>
                </li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/faq">FAQ</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help">Help Center</Link>
                </li>
                <li>
                  <Link href="/cancellation">Cancellation Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>123 Hostel Street</p>
                <p>Manila, Philippines</p>
                <p>+63 912 345 6789</p>
                <p>info@hostelhub.com</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 HostelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
