"use client"

export function HeroLoadingFallback() {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
            <div className="container mx-auto px-4 text-center">
                {/* Loading skeleton */}
                <div className="space-y-8 animate-pulse">
                    {/* Tagline skeleton */}
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-300 rounded w-96 mx-auto"></div>
                        <div className="h-12 bg-gray-300 rounded w-80 mx-auto"></div>
                    </div>

                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-full max-w-2xl mx-auto"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 max-w-xl mx-auto"></div>
                    </div>

                    {/* Form skeleton */}
                    <div className="bg-white/80 rounded-3xl p-8 max-w-4xl mx-auto">
                        <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                            <div className="h-12 bg-teal-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
