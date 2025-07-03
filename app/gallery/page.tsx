"use client"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

export default function GalleryPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [showContent, setShowContent] = useState(false)

    const handleLoadingComplete = () => {
        setIsLoading(false)
        setTimeout(() => setShowContent(true), 100)
    }

    useEffect(() => {
        // Simulate loading for demo purposes
        const timer = setTimeout(() => {
            handleLoadingComplete()
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    // Gallery images
    const galleryImages = [
        { src: "/hostel/lobby.svg", alt: "Hostel Lobby", title: "Reception & Lobby" },
        { src: "/hostel/lounge.svg", alt: "Common Area", title: "Common Lounge" },
        { src: "/hostel/cafe.svg", alt: "Cafe Area", title: "Café Corner" },
        { src: "/hostel/workspace.svg", alt: "Workspace", title: "Co-working Space" },
        { src: "/hostel/rooftop.svg", alt: "Rooftop Terrace", title: "Rooftop Terrace" },
        { src: "/placeholder.jpg", alt: "Dorm Room", title: "Shared Dorm (4 Beds)" },
        { src: "/placeholder.jpg", alt: "Private Room", title: "Private Room" },
        { src: "/placeholder.jpg", alt: "Family Room", title: "Family Room" },
        { src: "/placeholder.jpg", alt: "Bathroom", title: "Modern Bathroom" },
        { src: "/placeholder.jpg", alt: "Kitchen", title: "Shared Kitchen" },
        { src: "/placeholder.jpg", alt: "Dining Area", title: "Dining Area" },
        { src: "/placeholder.jpg", alt: "Game Room", title: "Game Room" },
    ]

    return (
        <div className="min-h-screen bg-background">
            {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

            {showContent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <motion.header
                        className="border-b"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Navbar currentPath="/gallery" />
                    </motion.header>

                    {/* Page Content */}
                    <div className="container mx-auto px-4 py-12">
                        {/* Page Title */}
                        <motion.div
                            className="text-center mb-12"
                            {...fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-bold mb-4">Hostel Gallery</h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Take a visual tour of our hostel facilities and accommodations
                            </p>
                        </motion.div>

                        {/* Gallery Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {galleryImages.map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-lg shadow-md h-64">
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 flex items-end p-4">
                                            <h3 className="text-white text-lg font-medium">{image.title}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Back to Home Button */}
                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <Link href="/">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                                    Back to Home
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <motion.footer
                        className="bg-muted py-8 mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <div className="container mx-auto px-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                &copy; 2024 HostelHub. All rights reserved.
                            </p>
                        </div>
                    </motion.footer>
                </motion.div>
            )}
        </div>
    )
}
