"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 500) // Small delay before showing content
                    return 100
                }
                return prev + 2
            })
        }, 30)

        return () => clearInterval(timer)
    }, [onComplete])

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: '#F5EFE6' }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <div className="text-center">
                <motion.div
                    className="flex items-center space-x-2 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6AB19A' }}>
                        <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <span className="text-3xl font-bold">HostelHub</span>
                </motion.div>

                <motion.div
                    className="w-64 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#6AB19A' }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </motion.div>

                <motion.p
                    className="mt-4"
                    style={{ color: '#5A5A5A' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Preparing your perfect stay...
                </motion.p>
            </div>
        </motion.div>
    )
}