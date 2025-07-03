import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md", className)} style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} {...props} />
}

export { Skeleton }
