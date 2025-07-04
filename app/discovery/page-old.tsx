"use client"

import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { 
    Waves, 
    Compass, 
    Bike, 
    Coffee, 
    Music, 
    MapPin, 
    Star,
    Calendar,
    Users,
    Clock,
    ArrowRight,
    Camera,
    Utensils,
    Sunset
} from "lucide-react";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5 }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6 }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6 }
    }
};

// Check if reduced motion is preferred
const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function DiscoveryPage() {
    const shouldReduceMotion = prefersReducedMotion;

    return (
        <>
            <Navbar currentPath="/discovery" />
            <motion.div
                initial={shouldReduceMotion ? { opacity: 0.8 } : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
            >
                {/* Enhanced Hero Section */}
                <motion.div
                    className="relative h-[60vh] flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Background Image with Parallax Effect */}
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 0.9 } : { scale: 1.1 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1 }}
                        transition={{ duration: shouldReduceMotion ? 0.5 : 1.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/beach.jpg"
                            alt="Siargao Beach Paradise"
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
                    </motion.div>

                    {/* Hero Content */}
                    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="mb-6"
                        >
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                                <MapPin className="w-4 h-4 mr-2" />
                                Siargao Island, Philippines
                            </Badge>
                        </motion.div>
                        
                        <motion.h1
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Discover
                            <span className="block text-[#6AB19A]">Siargao's Soul</span>
                        </motion.h1>
                        
                        <motion.p
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
                        >
                            From world-class surf breaks to hidden lagoons, experience the authentic island life 
                            that makes Siargao truly magical.
                        </motion.p>

                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Button size="lg" className="bg-[#6AB19A] hover:bg-[#5a9d87] text-white px-8 py-3">
                                Start Your Adventure
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8 py-3">
                                <Camera className="mr-2 h-5 w-5" />
                                View Gallery
                            </Button>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                        >
                            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <div className="container mx-auto px-4 py-16 max-w-7xl">
                    {/* Activities Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="mb-20"
                    >
                        <div className="text-center mb-16">
                            <motion.h2 
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
                            >
                                Island Adventures
                            </motion.h2>
                            <motion.p 
                                variants={fadeInUp}
                                className="text-xl text-gray-600 max-w-2xl mx-auto"
                            >
                                Every day brings new possibilities for adventure and discovery
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Surf Sessions Card */}
                            <motion.div variants={scaleIn} className="group">
                                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src="/hero.jpg"
                                            alt="Surf Sessions at Cloud 9"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-[#6AB19A] text-white">
                                                <Waves className="w-4 h-4 mr-1" />
                                                Surfing
                                            </Badge>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl group-hover:text-[#6AB19A] transition-colors">
                                                Surf Sessions & Lessons
                                            </CardTitle>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm ml-1">4.9</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            Master the legendary Cloud 9 break with our expert instructors. From beginner-friendly waves to advanced barrel riding.
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                2-4 hours
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                1-8 people
                                            </div>
                                        </div>
                                        <Button className="w-full bg-[#6AB19A] hover:bg-[#5a9d87] text-white">
                                            Book Surf Session
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Island Hopping Card */}
                            <motion.div variants={scaleIn} className="group">
                                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src="/Sugba-Lagoon.webp"
                                            alt="Sugba Lagoon Island Hopping"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-blue-500 text-white">
                                                <Compass className="w-4 h-4 mr-1" />
                                                Island Hopping
                                            </Badge>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl group-hover:text-[#6AB19A] transition-colors">
                                                Island Hopping Tours
                                            </CardTitle>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm ml-1">4.8</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            Explore pristine lagoons, hidden beaches, and secret coves. Swim in crystal-clear waters and discover untouched paradise.
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Full day
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                4-12 people
                                            </div>
                                        </div>
                                        <Button className="w-full bg-[#6AB19A] hover:bg-[#5a9d87] text-white">
                                            Discover Islands
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Motorbike Adventures Card */}
                            <motion.div variants={scaleIn} className="group">
                                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src="/coconut.jpg"
                                            alt="Motorbike Island Adventures"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-orange-500 text-white">
                                                <Bike className="w-4 h-4 mr-1" />
                                                Land Adventures
                                            </Badge>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl group-hover:text-[#6AB19A] transition-colors">
                                                Motorbike Island Tours
                                            </CardTitle>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm ml-1">4.7</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            Freedom to explore at your own pace. Premium bikes with surf racks to reach the most remote surf spots and viewpoints.
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Flexible
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                Individual
                                            </div>
                                        </div>
                                        <Button className="w-full bg-[#6AB19A] hover:bg-[#5a9d87] text-white">
                                            Rent Motorbike
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Foodie Experience Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="mb-20"
                    >
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div variants={slideInLeft}>
                                <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                                    <Image
                                        src="/coffee.jpg"
                                        alt="Local Food Experience"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-yellow-500 text-white">
                                            <Utensils className="w-4 h-4 mr-1" />
                                            Food Culture
                                        </Badge>
                                    </div>
                                </div>
                            </motion.div>
                            
                            <motion.div variants={slideInRight} className="space-y-6">
                                <div>
                                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                                        Taste the Island
                                    </h2>
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        From sunrise coffee to sunset cocktails, discover the flavors that make Siargao special.
                                    </p>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="breakfast" className="border-gray-200">
                                        <AccordionTrigger className="text-lg font-semibold hover:text-[#6AB19A]">
                                            <div className="flex items-center">
                                                <Coffee className="w-5 h-5 mr-3 text-[#6AB19A]" />
                                                Morning Rituals
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600 leading-relaxed">
                                            Start your day with the island's best coffee spots. From traditional kapeng barako to specialty third-wave coffee, 
                                            plus fresh coconut bowls and hearty Filipino breakfast classics.
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="lunch" className="border-gray-200">
                                        <AccordionTrigger className="text-lg font-semibold hover:text-[#6AB19A]">
                                            <div className="flex items-center">
                                                <Utensils className="w-5 h-5 mr-3 text-[#6AB19A]" />
                                                Local Favorites
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600 leading-relaxed">
                                            Authentic Filipino cuisine and international fusion made with locally sourced ingredients. 
                                            Fresh seafood, tropical fruits, and vegetarian options that showcase Siargao's bounty.
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="dinner" className="border-gray-200">
                                        <AccordionTrigger className="text-lg font-semibold hover:text-[#6AB19A]">
                                            <div className="flex items-center">
                                                <Sunset className="w-5 h-5 mr-3 text-[#6AB19A]" />
                                                Sunset Vibes
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600 leading-relaxed">
                                            Beachfront dining, hidden cocktail bars, and rooftop restaurants with stunning views. 
                                            Where island time meets culinary excellence under the tropical stars.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Button className="bg-[#6AB19A] hover:bg-[#5a9d87] text-white px-8 py-3">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Get Food Map
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Music & Culture Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeInUp}
                        className="relative rounded-2xl overflow-hidden mb-20 shadow-2xl"
                    >
                        <div className="relative h-[500px]">
                            <Image
                                src="/rooftop.jpg"
                                alt="Music and Culture at Kayan"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-4xl px-6">
                                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
                                        <Music className="w-4 h-4 mr-2" />
                                        Island Rhythms
                                    </Badge>
                                    
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                        Feel the Beat of Siargao
                                    </h2>
                                    
                                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                                        Music flows through everything we do. From sunrise acoustic sessions to sunset DJ sets, 
                                        experience the soundtrack of island life that connects souls and creates memories.
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button variant="outline" className="border-white text-white hover:bg-white/20 px-6 py-3">
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Event Schedule
                                        </Button>
                                        <Button className="bg-[#6AB19A] hover:bg-[#5a9d87] text-white px-6 py-3">
                                            <Music className="mr-2 h-5 w-5" />
                                            Live Sessions
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Call to Action Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={scaleIn}
                        className="text-center bg-gradient-to-r from-[#6AB19A] to-[#5a9d87] rounded-2xl p-12 text-white shadow-2xl"
                    >
                        <h2 className="text-4xl font-bold mb-6">Ready for Your Siargao Adventure?</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Join us at Kayan and discover why Siargao captures hearts and creates lifelong memories.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="secondary" className="bg-white text-[#6AB19A] hover:bg-gray-100 px-8 py-3">
                                Book Your Stay
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8 py-3">
                                Contact Us
                            </Button>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mt-16 py-8 border-t border-gray-200"
                    >
                        <p className="text-gray-600 mb-2">
                            All experiences can be arranged at our reception or pre-booked before arrival.
                        </p>
                        <p className="text-sm text-gray-500">
                            Kayan Hostel - Where island dreams become reality
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.1, margin: "100px" }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col lg:flex-row gap-12 mb-20"
                >
                    <motion.div
                        className="lg:w-1/2 will-change-transform"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -30 }}
                        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="relative h-[500px] rounded-xl overflow-hidden">
                            <Image
                                src="/coffee.jpg"
                                alt="Local Food & Drink"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        className="lg:w-1/2 flex flex-col justify-center will-change-transform"
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
                        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="text-3xl font-bold mb-6"
                        >
                            Local Food & Drink Recommendations
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="text-lg mb-6 text-muted-foreground"
                        >
                            We know where to eat and who makes the best cocktails. Ask us for our personal picks.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.4 }}
                            className="will-change-opacity"
                        >
                            <Accordion type="single" collapsible className="w-full">
                                <motion.div
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <AccordionItem value="breakfast">
                                        <AccordionTrigger>Best Breakfast Spots</AccordionTrigger>
                                        <AccordionContent>
                                            From fresh coconut bowls to Filipino breakfast classics, we'll point you to the most delicious morning meals on the island.
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>

                                <motion.div
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <AccordionItem value="lunch">
                                        <AccordionTrigger>Local Lunch Favorites</AccordionTrigger>
                                        <AccordionContent>
                                            Experience authentic Filipino cuisine and international options made with locally sourced ingredients.
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>

                                <motion.div
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <AccordionItem value="dinner">
                                        <AccordionTrigger>Dinner & Nightlife</AccordionTrigger>
                                        <AccordionContent>
                                            From beachfront seafood to hidden cocktail bars, we know all the spots that make Siargao nights unforgettable.
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            </Accordion>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 1.2 }}
                            >
                                <Button className="mt-8 w-fit bg-[#6AB19A] text-white">View Our Food Map</Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Music Section */}
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                    whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.1, margin: "50px" }}
                    className="relative rounded-xl overflow-hidden mb-20 will-change-opacity"
                >
                    <div className="relative h-[400px]">
                        <Image
                            src="/rooftop.jpg"
                            alt="Music at Kayan"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-6">
                            <motion.h2
                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                                whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-4xl font-bold text-white mb-6"
                            >
                                Music at Kayan
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                viewport={{ once: true }}
                                className="text-lg md:text-xl text-white max-w-3xl"
                            >
                                Music is part of how we breathe. Whether it's mellow mornings, golden hour sets, or spontaneous jams in the lounge,
                                you'll always find a rhythm here. We host live sessions, DJ nights, and curated playlists that match the island's mood—raw,
                                vibrant, and full of soul.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                viewport={{ once: true }}
                            >
                                <Button variant="outline" className="mt-8 text-white border-white hover:bg-white/20">
                                    Upcoming Events
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <Card className="mb-12">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl">Ready to Experience Siargao?</CardTitle>
                            <CardDescription className="text-lg">
                                Let us help you plan the perfect island adventure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row justify-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Button className="bg-[#6AB19A] text-white" variant="default" size="lg">Book Your Stay</Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Button variant="outline" size="lg">Contact Us</Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Separator className="my-12" />

                {/* Footer Note */}
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
                    whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="text-center text-muted-foreground mb-8 will-change-opacity"
                >
                    <p>All activities can be arranged at our reception desk or pre-booked before your arrival.</p>
                    <p className="mt-2">Kayan Hostel - Your gateway to authentic Siargao experiences.</p>
                </motion.div>
            </motion.div>
        </>
    );
}