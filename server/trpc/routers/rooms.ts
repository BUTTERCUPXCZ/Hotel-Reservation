import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const roomsRouter = router({
    // Get all available rooms (public procedure)
    getAvailableRooms: publicProcedure
        .input(
            z.object({
                checkInDate: z.date().optional(),
                checkOutDate: z.date().optional(),
            }).optional()
        )
        .query(async ({ ctx }) => {
            try {
                // Return mock data for now until the database schema is properly set up
                return [
                    {
                        id: "room1",
                        name: "Deluxe Single Room",
                        description: "Comfortable single room with all amenities",
                        pricePerNight: 1200,
                        maxOccupancy: 1,
                        isActive: true,
                        roomType: {
                            id: "type1",
                            name: "Single"
                        }
                    },
                    {
                        id: "room2",
                        name: "Double Room",
                        description: "Spacious room with twin beds",
                        pricePerNight: 1800,
                        maxOccupancy: 2,
                        isActive: true,
                        roomType: {
                            id: "type2",
                            name: "Double"
                        }
                    },
                    {
                        id: "room3",
                        name: "Family Suite",
                        description: "Large room suitable for families",
                        pricePerNight: 2400,
                        maxOccupancy: 4,
                        isActive: true,
                        roomType: {
                            id: "type3",
                            name: "Family"
                        }
                    }
                ];
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch rooms",
                });
            }
        }),

    // Get details of a specific room (public procedure)
    getRoomById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                // Return mock data for now
                const mockRooms = {
                    "room1": {
                        id: "room1",
                        name: "Deluxe Single Room",
                        description: "Comfortable single room with all amenities",
                        pricePerNight: 1200,
                        maxOccupancy: 1,
                        isActive: true,
                        roomType: {
                            id: "type1",
                            name: "Single"
                        },
                        amenities: [
                            { id: "a1", name: "WiFi", icon: "wifi" },
                            { id: "a2", name: "Air Conditioning", icon: "ac" }
                        ],
                        images: [
                            { id: "img1", url: "/placeholder.svg", alt: "Room Image" }
                        ]
                    },
                    "room2": {
                        id: "room2",
                        name: "Double Room",
                        description: "Spacious room with twin beds",
                        pricePerNight: 1800,
                        maxOccupancy: 2,
                        isActive: true,
                        roomType: {
                            id: "type2",
                            name: "Double"
                        },
                        amenities: [
                            { id: "a1", name: "WiFi", icon: "wifi" },
                            { id: "a2", name: "Air Conditioning", icon: "ac" },
                            { id: "a3", name: "TV", icon: "tv" }
                        ],
                        images: [
                            { id: "img2", url: "/placeholder.svg", alt: "Room Image" }
                        ]
                    },
                    "room3": {
                        id: "room3",
                        name: "Family Suite",
                        description: "Large room suitable for families",
                        pricePerNight: 2400,
                        maxOccupancy: 4,
                        isActive: true,
                        roomType: {
                            id: "type3",
                            name: "Family"
                        },
                        amenities: [
                            { id: "a1", name: "WiFi", icon: "wifi" },
                            { id: "a2", name: "Air Conditioning", icon: "ac" },
                            { id: "a3", name: "TV", icon: "tv" },
                            { id: "a4", name: "Kitchen", icon: "kitchen" }
                        ],
                        images: [
                            { id: "img3", url: "/placeholder.svg", alt: "Room Image" }
                        ]
                    }
                };

                const room = mockRooms[input.id as keyof typeof mockRooms];

                if (!room) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found",
                    });
                }

                return room;
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch room details",
                });
            }
        }),
    // Create a new booking (protected procedure - only for logged-in users)
    createBooking: protectedProcedure
        .input(
            z.object({
                roomId: z.string(),
                checkInDate: z.date(),
                checkOutDate: z.date(),
                guestCount: z.number().int().positive(),
                specialRequests: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Make sure user is authenticated
            if (!ctx.session?.user?.email) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to create a booking",
                });
            }

            // Validate dates
            if (input.checkInDate >= input.checkOutDate) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Check-out date must be after check-in date",
                });
            }

            try {
                // Instead of actual DB operations, return mock data
                // Once your database is properly set up, you can uncomment the real implementation
                return {
                    id: "booking-" + Math.random().toString(36).substr(2, 9),
                    userId: ctx.session.user.email,
                    roomId: input.roomId,
                    checkInDate: input.checkInDate,
                    checkOutDate: input.checkOutDate,
                    guestCount: input.guestCount,
                    specialRequests: input.specialRequests,
                    status: "PENDING",
                    totalAmount: 1800, // Mocked amount
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                console.error("Failed to create booking:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create booking",
                });
            }
        }),
    // Get user's bookings (protected procedure)
    getUserBookings: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                // Return mock bookings until database is properly set up
                return [
                    {
                        id: "booking1",
                        userId: ctx.session.user.email,
                        roomId: "room1",
                        checkInDate: new Date("2025-07-01"),
                        checkOutDate: new Date("2025-07-03"),
                        guestCount: 1,
                        totalAmount: 2400,
                        status: "CONFIRMED",
                        createdAt: new Date("2025-06-20"),
                        updatedAt: new Date("2025-06-20"),
                        room: {
                            id: "room1",
                            name: "Deluxe Single Room",
                            pricePerNight: 1200,
                            roomType: {
                                id: "type1",
                                name: "Single"
                            }
                        }
                    },
                    {
                        id: "booking2",
                        userId: ctx.session.user.email,
                        roomId: "room2",
                        checkInDate: new Date("2025-07-15"),
                        checkOutDate: new Date("2025-07-17"),
                        guestCount: 2,
                        totalAmount: 3600,
                        status: "PENDING",
                        createdAt: new Date("2025-06-22"),
                        updatedAt: new Date("2025-06-22"),
                        room: {
                            id: "room2",
                            name: "Double Room",
                            pricePerNight: 1800,
                            roomType: {
                                id: "type2",
                                name: "Double"
                            }
                        }
                    }
                ];
            } catch (error) {
                console.error("Failed to fetch user bookings:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch your bookings",
                });
            }
        }),
});
