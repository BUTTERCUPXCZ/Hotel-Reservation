import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RoomCardSkeleton() {
  return (
    <Card className="overflow-hidden" style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
      <Skeleton className="h-48 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} /> {/* Reduced height from 64 to 48 */}
      <CardContent className="p-4"> {/* Reduced padding from 6 to 4 */}
        <div className="space-y-2"> {/* Reduced spacing from 3 to 2 */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-2/3" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} /> {/* Reduced width from 3/4 to 2/3 */}
            <Skeleton className="h-6 w-16" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          </div>
          <Skeleton className="h-4 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          <div className="grid grid-cols-2 gap-2"> {/* Reduced columns from 3 to 2 and gap from 4 to 2 */}
            <Skeleton className="h-4 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            <Skeleton className="h-4 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          </div>
          <Skeleton className="h-4 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          <div className="flex items-center justify-between pt-2"> {/* Reduced padding from 4 to 2 */}
            <Skeleton className="h-8 w-24" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RoomDetailsSkeleton() {
  return (
    <div className="space-y-8" style={{ backgroundColor: '#F5EFE6' }}>
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          <Skeleton className="h-6 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
        </div>
        <Skeleton className="h-10 w-3/4" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          <Skeleton className="h-4 w-48" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
        </div>
      </div>

      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-96 w-full rounded-lg" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <Card style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
          <CardHeader>
            <Skeleton className="h-6 w-32" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' }}>
        <CardHeader>
          <Skeleton className="h-6 w-40" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
          <Skeleton className="h-4 w-64" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
              <Skeleton className="h-10 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
              <Skeleton className="h-10 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
              <Skeleton className="h-10 w-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.15)' }} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
