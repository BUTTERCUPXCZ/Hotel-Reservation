"use client"

import { useState, useEffect, useRef, Suspense, lazy } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Mail,
    MapPin,
    Phone,
    Instagram,
    Clock,
    Send,
    User,
    MessageSquare,
    ChevronDown,
    ArrowRight,
    Facebook,
    Twitter
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Optimized loading fallback component
const LoadingFallback = () => (
    <div className="min-h-screen flex flex-col bg-background">
        <div className="animate-pulse">
            <div className="h-16 bg-gray-200 mb-4"></div>
            <div className="h-[400px] bg-gradient-to-r from-gray-200 to-gray-300 mb-8"></div>
            <div className="container mx-auto px-4 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    </div>
)

// Optimized contact info component
const ContactInfo = ({ activeTab }: { activeTab: string }) => {
    const contactData = {
        general: {
            email: "kayansiargao@gmail.com",
            phone: "+63 XXX XXX XXXX",
            hours: "7:00 AM - 10:00 PM daily",
            social: {
                instagram: "https://instagram.com/kayansiargao",
                facebook: "#",
                twitter: "#"
            }
        }
    }

    return contactData.general
}

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [activeTab, setActiveTab] = useState("general")
    const [isLoaded, setIsLoaded] = useState(false)
    const contactRef = useRef<HTMLDivElement>(null)

    // Faster loading with useEffect optimization
    useEffect(() => {
        // Set page title and meta description for SEO
        document.title = "Contact Us - Kayan Siargao Hostel"
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute('content', 'Get in touch with Kayan Siargao. Contact us for bookings, inquiries, or directions. We\'re here to help make your stay unforgettable.')
        } else {
            const meta = document.createElement('meta')
            meta.name = 'description'
            meta.content = 'Get in touch with Kayan Siargao. Contact us for bookings, inquiries, or directions. We\'re here to help make your stay unforgettable.'
            document.head.appendChild(meta)
        }

        // Set loaded state immediately to show content faster
        setIsLoaded(true)

        // Preload critical resources
        const preloadImages = () => {
            const images = ['/beach.jpg']
            images.forEach(src => {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'image'
                link.href = src
                document.head.appendChild(link)
            })
        }
        preloadImages()

        // Defer heavy animations until after initial render
        const timer = setTimeout(() => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-bottom')
                    }
                })
            }, { threshold: 0.05, rootMargin: '100px' }) // Increased rootMargin for earlier trigger

            const elements = document.querySelectorAll('.animate-on-scroll')
            elements.forEach(el => observer.observe(el))

            return () => {
                elements.forEach(el => observer.unobserve(el))
            }
        }, 50) // Reduced delay

        return () => clearTimeout(timer)
    }, [])

    const validateForm = () => {
        let valid = true
        const errors = {
            name: "",
            email: "",
            subject: "",
            message: ""
        }

        if (!formData.name.trim()) {
            errors.name = "Name is required"
            valid = false
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required"
            valid = false
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address"
            valid = false
        }

        if (!formData.subject.trim()) {
            errors.subject = "Subject is required"
            valid = false
        }

        if (!formData.message.trim()) {
            errors.message = "Message is required"
            valid = false
        } else if (formData.message.trim().length < 10) {
            errors.message = "Message should be at least 10 characters"
            valid = false
        }

        setFormErrors(errors)
        return valid
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const scrollToContact = () => {
        contactRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        // Optimized form submission with faster response
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSubmitted(true)
            setFormData({ name: "", email: "", subject: "", message: "" })

            // Reset success message after 5 seconds (reduced from 7)
            setTimeout(() => setIsSubmitted(false), 5000)
        }, 800) // Reduced from 1500ms
    }

    // Early return loading state for faster perceived performance
    if (!isLoaded) {
        return <LoadingFallback />
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar currentPath="/Contact" />

            {/* Hero Section - Enhanced with faster loading */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <Image
                    src="/beach.jpg"
                    alt="Kayan Siargao Beachfront"
                    fill
                    priority
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyepckKjgDHEUVLzN9g=="
                    className="object-cover brightness-[0.65] scale-100 transition-transform duration-700 ease-out hover:scale-105"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col items-center justify-center px-4">
                    <div className="max-w-4xl text-center">
                        <Badge className="mb-4 bg-[#6AB19A]/90 hover:bg-[#6AB19A] text-white border-none px-3 py-1">
                            24/7 Support
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md mb-4 tracking-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                            We're here to answer your questions and make your stay at Kayan Siargao unforgettable.
                        </p>
                        <Button
                            onClick={scrollToContact}
                            size="lg"
                            className="bg-[#6AB19A] hover:bg-[#5a9c87] text-white border-none shadow-lg group"
                        >
                            Contact Us Now
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            {/* Main Content - Optimized loading */}
            <div className="container mx-auto px-4 py-12 max-w-6xl" ref={contactRef}>
                {/* Info Tabs Section - Pre-rendered content */}
                <div className="mb-12 animate-on-scroll opacity-0">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">How Can We Help You?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Choose the type of inquiry below to get the most relevant information.
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded mb-8 max-w-2xl mx-auto"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    }>
                        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-3 mb-8 w-full max-w-2xl mx-auto bg-muted/50">
                                <TabsTrigger value="general">General Inquiries</TabsTrigger>
                                <TabsTrigger value="booking">Booking Help</TabsTrigger>
                                <TabsTrigger value="directions">Directions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="mt-0 animate-on-scroll opacity-0">
                                <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="w-full md:w-1/2 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#6AB19A]/10 p-3 rounded-full">
                                                        <Mail className="h-6 w-6 text-[#6AB19A]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg">Email Us</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            We typically respond within 24 hours
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href="mailto:kayansiargao@gmail.com"
                                                    className="inline-flex items-center text-[#6AB19A] hover:text-[#5a9c87] font-medium group"
                                                >
                                                    kayansiargao@gmail.com
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </a>

                                                <div className="mt-6 flex items-center gap-3">
                                                    <div className="bg-[#6AB19A]/10 p-3 rounded-full">
                                                        <Phone className="h-6 w-6 text-[#6AB19A]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg">Call Us</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Available 7:00 AM - 10:00 PM daily
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href="tel:+63XXXXXXXX"
                                                    className="inline-flex items-center text-[#6AB19A] hover:text-[#5a9c87] font-medium group"
                                                >
                                                    +63 XXX XXX XXXX
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </a>
                                            </div>

                                            <div className="w-full md:w-1/2 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#6AB19A]/10 p-3 rounded-full">
                                                        <Instagram className="h-6 w-6 text-[#6AB19A]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg">Social Media</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Follow us for updates and promotions
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <a
                                                        href="https://instagram.com/kayansiargao"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#6AB19A]/5 hover:bg-[#6AB19A]/10 p-3 rounded-full transition-colors"
                                                    >
                                                        <Instagram className="h-5 w-5 text-[#6AB19A]" />
                                                    </a>
                                                    <a
                                                        href="#"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#6AB19A]/5 hover:bg-[#6AB19A]/10 p-3 rounded-full transition-colors"
                                                    >
                                                        <Facebook className="h-5 w-5 text-[#6AB19A]" />
                                                    </a>
                                                    <a
                                                        href="#"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#6AB19A]/5 hover:bg-[#6AB19A]/10 p-3 rounded-full transition-colors"
                                                    >
                                                        <Twitter className="h-5 w-5 text-[#6AB19A]" />
                                                    </a>
                                                </div>

                                                <div className="mt-6 flex items-center gap-3">
                                                    <div className="bg-[#6AB19A]/10 p-3 rounded-full">
                                                        <Clock className="h-6 w-6 text-[#6AB19A]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg">Reception Hours</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Open daily from 7:00 AM to 10:00 PM
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="booking" className="mt-0 animate-on-scroll opacity-0">
                                <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
                                    <CardContent className="pt-6">
                                        <div className="grid gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-[#6AB19A]/10 p-3 rounded-full shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6AB19A]">
                                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                                        <line x1="16" x2="16" y1="2" y2="6" />
                                                        <line x1="8" x2="8" y1="2" y2="6" />
                                                        <line x1="3" x2="21" y1="10" y2="10" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-lg">Booking Questions</h3>
                                                    <p className="text-muted-foreground mb-2">
                                                        For the fastest booking assistance, please email us with your:
                                                    </p>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                                        <li>Desired check-in and check-out dates</li>
                                                        <li>Number of guests</li>
                                                        <li>Room type preference (if any)</li>
                                                        <li>Special requests or questions</li>
                                                    </ul>
                                                    <a
                                                        href="mailto:kayansiargao@gmail.com?subject=Booking%20Inquiry"
                                                        className="inline-flex items-center text-[#6AB19A] hover:text-[#5a9c87] font-medium mt-4 group"
                                                    >
                                                        Email Booking Department
                                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="border-t border-border pt-4 mt-2">
                                                <div className="bg-[#6AB19A]/5 rounded-lg p-4 flex items-start gap-3">
                                                    <div className="text-[#6AB19A] mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 16v-4" />
                                                            <path d="M12 8h.01" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#6AB19A]">Pro Tip</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            You can also make instant bookings through our website's <Link href="/booking" className="text-[#6AB19A] hover:underline">booking page</Link> for immediate confirmation.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="directions" className="mt-0 animate-on-scroll opacity-0">
                                <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-1/2">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="bg-[#6AB19A]/10 p-3 rounded-full shrink-0">
                                                        <MapPin className="h-6 w-6 text-[#6AB19A]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-lg">Finding Us</h3>
                                                        <p className="text-muted-foreground mb-3">
                                                            We're located on the beautiful Siargao Island, Philippines.
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-medium text-foreground">From Sayak Airport (IAO):</span><br />
                                                            Approximately 30-40 minutes by car or van. We can arrange airport transfers for you when you book.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-[#6AB19A]/5 rounded-lg p-4">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Note:</span> For security and privacy, we provide the exact location details after your booking is confirmed.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/2 h-[250px] rounded-lg overflow-hidden">
                                                <iframe
                                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253200.67763892546!2d126.04156539800065!3d9.850249582433654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3301f3280aaa321f%3A0x1be6642a39ba547!2sSiargao%20Island!5e0!3m2!1sen!2sph!4v1720067234740!5m2!1sen!2sph"
                                                    width="100%"
                                                    height="100%"
                                                    className="border-0 rounded-lg"
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </Suspense>
                </div>

                <div className="flex justify-center">
                    {/* Contact Form - Optimized with lazy loading */}
                    <Suspense fallback={
                        <div className="animate-pulse w-full max-w-2xl">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    }>
                        <Card className="border-none shadow-lg w-full max-w-2xl animate-on-scroll opacity-0">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#6AB19A]/10 p-2 rounded-full">
                                        <MessageSquare className="h-5 w-5 text-[#6AB19A]" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-800">Send Us a Message</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    Have questions or special requests? Fill out this form and we'll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-4">
                                {isSubmitted ? (
                                    <div className="bg-green-50 text-green-700 p-5 rounded-lg flex items-start gap-3 border border-green-200 animate-in fade-in-50 duration-300">
                                        <div className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-800 mb-1">Message Sent Successfully!</h3>
                                            <p>Thank you for contacting us. We've received your message and will respond within 24 hours.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-[#6AB19A]" />
                                                    Your Name
                                                </label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    className={`focus:ring-[#6AB19A] focus:border-[#6AB19A] ${formErrors.name ? "border-red-300" : ""}`}
                                                />
                                                {formErrors.name && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-[#6AB19A]" />
                                                    Email Address
                                                </label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    className={`focus:ring-[#6AB19A] focus:border-[#6AB19A] ${formErrors.email ? "border-red-300" : ""}`}
                                                />
                                                {formErrors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6AB19A]">
                                                    <line x1="4" x2="20" y1="12" y2="12" />
                                                    <line x1="4" x2="20" y1="6" y2="6" />
                                                    <line x1="4" x2="20" y1="18" y2="18" />
                                                </svg>
                                                Subject
                                            </label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="What is this regarding?"
                                                className={`focus:ring-[#6AB19A] focus:border-[#6AB19A] ${formErrors.subject ? "border-red-300" : ""}`}
                                            />
                                            {formErrors.subject && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-[#6AB19A]" />
                                                Message
                                            </label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Your message here..."
                                                className={`resize-none focus:ring-[#6AB19A] focus:border-[#6AB19A] min-h-[120px] ${formErrors.message ? "border-red-300" : ""}`}
                                                rows={4}
                                            />
                                            {formErrors.message && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                                            )}
                                        </div>
                                        <div className="pt-3">
                                            <Button
                                                type="submit"
                                                className="w-full bg-[#6AB19A] text-white hover:bg-[#5a9c87] transition-all duration-300 shadow-md hover:shadow-lg"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending Message...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </Suspense>
                </div>
            </div>

            {/* Social Proof Section - Lazy loaded */}
            <Suspense fallback={
                <div className="animate-pulse bg-gray-100 py-12 mt-8">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <div className="bg-[#6AB19A]/5 py-12 mt-8 animate-on-scroll opacity-0">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-8">
                            <Badge className="mb-3 bg-[#6AB19A]/80 hover:bg-[#6AB19A] text-white border-none">
                                Guest Experiences
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">What Our Guests Say</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Don't just take our word for it—here's what recent visitors have shared about their stay at Kayan Siargao.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Testimonial 1 */}
                            <Card className="bg-white border-none shadow-md overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 italic mb-4">
                                        "The staff at Kayan Siargao were incredibly helpful. They arranged surfing lessons for me and gave excellent local recommendations. The beachfront location is unbeatable!"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-[#6AB19A]/20 flex items-center justify-center text-[#6AB19A] font-bold">
                                            ML
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium">Maria L.</p>
                                            <p className="text-sm text-muted-foreground">Manila, Philippines</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Testimonial 2 */}
                            <Card className="bg-white border-none shadow-md overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 italic mb-4">
                                        "Perfect place to stay in Siargao! Clean rooms, friendly staff, and great amenities. I loved the community atmosphere and met so many cool travelers. Will definitely return!"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-[#6AB19A]/20 flex items-center justify-center text-[#6AB19A] font-bold">
                                            JT
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium">James T.</p>
                                            <p className="text-sm text-muted-foreground">Sydney, Australia</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Testimonial 3 */}
                            <Card className="bg-white border-none shadow-md overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <svg className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 italic mb-4">
                                        "My partner and I stayed at Kayan for our honeymoon, and it exceeded our expectations. The view from our room was spectacular, and the staff made our stay truly special with thoughtful touches."
                                    </p>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-[#6AB19A]/20 flex items-center justify-center text-[#6AB19A] font-bold">
                                            SK
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium">Sarah K.</p>
                                            <p className="text-sm text-muted-foreground">Seoul, South Korea</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>                    </div>
                </div>
            </Suspense>

            {/* CTA Section - Enhanced with faster transitions */}
            <div className="bg-gradient-to-r from-[#6AB19A]/90 to-[#5a9c87] py-16 mt-12 animate-on-scroll opacity-0">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Ready to Experience Kayan Siargao?</h2>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                        Book your stay now and enjoy the perfect blend of comfort, adventure, and island living. Limited rooms available for the upcoming season.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-white text-[#6AB19A] hover:bg-gray-100 shadow-lg hover:shadow-xl border-none transition-all">
                            <Link href="/rooms" className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                </svg>
                                Book Your Stay
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add optimized CSS for faster animations */}
            <style jsx global>{`
                .animate-on-scroll {
                    transition: all 0.4s ease-out;
                    transform: translateY(10px);
                }
                .fade-in-bottom {
                    opacity: 1 !important;
                    transform: translateY(0);
                }
                @keyframes floatUp {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                    100% { transform: translateY(0); }
                }
                /* Preload optimizations */
                .contact-page-loaded * {
                    animation-play-state: running;
                }
            `}</style>
        </div>
    )
}
