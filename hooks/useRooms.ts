import { useCallback, useEffect, useState } from 'react';
import { trpc } from './trpc';
import { create } from 'zustand';
import { isLoggingOut } from '@/lib/trpc-helpers';

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
        refetchOnWindowFocus: !isLoggingOut(),
        // Cache data for longer to avoid unnecessary loading states
        staleTime: 60 * 1000, // Keep data fresh for a minute
        // Keep data cached for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Refetch less frequently for better performance
        refetchInterval: isLoggingOut() ? false : 30 * 1000, // Reduced from 15s to 30s
        // Enable automatic refetching when network reconnects
        refetchOnReconnect: !isLoggingOut(),
        // Don't execute the query if we're in the process of logging out
        enabled: !isLoggingOut(),
    });    // Function to trigger a comprehensive refetch of rooms data
    const refetchRooms = useCallback(() => {
        // Don't refetch if we're logging out
        if (isLoggingOut()) {
            console.log("⛔ Skipping room data refetch during logout");
            return Promise.resolve();
        }

        const now = Date.now();
        console.log("🔄 Refetching rooms data...");

        // Prevent excessive refetching (no more than once per second)
        if (now - lastRefetchTime < 1000) {
            console.log("⏱️ Skipping refetch, too soon since last refetch");
            return Promise.resolve();
        }

        // Update last refetch time
        setLastRefetchTime(now);

        try {
            // Invalidate all room-related queries to ensure fresh data
            utils.rooms.getAvailableRooms.invalidate();
            utils.rooms.getRoomById.invalidate();

            // Also trigger refetch for immediate update
            return roomsQuery.refetch();
        } catch (error) {
            // Check for logout in progress even if error
            if (isLoggingOut()) {
                console.log("⛔ Abandoning room refetch due to logout in progress");
                return Promise.resolve();
            }

            console.error("Error refetching rooms:", error);
            return Promise.reject(error);
        } finally {
            // Reset the refetch flag
            setShouldRefetchRooms(false);
        }
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
