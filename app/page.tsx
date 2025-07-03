"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Users, Wifi, Car, Coffee, Shield, Star, Search, Waves, Palmtree, Sunset, Globe, Calendar as CalendarIcon, Home, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { format } from "date-fns"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setTimeout(() => setShowContent(true), 100)
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: '#F5EFE6' }}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <motion.header
              className="border-b"
              style={{ borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Navbar currentPath="/" />
            </motion.header>

            {/* Hero Section */}
            <motion.section
              className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
              style={{
                backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/beach.jpg')"
              }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-16 h-16 border border-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-32 right-16 w-12 h-12 border border-white/15 rounded-full" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-20 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
              </div>

              <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                  className="flex items-center justify-center space-x-3 mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Waves className="w-6 h-6 text-white" />
                  <span className="font-medium tracking-wide uppercase text-sm text-white">Discover • Rest • Connect</span>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl font-light mb-8 leading-relaxed text-white"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                  Your Peaceful <span className="text-teal-300">Island</span><br />
                  <span className="font-normal">Retreat in Siargao</span>
                </motion.h1>

                <motion.p
                  className="text-lg mb-12 max-w-2xl mx-auto leading-relaxed text-white/90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Experience the serene beauty of island life. From gentle waves to quiet moments, find your perfect balance in our mindfully designed spaces.
                </motion.p>

                {/* Booking Search UI */}
                <motion.div
                  className="backdrop-blur-sm rounded-3xl p-8 md:p-10 max-w-4xl mx-auto shadow-lg"
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #E0E0E0' }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex items-center space-x-3 mb-8">
                    <Search className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <h3 className="text-lg font-medium" style={{ color: '#2E2E2E' }}>Find Your Island Sanctuary</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Check-in</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal rounded-xl h-12"
                            style={{
                              borderColor: '#E0E0E0',
                              backgroundColor: '#FAFAFA',
                              color: '#2E2E2E'
                            }}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" style={{ color: '#6AB19A' }} />
                            {checkIn ? format(checkIn, "MMM dd") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Check-out</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal rounded-xl h-12"
                            style={{
                              borderColor: '#E0E0E0',
                              backgroundColor: '#FAFAFA',
                              color: '#2E2E2E'
                            }}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" style={{ color: '#6AB19A' }} />
                            {checkOut ? format(checkOut, "MMM dd") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Guests</label>
                      <Select>
                        <SelectTrigger
                          className="rounded-xl h-12"
                          style={{
                            borderColor: '#E0E0E0',
                            backgroundColor: '#FAFAFA'
                          }}
                        >
                          <SelectValue placeholder="1 guest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 guest</SelectItem>
                          <SelectItem value="2">2 guests</SelectItem>
                          <SelectItem value="3">3 guests</SelectItem>
                          <SelectItem value="4">4+ guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>Room Type</label>
                      <Select>
                        <SelectTrigger
                          className="rounded-xl h-12"
                          style={{
                            borderColor: '#E0E0E0',
                            backgroundColor: '#FAFAFA'
                          }}
                        >
                          <SelectValue placeholder="Any room" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any room</SelectItem>
                          <SelectItem value="dorm">Shared Dorm</SelectItem>
                          <SelectItem value="private">Private Room</SelectItem>
                          <SelectItem value="family">Family Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link href="/rooms">
                      <Button
                        className="w-full py-4 text-lg font-medium rounded-xl text-white hover:opacity-90 transition-all duration-300"
                        style={{ backgroundColor: '#6AB19A' }}
                      >
                        Explore Peaceful Stays
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Welcome to Kayan Section */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#FAFAFA' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  {...fadeInUp}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Home className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Our Island Home</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Welcome to <span style={{ color: '#6AB19A' }}>Kayan</span></h2>
                  <p className="max-w-3xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
                    Kayan is more than just a place to stay—it's a community, a vibe, and a sensory escape. Hidden in Siargao's lush edges, this is where laid-back island living meets raw, soulful experiences. Whether you're here to unwind or dive deep into the rhythm of the island, you'll find your space at Kayan.
                  </p>
                </motion.div>

                <div className="max-w-5xl mx-auto">
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                  >
                    <motion.div variants={fadeInUp} className="order-2 lg:order-1">
                      <h3 className="text-2xl font-light mb-6" style={{ color: '#2E2E2E' }}>What We <span style={{ color: '#6AB19A' }}>Offer</span></h3>
                      <p className="mb-6 leading-relaxed" style={{ color: '#5A5A5A' }}>
                        At Kayan, everything is designed to flow with the island. From the comfort of your room to the energy of our surf shop and the spontaneity of local adventures. We've created a space where you can slow down, connect, and experience Siargao on your own terms.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {[
                          { label: "Cozy Private & Shared Rooms", description: "Comfort meets charm in our thoughtfully designed accommodations." },
                          { label: "Outdoor Pool", description: "A calm space to cool off, relax, or hang out with fellow travelers." },
                          { label: "Surf Shop & Rentals", description: "Boards, gear, and good advice, straight from locals who ride every day." },
                          { label: "Island Experiences", description: "Tours, surf trips, and spontaneous getaways curated just for our guests." },
                          { label: "Common Lounge", description: "A space to connect, chill, or groove to live sets and curated playlists." },
                          { label: "Free Wi-Fi", description: "When you need to reconnect with the outside world." },
                          { label: "Pet-Friendly", description: "Meet our golden retriever and bring your own furry friend." }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-3"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                          >
                            <div className="mt-1 flex-shrink-0">
                              <Check className="w-5 h-5" style={{ color: '#6AB19A' }} />
                            </div>
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: '#2E2E2E' }}>{item.label}</h4>
                              <p className="text-sm" style={{ color: '#5A5A5A' }}>{item.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div variants={scaleIn} className="order-1 lg:order-2">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 group">
                        <Image
                          src="/rooftop.jpg"
                          alt="Kayan Hostel Experience"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8">
                          <Badge className="mb-2 text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>Kayan Vibes</Badge>
                          <h3 className="text-xl font-medium mb-1 text-white">Island Living</h3>
                          <p className="text-white/90 text-sm">Experience the authentic rhythm of Siargao</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Destination Highlights Section */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#FAFAFA' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-20"
                  {...fadeInUp}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <MapPin className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Island Discoveries</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Explore Siargao's <span style={{ color: '#6AB19A' }}>Natural</span> Wonders</h2>
                  <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
                    From peaceful lagoons to gentle coastal walks, discover the island's serene beauty at your own pace
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {/* Featured Destination */}
                  <motion.div variants={scaleIn} className="lg:col-span-2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 group cursor-pointer">
                      <Image
                        src="/Lagoons.jpg"
                        alt="Cloud 9 Surf Break"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">

                        <h3 className="text-2xl md:text-3xl font-light mb-4">Peaceful Lagoons</h3>
                        <p className="text-white/90 text-base md:text-lg mb-4 leading-relaxed">
                          Discover hidden tidal pools and serene lagoons where time moves slowly. Perfect for quiet reflection and gentle swimming.
                        </p>
                        <Button
                          variant="outline"
                          className="border-white text-black hover:bg-gray-200  transition-all duration-300 rounded-full px-6"
                        >
                          Find Tranquility →
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Side Destinations */}
                  <motion.div variants={scaleIn} className="space-y-6">
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-44 group cursor-pointer">
                      <Image
                        src="/pools.jpg"
                        alt="Magpupungko Rock Pools"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h4 className="text-lg font-bold mb-1">Magpupungko Pools</h4>
                        <p className="text-white/90 text-sm">Natural tidal rock pools</p>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden shadow-lg h-44 group cursor-pointer">
                      <Image
                        src="/coconut.jpg"
                        alt="Coconut Forest"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h4 className="text-lg font-bold mb-1">Coconut Forest</h4>
                        <p className="text-white/90 text-sm">Pristine island nature trails</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {[
                    { number: "30+", label: "Surf Breaks", icon: "Surf" },
                    { number: "15+", label: "Island Tours", icon: "Tours" },
                    { number: "5", label: "Secret Lagoons", icon: "Lagoons" },
                    { number: "24/7", label: "Island Vibes", icon: "Vibes" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="p-6 rounded-xl"
                      style={{
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E0E0E0'
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-bold mb-1" style={{ color: '#2E2E2E' }}>{stat.number}</div>
                      <div className="text-sm" style={{ color: '#5A5A5A' }}>{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* Island Spaces Showcase */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#F5EFE6' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  {...fadeInUp}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Sunset className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Peaceful Spaces</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Spaces for <span style={{ color: '#6AB19A' }}>Mindful</span> Connection</h2>
                  <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
                    Thoughtfully designed spaces where you can unwind, connect with nature, and meet fellow travelers seeking authentic experiences
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {/* Main Gallery Images */}
                  <motion.div variants={scaleIn} className="lg:col-span-2 row-span-2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full min-h-[500px] group">
                      <Image
                        src="/reception.jpg"
                        alt="Island Social Hub"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <Badge
                          className="mb-4 text-white border-0"
                          style={{ backgroundColor: '#6AB19A' }}
                        >
                          Welcome Space
                        </Badge>
                        <h3 className="text-3xl font-light mb-3">Where Stories Unfold</h3>
                        <p className="text-white/90 text-lg leading-relaxed">A peaceful gathering space where travelers connect, share experiences, and plan island adventures in comfort</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-60 group">
                      <Image
                        src="/shared.jpg"
                        alt="Surf Lounge"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="mb-2 text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>Peaceful Vibes</Badge>
                        <h3 className="text-lg font-medium mb-1">Quiet Lounge</h3>
                        <p className="text-white/90 text-sm">Gentle conversations & reflection</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-60 group">
                      <Image
                        src="/coffee.jpg"
                        alt="Island Café"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="mb-2 text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>Local Taste</Badge>
                        <h3 className="text-lg font-medium mb-1">Island Café</h3>
                        <p className="text-white/90 text-sm">Mindful meals & fresh flavors</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-60 group">
                      <Image
                        src="/working.webp"
                        alt="Digital Nomad Zone"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="mb-2 text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>Work Sanctuary</Badge>
                        <h3 className="text-lg font-medium mb-1">Quiet Work Space</h3>
                        <p className="text-white/90 text-sm">Focused work meets gentle nature</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="relative rounded-xl overflow-hidden shadow-lg h-60 group">
                      <Image
                        src="/rooftop.jpg"
                        alt="Sunset Deck"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="mb-2 text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>Peaceful Moments</Badge>
                        <h3 className="text-lg font-medium mb-1">Sunset Terrace</h3>
                        <p className="text-white/90 text-sm">Evening reflection & gentle breeze</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-16 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link href="/gallery">
                    <Button
                      className="text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-300"
                      style={{ backgroundColor: '#6AB19A' }}
                    >
                      View Our Spaces
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.section>

            {/* Discovery Features Section */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#FAFAFA' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-20"
                  {...fadeInUp}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Globe className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Why Choose Our Sanctuary</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Your Gateway to <span style={{ color: '#6AB19A' }}>Mindful</span> Island Living</h2>
                  <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
                    More than accommodation - we're your connection to Siargao's gentle rhythms, peaceful spaces, and authentic island moments
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {[
                    {
                      icon: Waves,
                      title: "Gentle Waters",
                      description: "Connect with the ocean's peaceful rhythm and learn from local water guides",
                      color: "#6AB19A"
                    },
                    {
                      icon: Sunset,
                      title: "Mindful Moments",
                      description: "Capture island serenity and find peace in nature's simple beauty",
                      color: "#6AB19A" // Changed from #A3B18A
                    },
                    {
                      icon: Users,
                      title: "Kindred Spirits",
                      description: "Meet fellow travelers seeking authentic connections and shared experiences",
                      color: "#6AB19A"
                    },
                    {
                      icon: Palmtree,
                      title: "Nature Immersion",
                      description: "Explore island trails, lagoons, and experiences that nourish the soul",
                      color: "#6AB19A" // Changed from #A3B18A
                    }
                  ].map((feature, index) => (
                    <motion.div key={index} variants={scaleIn}>
                      <Card
                        className="h-full transition-all duration-500 border-0 hover:-translate-y-1"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E8E8E8',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                        }}
                      >
                        <CardHeader className="text-center pb-6 pt-8">
                          <div
                            className="mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#F8F8F8' }}
                          >
                            <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                          </div>
                          <CardTitle className="text-lg font-medium" style={{ color: '#2E2E2E' }}>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8">
                          <p className="text-center leading-relaxed text-sm" style={{ color: '#5A5A5A' }}>
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* Traveler Testimonials */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#F5EFE6' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-20"
                  {...fadeInUp}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Star className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Guest Experiences</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Stories from <span style={{ color: '#6AB19A' }}>Mindful</span> Travelers</h2>
                  <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
                    Hear from guests who've experienced our sanctuary and discovered their own unique connection to Siargao's peaceful rhythms
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {/* Testimonial Cards */}
                  <motion.div variants={scaleIn}>
                    <div className="bg-white p-8 rounded-2xl shadow-md h-full relative" style={{ border: '1px solid #E0E0E0' }}>
                      <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md" style={{ border: '1px solid #E0E0E0' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 11L3 11L3 9C3 5.68629 5.68629 3 9 3L10 3L10 11ZM21 11L14 11L14 9C14 5.68629 16.6863 3 20 3L21 3L21 11ZM10 21L10 13L3 13L3 15C3 18.3137 5.68629 21 9 21L10 21ZM21 21L21 13L14 13L14 15C14 18.3137 16.6863 21 20 21L21 21Z" fill="#6AB19A" />
                        </svg>
                      </div>
                      <div className="mt-5 mb-8">
                        <p className="italic leading-relaxed" style={{ color: '#5A5A5A' }}>
                          "This place transformed our Siargao experience. The mindful atmosphere and genuine connections with other travelers made our stay special. We loved the peaceful spaces and sustainable approach."
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-4">
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5EFE6' }}>
                            <span style={{ color: '#6AB19A' }}>EM</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#2E2E2E' }}>Emma M.</div>
                          <div className="text-sm" style={{ color: '#6AB19A' }}>Digital Nomad</div>
                        </div>
                        <div className="ml-auto flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="bg-white p-8 rounded-2xl shadow-md h-full relative" style={{ border: '1px solid #E0E0E0' }}>
                      <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md" style={{ border: '1px solid #E0E0E0' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 11L3 11L3 9C3 5.68629 5.68629 3 9 3L10 3L10 11ZM21 11L14 11L14 9C14 5.68629 16.6863 3 20 3L21 3L21 11ZM10 21L10 13L3 13L3 15C3 18.3137 5.68629 21 9 21L10 21ZM21 21L21 13L14 13L14 15C14 18.3137 16.6863 21 20 21L21 21Z" fill="#6AB19A" />
                        </svg>
                      </div>
                      <div className="mt-5 mb-8">
                        <p className="italic leading-relaxed" style={{ color: '#5A5A5A' }}>
                          "The perfect balance of community and privacy. I came for three days and stayed for three weeks. The staff's knowledge of hidden island spots made every day an authentic adventure in mindfulness."
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-4">
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5EFE6' }}>
                            <span style={{ color: '#6AB19A' }}>JT</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#2E2E2E' }}>James T.</div>
                          <div className="text-sm" style={{ color: '#6AB19A' }}>Yoga Instructor</div>
                        </div>
                        <div className="ml-auto flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={scaleIn}>
                    <div className="bg-white p-8 rounded-2xl shadow-md h-full relative" style={{ border: '1px solid #E0E0E0' }}>
                      <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md" style={{ border: '1px solid #E0E0E0' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 11L3 11L3 9C3 5.68629 5.68629 3 9 3L10 3L10 11ZM21 11L14 11L14 9C14 5.68629 16.6863 3 20 3L21 3L21 11ZM10 21L10 13L3 13L3 15C3 18.3137 5.68629 21 9 21L10 21ZM21 21L21 13L14 13L14 15C14 18.3137 16.6863 21 20 21L21 21Z" fill="#6AB19A" />
                        </svg>
                      </div>
                      <div className="mt-5 mb-8">
                        <p className="italic leading-relaxed" style={{ color: '#5A5A5A' }}>
                          "Our family found the perfect sanctuary here. The peaceful environment and thoughtful spaces allowed us to connect with nature and each other. The mindful approach to hospitality is truly unique."
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-4">
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#F5EFE6' }}>
                            <span style={{ color: '#6AB19A' }}>SL</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#2E2E2E' }}>Sarah L.</div>
                          <div className="text-sm" style={{ color: '#6AB19A' }}>Family Traveler</div>
                        </div>
                        <div className="ml-auto flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex justify-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link href="/reviews">
                    <Button
                      variant="outline"
                      className="px-6 py-2 rounded-full transition-all duration-300"
                      style={{ borderColor: '#6AB19A', color: '#6AB19A' }}
                    >
                      Read More Stories →
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.section>

            {/* Island-Ready Rooms */}
            <motion.section
              className="py-24"
              style={{ backgroundColor: '#FAFAFA' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="text-center mb-16"
                  {...fadeInUp}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Users className="w-5 h-5" style={{ color: '#6AB19A' }} />
                    <span className="font-medium tracking-wide uppercase text-sm" style={{ color: '#6AB19A' }}>Peaceful Accommodations</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-6" style={{ color: '#2E2E2E' }}>Choose Your <span style={{ color: '#6AB19A' }}>Serene</span> Space</h2>
                  <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>From shared quarters for making connections to private retreats for quiet reflection - find your perfect island sanctuary</p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {[
                    {
                      title: "Shared Dormitory",
                      subtitle: "Social & Affordable",
                      description: "Connect with like-minded travelers in our mindfully designed shared spaces",
                      rating: 4.8,
                      guests: 4,
                      location: "Garden View",
                      price: "₱800",
                      link: "/rooms/dorm",
                      badge: "Community",
                      color: "#6AB19A",
                      image: "/shared.jpg",
                      features: ["Free WiFi", "Reading Nooks", "Personal Lockers", "Quiet Hours"]
                    },
                    {
                      title: "Private Double Room",
                      subtitle: "Peaceful Retreat",
                      description: "Your serene sanctuary with privacy and comfort for mindful island living",
                      rating: 4.9,
                      guests: 2,
                      location: "Sea View",
                      price: "₱1,500",
                      link: "/rooms/private-double",
                      badge: "Tranquility",
                      color: "#6AB19A",
                      image: "/rooftop.jpg",
                      features: ["Private Bathroom", "Fast WiFi", "Meditation Space", "Air Conditioning"]
                    },
                    {
                      title: "Deluxe Double Room",
                      subtitle: "Premium Comfort",
                      description: "Elevated sanctuary with extra amenities for the perfect island getaway",
                      rating: 4.9,
                      guests: 2,
                      location: "Ocean View",
                      price: "₱1,950",
                      link: "/rooms/deluxe-double",
                      badge: "Premium",
                      color: "#6AB19A",
                      image: "/placeholder.jpg",
                      features: ["Balcony", "Workspace", "Premium Bedding", "Rain Shower"]
                    },
                    {
                      title: "Twin Room",
                      subtitle: "Flexible Space",
                      description: "Comfortable twin beds in a bright, airy space - perfect for friends traveling together",
                      rating: 4.7,
                      guests: 2,
                      location: "Garden View",
                      price: "₱1,400",
                      link: "/rooms/twin",
                      badge: "Versatile",
                      color: "#6AB19A",
                      image: "/working.webp",
                      features: ["Twin Beds", "Work Desk", "Natural Light", "Air Conditioning"]
                    },
                    {
                      title: "Family Room",
                      subtitle: "Spacious Comfort",
                      description: "Spacious sanctuary for families seeking peaceful island experiences together",
                      rating: 4.8,
                      guests: 4,
                      location: "Panoramic View",
                      price: "₱2,200",
                      link: "/rooms/family",
                      badge: "Family",
                      color: "#6AB19A",
                      image: "/hero.jpg",
                      features: ["Queen & Single Beds", "Extra Space", "Family Amenities", "Private Bathroom"]
                    },
                    {
                      title: "Ocean Suite",
                      subtitle: "Premium Experience",
                      description: "Our most luxurious accommodation with breathtaking views and premium amenities",
                      rating: 5.0,
                      guests: 2,
                      location: "Ocean Front",
                      price: "₱2,800",
                      link: "/rooms/ocean-suite",
                      badge: "Exclusive",
                      color: "#6AB19A",
                      image: "/beach.jpg",
                      features: ["Private Balcony", "Kitchenette", "Premium Amenities", "Sunset Views"]
                    }
                  ].map((room, index) => (
                    <motion.div key={index} variants={scaleIn}>
                      <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-1" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E8', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <div className="relative h-64">
                          <Image
                            src={room.image}
                            alt={room.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          <Badge
                            className="absolute top-4 left-4 text-white border-0"
                            style={{ backgroundColor: room.color }}
                          >
                            {room.badge}
                          </Badge>
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{room.rating}</span>
                          </div>
                        </div>

                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-medium" style={{ color: '#2E2E2E' }}>{room.title}</CardTitle>
                          <CardDescription className="font-medium" style={{ color: '#6AB19A' }}>{room.subtitle}</CardDescription>
                          <p className="mt-2 leading-relaxed" style={{ color: '#5A5A5A' }}>{room.description}</p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm" style={{ color: '#5A5A5A' }}>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" style={{ color: '#6AB19A' }} />
                                <span>{room.guests} {room.guests === 1 ? 'guest' : 'guests'}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" style={{ color: '#6AB19A' }} />
                                <span>{room.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {room.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs" style={{ backgroundColor: '#F8F8F8', color: '#5A5A5A', border: '1px solid #E0E0E0' }}>
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #E8E8E8' }}>
                            <div>
                              <div className="text-2xl font-medium" style={{ color: '#2E2E2E' }}>{room.price}</div>
                              <div className="text-sm" style={{ color: '#5A5A5A' }}>per night</div>
                            </div>
                            <Link href={room.link}>
                              <Button className="rounded-xl" style={{ backgroundColor: '#6AB19A', color: 'white' }}>
                                View Room
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="mt-16 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link href="/rooms">
                    <Button
                      className="text-white px-10 py-6 text-lg font-medium rounded-xl hover:opacity-90 transition-all duration-300"
                      style={{ backgroundColor: '#6AB19A' }}
                    >
                      Explore All Rooms
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.section>

            {/* Call to Serenity Section */}
            <motion.section
              className="relative py-24 overflow-hidden"
              style={{ backgroundColor: '#6AB19A' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              {/* Subtle Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 border border-white/30 rounded-full"></div>
                <div className="absolute bottom-32 right-16 w-20 h-20 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-1/4 left-16 w-12 h-12 bg-white/15 rounded-full"></div>
              </div>

              <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                  className="flex items-center justify-center space-x-3 mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  <Waves className="w-6 h-6 text-white" />
                  <span className="text-white font-medium tracking-wide uppercase text-sm">Your Peaceful Island Retreat</span>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl font-light mb-8 leading-tight text-white"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Ready to Find<br />
                  <span className="font-medium">Your Island Peace?</span>
                </motion.h2>

                <motion.p
                  className="text-lg mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Join travelers who've discovered Siargao's gentle rhythms, formed meaningful connections, and found their perfect balance between adventure and tranquility at our peaceful island sanctuary
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Link href="/rooms">
                    <Button
                      size="lg"
                      className="text-white hover:opacity-90 text-xl px-10 py-5 font-bold min-w-[200px] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      style={{ backgroundColor: '#F5EFE6', color: '#2E2E2E' }}
                    >
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link href="/gallery">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white text-xl px-10 py-5 font-bold min-w-[200px] rounded-2xl transition-all duration-300"
                      style={{
                        borderColor: 'white',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#2E2E2E';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      See Island Vibes
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {[
                    { icon: "Free", title: "Zero Booking Fees", subtitle: "More money for island tours" },
                    { icon: "Cancel", title: "Free Cancellation", subtitle: "Weather happens, we get it" },
                    { icon: "Instant", title: "Instant Confirmation", subtitle: "Book now, surf tomorrow" },
                    { icon: "Tips", title: "Local Island Tips", subtitle: "Discover hidden lagoons" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center space-y-3 p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="text-3xl">{benefit.icon}</div>
                      <div className="text-lg font-semibold">{benefit.title}</div>
                      <div className="text-white/80 text-sm text-center">{benefit.subtitle}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
              style={{ backgroundColor: '#2E2E2E' }}
              className="text-white py-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="container mx-auto px-4">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-4 gap-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6AB19A' }}>
                        <Waves className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-light">Island Sanctuary</span>
                    </div>
                    <p className="mb-4 leading-relaxed" style={{ color: '#9CA3AF' }}>
                      Your gateway to peaceful Siargao experiences. Where mindful travel meets island serenity.
                    </p>
                    <div className="flex space-x-4">
                      {['Web', 'Photo', 'Chat', 'Mobile'].map((label, index) => (
                        <div key={index} className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300">
                          <span className="text-xs font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="font-bold mb-6 text-lg">Explore</h3>
                    <ul className="space-y-3 text-gray-400">
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Rooms & Rates</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Photo Gallery</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Siargao Guide</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Mindful Experiences</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="font-bold mb-6 text-lg">Support</h3>
                    <ul className="space-y-3 text-gray-400">
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Help Center</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Booking Policy</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>House Rules</li>
                      <li className="transition-colors cursor-pointer" style={{ color: '#9CA3AF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6AB19A'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>Safety Guidelines</li>
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <h3 className="font-bold mb-6 text-lg">Island Sanctuary</h3>
                    <div className="space-y-4 text-gray-400">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#6AB19A' }} />
                        <div>
                          <p className="font-medium text-white">Siargao Island Paradise</p>
                          <p className="text-sm">123 Peaceful Beach Road, General Luna, Siargao</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 flex items-center justify-center text-xs" style={{ color: '#6AB19A' }}>Ph</div>
                        <span>+63 912 PEACE-TIME</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 flex items-center justify-center text-xs" style={{ color: '#6AB19A' }}>@</div>
                        <span>hello@island-sanctuary-siargao.com</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="border-t border-gray-800 mt-12 pt-8 text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <p style={{ color: '#9CA3AF' }}>
                    &copy; 2024 Island Sanctuary Siargao. Made for mindful travelers, by island lovers.
                    <span style={{ color: '#6AB19A' }}> Find your peace today</span>
                  </p>
                </motion.div>
              </div>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
