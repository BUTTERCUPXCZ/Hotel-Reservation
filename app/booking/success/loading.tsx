import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading your booking confirmation...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we retrieve your booking details</p>
      </div>
    </div>
  )
}
