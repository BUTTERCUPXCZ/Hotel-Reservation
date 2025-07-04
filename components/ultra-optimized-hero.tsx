"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
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
import { useDevicePerformance } from "@/hooks/usePerformance"
import { useHeroCriticalImages } from "@/hooks/useImagePreload"
import { HeroLoadingFallback } from "@/components/hero-loading-fallback"

interface UltraOptimizedHeroSectionProps {
    checkIn?: Date
    checkOut?: Date
    onCheckInChange: (date: Date | undefined) => void
    onCheckOutChange: (date: Date | undefined) => void
}

// Main component wrapper with Suspense
export function UltraOptimizedHeroSection(props: UltraOptimizedHeroSectionProps) {
    return (
        <Suspense fallback={<HeroLoadingFallback />}>
            <HeroSectionContent {...props} />
        </Suspense>
    )
}

function HeroSectionContent({
    checkIn,
    checkOut,
    onCheckInChange,
    onCheckOutChange
}: UltraOptimizedHeroSectionProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [animationStage, setAnimationStage] = useState(0)
    const heroRef = useRef<HTMLElement>(null)
    const { isLowEndDevice, preferReducedMotion, isMobile } = useDevicePerformance()
    const { allImagesLoaded } = useHeroCriticalImages()

    // Wait for critical images before starting animations
    const canStartAnimation = allImagesLoaded || preferReducedMotion

    // Use CSS animations instead of Framer Motion for ultra-smooth performance
    useEffect(() => {
        // Don't start until images are loaded
        if (!canStartAnimation) return

        // Immediate load for reduced motion preference
        if (preferReducedMotion) {
            setIsLoaded(true)
            setAnimationStage(4)
            return
        }

        // Staggered animation using requestAnimationFrame for smoothness
        let timeoutId: NodeJS.Timeout
        let rafId: number

        const runAnimation = () => {
            rafId = requestAnimationFrame(() => {
                setIsLoaded(true)

                // Stagger animations with reduced timing for mobile
                const staggerDelay = isMobile || isLowEndDevice ? 100 : 150

                timeoutId = setTimeout(() => setAnimationStage(1), staggerDelay)
                timeoutId = setTimeout(() => setAnimationStage(2), staggerDelay * 2)
                timeoutId = setTimeout(() => setAnimationStage(3), staggerDelay * 3)
                timeoutId = setTimeout(() => setAnimationStage(4), staggerDelay * 4)
            })
        }

        // Small delay to ensure DOM is ready
        timeoutId = setTimeout(runAnimation, 50)

        return () => {
            clearTimeout(timeoutId)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [canStartAnimation, preferReducedMotion, isMobile, isLowEndDevice])

    // CSS class names for animation stages
    const getAnimationClass = (stage: number) => {
        if (preferReducedMotion) return 'hero-no-motion'
        if (animationStage >= stage) return 'hero-animate-in'
        return 'hero-animate-initial'
    }

    // Show loading fallback while images load
    if (!canStartAnimation) {
        return <HeroLoadingFallback />
    }

    return (
        <>
            <style jsx>{`
                .hero-section {
                    background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('/beach.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-attachment: ${isMobile ? 'scroll' : 'fixed'};
                }

                .hero-animate-initial {
                    opacity: 0;
                    transform: translateY(20px);
                }

                .hero-animate-in {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
                }

                .hero-no-motion {
                    opacity: 1;
                    transform: none;
                }

                .hero-tagline-initial {
                    opacity: 0;
                    transform: translateX(-10px);
                }

                .hero-tagline-in {
                    opacity: 1;
                    transform: translateX(0);
                    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
                }

                .hero-content {
                    contain: layout style paint;
                    will-change: ${isLowEndDevice ? 'auto' : 'transform'};
                }

                .hero-booking-form {
                    backdrop-filter: ${isLowEndDevice ? 'none' : 'blur(10px)'};
                    background-color: ${isLowEndDevice ? 'rgba(250, 250, 250, 0.98)' : 'rgba(250, 250, 250, 0.9)'};
                }

                .hero-text {
                    text-rendering: optimizeSpeed;
                }

                @media (max-width: 768px) {
                    .hero-animate-initial {
                        transform: translateY(10px);
                    }
                    .hero-tagline-initial {
                        transform: translateX(-5px);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hero-animate-initial,
                    .hero-animate-in,
                    .hero-tagline-initial,
                    .hero-tagline-in {
                        transition: none !important;
                        transform: none !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>

            <section
                ref={heroRef}
                className={`relative min-h-screen flex items-center justify-center hero-section ${getAnimationClass(0)}`}
                style={{
                    transform: 'translateZ(0)', // Force hardware acceleration
                    contain: 'layout style paint'
                }}
            >
                {/* Simplified decorative elements - only on high-end devices */}
                {!isLowEndDevice && !isMobile && animationStage >= 3 && (
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.2 }}>
                        <div className="absolute top-20 left-10 w-16 h-16 border border-white/20 rounded-full"></div>
                        <div className="absolute bottom-32 right-16 w-12 h-12 border border-white/15 rounded-full"></div>
                        <div className="absolute top-1/3 right-20 w-4 h-4 bg-white/20 rounded-full"></div>
                    </div>
                )}

                <div className="container mx-auto px-4 text-center relative z-10 hero-content">
                    {/* Optimized tagline */}
                    <div
                        className={`flex items-center justify-center space-x-3 mb-8 ${preferReducedMotion ? 'hero-no-motion' :
                                animationStage >= 1 ? 'hero-tagline-in' : 'hero-tagline-initial'
                            }`}
                    >
                        <Waves className="w-6 h-6 text-white" />
                        <span className="font-medium tracking-wide uppercase text-sm text-white">
                            Discover • Rest • Connect
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1
                        className={`text-4xl md:text-6xl font-light mb-8 leading-relaxed text-white hero-text ${getAnimationClass(2)}`}
                    >
                        Your Peaceful <span className="text-teal-300">Island</span><br />
                        <span className="font-normal">Retreat in Siargao</span>
                    </h1>

                    {/* Description */}
                    <p
                        className={`text-lg mb-12 max-w-2xl mx-auto leading-relaxed text-white/90 hero-text ${getAnimationClass(3)}`}
                    >
                        Experience the serene beauty of island life. From gentle waves to quiet moments,
                        find your perfect balance in our mindfully designed spaces.
                    </p>

                    {/* Booking form */}
                    <div
                        className={`rounded-3xl p-8 md:p-10 max-w-4xl mx-auto shadow-lg hero-booking-form border border-white/10 ${getAnimationClass(4)}`}
                    >
                        <div className="flex items-center space-x-3 mb-8">
                            <Search className="w-5 h-5 text-teal-600" />
                            <h3 className="text-lg font-medium text-gray-800">Find Your Island Sanctuary</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Check-in date */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Check-in</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal rounded-xl h-12 border-gray-200 bg-gray-50 hover:bg-gray-100"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
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

                            {/* Check-out date */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Check-out</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal rounded-xl h-12 border-gray-200 bg-gray-50 hover:bg-gray-100"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
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

                            {/* Guests */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Guests</label>
                                <Select defaultValue="2">
                                    <SelectTrigger className="rounded-xl h-12 border-gray-200 bg-gray-50">
                                        <SelectValue />
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

                            {/* Search button */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-transparent">Search</label>
                                <Button
                                    asChild
                                    className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    <Link href="/rooms">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search Rooms
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
