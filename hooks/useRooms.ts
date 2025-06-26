import { useCallback, useEffect, useState } from 'react';
import { trpc } from './trpc';
import { create } from 'zustand';

// Define a store to manage room-related state globally
interface RoomStore {
    // Flag to trigger refetching rooms data
    shouldRefetchRooms: boolean;
    // Function to set the refetch flag
    setShouldRefetchRooms: (value: boolean) => void;
    // Keep track of last booking room ID
    lastBookedRoomId: string | null;
    setLastBookedRoomId: (roomId: string | null) => void;
}

// Create a Zustand store for managing room state across components
export const useRoomStore = create<RoomStore>((set) => ({
    shouldRefetchRooms: false,
    setShouldRefetchRooms: (value) => set({ shouldRefetchRooms: value }),
    lastBookedRoomId: null,
    setLastBookedRoomId: (roomId) => set({ lastBookedRoomId: roomId }),
}));

// Hook for managing room data and refetching
export function useRooms() {
    const { shouldRefetchRooms, setShouldRefetchRooms, lastBookedRoomId, setLastBookedRoomId } = useRoomStore();
    const [lastRefetchTime, setLastRefetchTime] = useState<number>(0);

    // Get tRPC utils for query invalidation
    const utils = trpc.useUtils();

    // Use tRPC to fetch room data with automatic refetching
    const roomsQuery = trpc.rooms.getAvailableRooms.useQuery(undefined, {
        // Enable refetching on window focus
        refetchOnWindowFocus: true,
        // Reduced stale time to 5 seconds for more frequent updates
        staleTime: 5 * 1000,
        // Keep data cached for 2 minutes
        gcTime: 2 * 60 * 1000,
        // Refetch more frequently for availability updates
        refetchInterval: 15 * 1000, // Refetch every 15 seconds for faster updates
        // Enable automatic refetching when network reconnects
        refetchOnReconnect: true,
    });

    // Function to trigger a comprehensive refetch of rooms data
    const refetchRooms = useCallback(() => {
        const now = Date.now();
        console.log("🔄 Refetching rooms data...");

        // Prevent excessive refetching (no more than once per second)
        if (now - lastRefetchTime < 1000) {
            console.log("⏱️ Skipping refetch, too soon since last refetch");
            return;
        }

        // Update last refetch time
        setLastRefetchTime(now);

        // Invalidate all room-related queries to ensure fresh data
        utils.rooms.getAvailableRooms.invalidate();
        utils.rooms.getRoomById.invalidate();

        // Also trigger refetch for immediate update
        roomsQuery.refetch();

        // Reset the refetch flag
        setShouldRefetchRooms(false);
    }, [utils.rooms, roomsQuery, setShouldRefetchRooms, lastRefetchTime]);

    // Use useEffect to handle refetching instead of calling it during render
    useEffect(() => {
        if (shouldRefetchRooms) {
            refetchRooms();
        }
    }, [shouldRefetchRooms, refetchRooms]);

    // Function to mark a room as booked, triggering a refetch
    const markRoomAsBooked = useCallback(async (roomId: string) => {
        console.log("📌 Marking room as booked:", roomId);

        // Set the last booked room ID for UI feedback
        setLastBookedRoomId(roomId);

        // Set the refetch flag to true
        setShouldRefetchRooms(true);

        try {
            // Make a direct API call to decrement room count for immediate feedback
            const response = await fetch('/api/rooms/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    operation: 'decrement'
                }),
            });

            if (response.ok) {
                console.log("✅ Room availability decremented via direct API");
            } else {
                console.error("❌ Failed to decrement room availability via API");
            }
        } catch (error) {
            console.error("Error calling room decrement API:", error);
        }

        // Immediately invalidate all room queries to force fresh data
        utils.rooms.getAvailableRooms.invalidate();
        utils.rooms.getRoomById.invalidate();

        // Also trigger immediate refetch for faster UI updates
        setTimeout(() => {
            roomsQuery.refetch();
        }, 500); // Small delay to ensure backend has processed the booking

        // Schedule another refetch after a slightly longer delay as a backup
        setTimeout(() => {
            roomsQuery.refetch();
        }, 2000);
    }, [utils.rooms, roomsQuery, setLastBookedRoomId, setShouldRefetchRooms]);

    return {
        ...roomsQuery,
        refetchRooms,
        markRoomAsBooked,
        lastBookedRoomId,
    };
}
