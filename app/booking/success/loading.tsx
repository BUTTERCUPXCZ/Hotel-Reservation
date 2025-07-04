import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold" style={{ color: '#2E2E2E' }}>Loading your booking confirmation...</h2>
        <p className="mt-2" style={{ color: '#6AB19A' }}>Please wait while we retrieve your booking details</p>
      </div>
    </div>
  )
}
