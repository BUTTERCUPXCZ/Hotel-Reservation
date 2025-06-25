import { useCallback } from 'react';
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

    // Use tRPC to fetch room data with automatic refetching
    const roomsQuery = trpc.rooms.getAvailableRooms.useQuery(undefined, {
        // Enable refetching on window focus
        refetchOnWindowFocus: true,
        // Stale time of 5 minutes - data is considered fresh for this period
        staleTime: 5 * 60 * 1000,
        // Keep data cached for 10 minutes
        cacheTime: 10 * 60 * 1000,
    });

    // Function to trigger a manual refetch of rooms data
    const refetchRooms = useCallback(() => {
        // Refetch the rooms data
        roomsQuery.refetch();
        // Reset the refetch flag
        setShouldRefetchRooms(false);
    }, [roomsQuery, setShouldRefetchRooms]);

    // If shouldRefetchRooms is true, trigger a refetch
    if (shouldRefetchRooms) {
        refetchRooms();
    }

    // Function to mark a room as booked, triggering a refetch
    const markRoomAsBooked = useCallback((roomId: string) => {
        setLastBookedRoomId(roomId);
        setShouldRefetchRooms(true);
    }, [setLastBookedRoomId, setShouldRefetchRooms]);

    return {
        ...roomsQuery,
        refetchRooms,
        markRoomAsBooked,
        lastBookedRoomId,
    };
}
