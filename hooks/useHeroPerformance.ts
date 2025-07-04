"use client"

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
    onHeroLoadTime?: (time: number) => void
    onAnimationFrameRate?: (fps: number) => void
    onLargestContentfulPaint?: (time: number) => void
}

export function PerformanceMonitor({
    onHeroLoadTime,
    onAnimationFrameRate,
    onLargestContentfulPaint
}: PerformanceMetrics) {
    const frameCount = useRef(0)
    const lastTime = useRef(performance.now())
    const animationId = useRef<number | undefined>(undefined)

    useEffect(() => {
        // Monitor animation frame rate for hero section
        const measureFPS = () => {
            frameCount.current++
            const currentTime = performance.now()

            if (currentTime - lastTime.current >= 1000) {
                const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
                onAnimationFrameRate?.(fps)

                frameCount.current = 0
                lastTime.current = currentTime
            }

            animationId.current = requestAnimationFrame(measureFPS)
        }

        // Start FPS monitoring
        if (onAnimationFrameRate) {
            animationId.current = requestAnimationFrame(measureFPS)
        }

        // Monitor Largest Contentful Paint
        if (onLargestContentfulPaint && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                const lastEntry = entries[entries.length - 1]
                if (lastEntry) {
                    onLargestContentfulPaint(lastEntry.startTime)
                }
            })

            try {
                observer.observe({ entryTypes: ['largest-contentful-paint'] })
            } catch (e) {
                console.warn('Performance Observer not supported')
            }

            return () => {
                observer.disconnect()
                if (animationId.current) {
                    cancelAnimationFrame(animationId.current)
                }
            }
        }

        return () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current)
            }
        }
    }, [onAnimationFrameRate, onLargestContentfulPaint])

    // Monitor hero section load time
    useEffect(() => {
        if (onHeroLoadTime) {
            const startTime = performance.now()

            const checkHeroLoaded = () => {
                const heroElement = document.querySelector('.hero-section')
                if (heroElement) {
                    const computedStyle = window.getComputedStyle(heroElement)
                    if (computedStyle.backgroundImage !== 'none') {
                        const loadTime = performance.now() - startTime
                        onHeroLoadTime(loadTime)
                        return
                    }
                }

                // Check again after a small delay
                setTimeout(checkHeroLoaded, 100)
            }

            checkHeroLoaded()
        }
    }, [onHeroLoadTime])

    return null // This component doesn't render anything
}

// Hook for easy performance monitoring
export function useHeroPerformance() {
    useEffect(() => {
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
            console.log('🎯 Hero Performance Monitoring Active')

            // Monitor Core Web Vitals
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log(`📊 ${entry.name}: ${entry.startTime.toFixed(2)}ms`)
                    })
                })

                try {
                    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
                } catch (e) {
                    console.warn('Performance Observer not fully supported')
                }

                return () => observer.disconnect()
            }
        }
    }, [])

    const measureHeroAnimation = (animationName: string) => {
        if (process.env.NODE_ENV === 'development') {
            performance.mark(`hero-${animationName}-start`)

            return () => {
                performance.mark(`hero-${animationName}-end`)
                performance.measure(
                    `hero-${animationName}`,
                    `hero-${animationName}-start`,
                    `hero-${animationName}-end`
                )
            }
        }

        return () => { } // No-op in production
    }

    return { measureHeroAnimation }
}
