"use client"

import { useEffect, useState } from "react"

export function ContactPreloader() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    return 100
                }
                return prev + 20
            })
        }, 50)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto"
                    style={{ backgroundColor: '#6AB19A' }}>
                    <span className="text-white font-bold text-lg">K</span>
                </div>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#6AB19A] to-[#5a9c87] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-3">Loading Contact Page...</p>
            </div>
        </div>
    )
}
