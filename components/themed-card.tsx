"use client"

import { forwardRef } from 'react'
import { Card as ShadcnCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Themed versions of the card components
export const ThemedCard = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ShadcnCard>>(
    ({ className, ...props }, ref) => {
        return (
            <ShadcnCard
                ref={ref}
                className={className}
                style={{
                    backgroundColor: '#FAFAFA',
                    borderColor: '#E0E0E0',
                    ...props.style
                }}
                {...props}
            />
        )
    }
)
ThemedCard.displayName = 'ThemedCard'

// Re-export all the other card components
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
