"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    if (onComplete) {
                        setTimeout(onComplete, 200) // Reduced delay for faster transition
                    }
                    return 100
                }
                return prev + 3 // Faster progress increment
            })
        }, 20) // Reduced interval for smoother animation

        return () => clearInterval(timer)
    }, [onComplete])

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: '#F5EFE6' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            <div className="text-center">
                <motion.div
                    className="flex items-center space-x-3 mb-8"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#6AB19A' }}>
                        <span className="text-white font-bold text-2xl">K</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-3xl font-bold" style={{ color: '#2E2E2E' }}>Kayan</span>
                        <span className="text-sm font-medium" style={{ color: '#6AB19A' }}>Island Sanctuary Siargao</span>
                    </div>
                </motion.div>

                <motion.div
                    className="relative w-72 h-3 rounded-full overflow-hidden"
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
                    <motion.div
                        className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                            backgroundSize: '200% 100%'
                        }}
                        animate={{
                            backgroundPosition: ['0% 0%', '200% 0%']
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </motion.div>

                <motion.div className="mt-8 space-y-2">
                    <motion.p
                        className="text-lg font-medium"
                        style={{ color: '#2E2E2E' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Preparing your island experience
                    </motion.p>
                    <motion.p
                        className="text-sm"
                        style={{ color: '#5A5A5A' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        Find your peace at Kayan
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    )
}