"use client"

import { useEffect, useRef, useState } from 'react'

interface HeroPerformanceMetrics {
    firstPaintTime: number | null
    animationFrameRate: number | null
    isAnimationSmooth: boolean
    loadTime: number | null
}

export function useUltraHeroPerformance() {
    const [metrics, setMetrics] = useState<HeroPerformanceMetrics>({
        firstPaintTime: null,
        animationFrameRate: null,
        isAnimationSmooth: true,
        loadTime: null
    })

    const frameCount = useRef(0)
    const animationStart = useRef<number>(0)
    const rafId = useRef<number | undefined>(undefined)
    const startTime = useRef<number>(Date.now())

    const measureFrameRate = () => {
        frameCount.current++

        if (animationStart.current === 0) {
            animationStart.current = performance.now()
        }

        const elapsed = performance.now() - animationStart.current

        // Measure for 2 seconds during animation
        if (elapsed < 2000) {
            rafId.current = requestAnimationFrame(measureFrameRate)
        } else {
            const fps = (frameCount.current / elapsed) * 1000
            const isSmooth = fps >= 55 // Consider 55+ FPS as smooth

            setMetrics(prev => ({
                ...prev,
                animationFrameRate: fps,
                isAnimationSmooth: isSmooth
            }))
        }
    }

    const startPerformanceMonitoring = () => {
        // Reset counters
        frameCount.current = 0
        animationStart.current = 0

        // Start measuring
        rafId.current = requestAnimationFrame(measureFrameRate)

        // Measure first paint
        if ('performance' in window && 'getEntriesByType' in performance) {
            setTimeout(() => {
                const paintEntries = performance.getEntriesByType('paint')
                const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')

                if (firstPaint) {
                    setMetrics(prev => ({
                        ...prev,
                        firstPaintTime: firstPaint.startTime
                    }))
                }
            }, 100)
        }
    }

    const stopPerformanceMonitoring = () => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current)
        }

        const loadTime = Date.now() - startTime.current
        setMetrics(prev => ({
            ...prev,
            loadTime
        }))
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (rafId.current) {
                cancelAnimationFrame(rafId.current)
            }
        }
    }, [])

    return {
        metrics,
        startPerformanceMonitoring,
        stopPerformanceMonitoring
    }
}

// Hook to dynamically adjust hero animations based on real-time performance
export function useAdaptiveHeroAnimations() {
    const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false)
    const frameDropCount = useRef(0)
    const lastFrameTime = useRef<number>(0)
    const monitoringActive = useRef(false)

    const checkFramePerformance = (currentTime: number) => {
        if (lastFrameTime.current > 0) {
            const deltaTime = currentTime - lastFrameTime.current

            // If frame time > 20ms (< 50 FPS), count as a drop
            if (deltaTime > 20) {
                frameDropCount.current++

                // If we detect 3+ frame drops in quick succession, reduce animations
                if (frameDropCount.current >= 3) {
                    setShouldReduceAnimations(true)
                    monitoringActive.current = false
                    return
                }
            }
        }

        lastFrameTime.current = currentTime

        if (monitoringActive.current) {
            requestAnimationFrame(checkFramePerformance)
        }
    }

    const startAdaptiveMonitoring = () => {
        monitoringActive.current = true
        frameDropCount.current = 0
        requestAnimationFrame(checkFramePerformance)
    }

    const stopAdaptiveMonitoring = () => {
        monitoringActive.current = false
    }

    return {
        shouldReduceAnimations,
        startAdaptiveMonitoring,
        stopAdaptiveMonitoring
    }
}
