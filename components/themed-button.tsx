"use client"

import { forwardRef } from 'react'
import { Button as ShadcnButton } from '@/components/ui/button'

// Themed version of the button component
export const ThemedButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof ShadcnButton>>(
    ({ className, variant = "default", ...props }, ref) => {
        const getStyle = () => {
            if (variant === "default") {
                return {
                    backgroundColor: '#6AB19A',
                    color: '#FFFFFF',
                    ...props.style
                }
            }

            // For other variants, just pass through the style prop
            return props.style
        }

        return (
            <ShadcnButton
                ref={ref}
                className={className}
                variant={variant}
                style={getStyle()}
                {...props}
            />
        )
    }
)
ThemedButton.displayName = 'ThemedButton'
