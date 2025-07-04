import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function FeaturedRoomsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
                <Card
                    key={index}
                    className="overflow-hidden h-full transition-all duration-500 border-0 hover:-translate-y-1"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E8E8',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                    }}
                >
                    <div className="relative">
                        <Skeleton className="h-48 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        <div className="absolute top-4 left-4">
                            <Badge className="text-white text-xs border-0" style={{ backgroundColor: '#6AB19A' }}>
                                <Skeleton className="h-3 w-16 bg-transparent" />
                            </Badge>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <Skeleton className="h-6 w-3/4 mb-2" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                                <Skeleton className="h-4 w-1/2" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <Skeleton className="h-6 w-20 mb-1" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                                    <Skeleton className="h-3 w-24" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                                </div>
                                <Skeleton className="h-10 w-24 rounded-xl" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function DestinationHighlightsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-44 w-full rounded-xl" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                <Skeleton className="h-44 w-full rounded-xl" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
        </div>
    )
}

export function SpacesShowcaseSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 row-span-2">
                <Skeleton className="min-h-[500px] w-full rounded-2xl" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
            {[...Array(4)].map((_, index) => (
                <Skeleton
                    key={index}
                    className="h-60 w-full rounded-xl"
                    style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }}
                />
            ))}
        </div>
    )
}

export function FeaturesGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, index) => (
                <Card
                    key={index}
                    className="h-full transition-all duration-500 border-0"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E8E8',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                    }}
                >
                    <CardHeader className="text-center pb-6 pt-8">
                        <Skeleton
                            className="mx-auto mb-6 w-14 h-14 rounded-full"
                            style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }}
                        />
                        <Skeleton className="h-5 w-32 mx-auto" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                    </CardHeader>
                    <CardContent className="px-6 pb-8">
                        <Skeleton className="h-20 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TestimonialsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-md h-full relative" style={{ border: '1px solid #E0E0E0' }}>
                    <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md" style={{ border: '1px solid #E0E0E0' }}>
                        <Skeleton className="h-5 w-5 rounded-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                    </div>
                    <div className="mt-5 mb-8">
                        <Skeleton className="h-4 w-full mb-2" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        <Skeleton className="h-4 w-full mb-2" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        <Skeleton className="h-4 w-3/4" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="w-12 h-12 rounded-full mr-4" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        <div>
                            <Skeleton className="h-4 w-24 mb-1" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                            <Skeleton className="h-3 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        </div>
                        <div className="ml-auto">
                            <Skeleton className="h-4 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function DataLoadingIndicator() {
    return (
        <motion.div
            className="fixed bottom-8 right-8 z-50 bg-white rounded-full p-3 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{ border: '1px solid #E0E0E0' }}
        >
            <div className="flex items-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 rounded-full border-t-transparent" style={{ borderColor: '#6AB19A', borderTopColor: 'transparent' }}></div>
                <span className="text-sm font-medium" style={{ color: '#5A5A5A' }}>Loading data...</span>
            </div>
        </motion.div>
    )
}
