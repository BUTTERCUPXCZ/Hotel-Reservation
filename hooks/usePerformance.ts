"use client"

import { useState, useEffect } from 'react'

interface DevicePerformance {
    isLowEndDevice: boolean
    isSlowConnection: boolean
    preferReducedMotion: boolean
    isMobile: boolean
    isTablet: boolean
}

export function useDevicePerformance(): DevicePerformance {
    const [performance, setPerformance] = useState<DevicePerformance>({
        isLowEndDevice: false,
        isSlowConnection: false,
        preferReducedMotion: false,
        isMobile: false,
        isTablet: false
    })

    useEffect(() => {
        // Check if user prefers reduced motion
        const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        // Detect mobile and tablet
        const isMobile = window.innerWidth <= 768
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024

        // Estimate device performance based on hardware concurrency and memory
        const hardwareConcurrency = navigator.hardwareConcurrency || 4
        // @ts-ignore - deviceMemory is not in all browsers
        const deviceMemory = navigator.deviceMemory || 4

        // Consider low-end if less than 4 cores or less than 4GB RAM
        const isLowEndDevice = hardwareConcurrency < 4 || deviceMemory < 4

        // Check connection speed if available
        // @ts-ignore - connection is not in all browsers
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
        const isSlowConnection = connection ?
            (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.effectiveType === '3g')
            : false

        setPerformance({
            isLowEndDevice,
            isSlowConnection,
            preferReducedMotion,
            isMobile,
            isTablet
        })
    }, [])

    return performance
}

// Hook to get optimized animation settings based on device performance
export function useOptimizedAnimations() {
    const { isLowEndDevice, isSlowConnection, preferReducedMotion, isMobile } = useDevicePerformance()

    const shouldReduceAnimations = isLowEndDevice || isSlowConnection || preferReducedMotion || isMobile

    return {
        // Reduced durations for low-end devices
        duration: shouldReduceAnimations ? 0.2 : 0.4,
        staggerDelay: shouldReduceAnimations ? 0.02 : 0.05,

        // Simplified easing
        ease: shouldReduceAnimations ? "linear" : "easeOut",

        // Disable complex animations
        enableComplexAnimations: !shouldReduceAnimations,

        // Viewport margins for intersection observer
        viewportMargin: shouldReduceAnimations ? "-20px" : "-50px",

        // Whether to use will-change optimization
        useWillChange: !isLowEndDevice,

        // Scale animations
        scaleRange: shouldReduceAnimations ? [0.98, 1] : [0.95, 1],

        // Translation distances
        translateDistance: shouldReduceAnimations ? 10 : 20
    }
}
