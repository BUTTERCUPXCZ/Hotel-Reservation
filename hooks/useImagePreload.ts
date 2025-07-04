"use client"

import { useEffect, useState } from 'react'

export function useImagePreload(src: string) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const img = new Image()

        img.onload = () => {
            setIsLoaded(true)
            setError(null)
        }

        img.onerror = () => {
            setError('Failed to load image')
            setIsLoaded(false)
        }

        // Start loading
        img.src = src

        // Cleanup
        return () => {
            img.onload = null
            img.onerror = null
        }
    }, [src])

    return { isLoaded, error }
}

// Hook to preload multiple critical images
export function useHeroCriticalImages() {
    const heroImage = useImagePreload('/beach.jpg')

    return {
        allImagesLoaded: heroImage.isLoaded,
        heroImageStatus: heroImage
    }
}
