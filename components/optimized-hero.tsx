"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
    Calendar as CalendarIcon,
    Search,
    Waves
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOptimizedAnimations } from "@/hooks/usePerformance"
import { useHeroPerformance } from "@/hooks/useHeroPerformance"

interface OptimizedHeroSectionProps {
    checkIn?: Date
    checkOut?: Date
    onCheckInChange: (date: Date | undefined) => void
    onCheckOutChange: (date: Date | undefined) => void
}

export function OptimizedHeroSection({
    checkIn,
    checkOut,
    onCheckInChange,
    onCheckOutChange
}: OptimizedHeroSectionProps) {
    const animationSettings = useOptimizedAnimations()
    const { measureHeroAnimation } = useHeroPerformance()

    // Memoized animation variants for performance
    const heroVariants = {
        section: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: {
                duration: animationSettings.duration * 1.5,
                delay: 0.1,
                ease: animationSettings.ease as any
            }
        },
        tagline: {
            initial: {
                opacity: 0,
                x: animationSettings.enableComplexAnimations ? -20 : 0
            },
            animate: { opacity: 1, x: 0 },
            transition: {
                duration: animationSettings.duration,
                delay: animationSettings.staggerDelay * 2,
                ease: animationSettings.ease as any
            }
        },
        heading: {
            initial: { opacity: 0, y: animationSettings.translateDistance },
            animate: { opacity: 1, y: 0 },
            transition: {
                duration: animationSettings.duration * 1.2,
                delay: animationSettings.staggerDelay * 3,
                ease: animationSettings.ease as any
            }
        },
        description: {
            initial: { opacity: 0, y: animationSettings.translateDistance / 2 },
            animate: { opacity: 1, y: 0 },
            transition: {
                duration: animationSettings.duration,
                delay: animationSettings.staggerDelay * 4,
                ease: animationSettings.ease as any
            }
        },
        form: {
            initial: { opacity: 0, y: animationSettings.translateDistance * 1.5 },
            animate: { opacity: 1, y: 0 },
            transition: {
                duration: animationSettings.duration * 1.1,
                delay: animationSettings.staggerDelay * 5,
                ease: animationSettings.ease as any
            }
        }
    }

    return (
        <motion.section
            className="relative min-h-screen flex items-center justify-center hero-section"
            style={{
                backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/beach.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // Hardware acceleration
                transform: 'translateZ(0)',
                willChange: animationSettings.useWillChange ? 'opacity' : 'auto'
            }}
            {...heroVariants.section}
        >
            {/* Simplified background elements - Static for better performance */}
            {animationSettings.enableComplexAnimations && (
                <div className="absolute inset-0 pointer-events-none hero-decorative-elements" style={{ opacity: 0.3 }}>
                    <div className="absolute top-20 left-10 w-16 h-16 border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-32 right-16 w-12 h-12 border border-white/15 rounded-full"></div>
                    <div className="absolute top-1/3 right-20 w-4 h-4 bg-white/20 rounded-full"></div>
                </div>
            )}

            <div className="container mx-auto px-4 text-center relative z-10 hero-content">
                {/* Optimized tagline with reduced motion */}
                <motion.div
                    className="flex items-center justify-center space-x-3 mb-8"
                    {...heroVariants.tagline}
                >
                    <Waves className="w-6 h-6 text-white" />
                    <span className="font-medium tracking-wide uppercase text-sm text-white">Discover • Rest • Connect</span>
                </motion.div>

                {/* Main heading with optimized animation */}
                <motion.h1
                    className="text-4xl md:text-6xl font-light mb-8 leading-relaxed text-white hero-text"
                    {...heroVariants.heading}
                    style={{ willChange: animationSettings.useWillChange ? 'transform, opacity' : 'auto' }}
                >
                    Your Peaceful <span className="text-teal-300">Island</span><br />
                    <span className="font-normal">Retreat in Siargao</span>
                </motion.h1>

                {/* Description with minimal animation */}
                <motion.p
                    className="text-lg mb-12 max-w-2xl mx-auto leading-relaxed text-white/90 hero-text"
                    {...heroVariants.description}
                >
                    Experience the serene beauty of island life. From gentle waves to quiet moments, find your perfect balance in our mindfully designed spaces.
                </motion.p>

                {/* Booking Search UI - Optimized with conditional backdrop blur */}
                <motion.div
                    className={`rounded-3xl p-8 md:p-10 max-w-4xl mx-auto shadow-lg hero-booking-form ${animationSettings.enableComplexAnimations
                            ? 'backdrop-blur-sm'
                            : 'bg-white/95'
                        }`}
                    style={{
                        backgroundColor: animationSettings.enableComplexAnimations ? '#FAFAFA' : 'rgba(250, 250, 250, 0.95)',
                        border: '1px solid #E0E0E0',
                        willChange: animationSettings.useWillChange ? 'transform, opacity' : 'auto'
                    }}
                    {...heroVariants.form}
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
                                        onSelect={onCheckInChange}
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
                                        onSelect={onCheckOutChange}
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
    )
}
