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
                // Fetch rooms from the database
                const rooms = await ctx.db.room.findMany({
                    where: {
                        isActive: true,
                    },
                    include: {
                        roomType: true,
                    },
                    orderBy: {
                        pricePerNight: 'asc',
                    },
                });

                return rooms;
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
                // Fetch room from the database
                const room = await ctx.db.room.findUnique({
                    where: {
                        id: input.id,
                        isActive: true,
                    },
                    include: {
                        roomType: true,
                    },
                });

                if (!room) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found",
                    });
                }

                return room;
            } catch (error) {
                console.error("Failed to fetch room:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch room",
                });
            }
        }),

    // Check room availability
    checkRoomAvailability: publicProcedure
        .input(
            z.object({
                roomId: z.string(),
                checkInDate: z.date(),
                checkOutDate: z.date(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                const { roomId, checkInDate, checkOutDate } = input;

                // Check if dates are valid
                if (checkInDate >= checkOutDate) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Check-out date must be after check-in date",
                    });
                }

                // Check if room exists
                const room = await ctx.db.room.findUnique({
                    where: {
                        id: roomId,
                        isActive: true,
                    },
                });

                if (!room) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found",
                    });
                }

                // Check for existing bookings that overlap with the requested dates
                const existingBookings = await ctx.db.booking.findMany({
                    where: {
                        roomId,
                        status: {
                            in: ['CONFIRMED', 'PENDING']
                        },
                        OR: [
                            {
                                // Case 1: Requested period contains an existing booking
                                checkInDate: {
                                    gte: checkInDate,
                                    lt: checkOutDate,
                                },
                            },
                            {
                                // Case 2: Requested period is within an existing booking
                                checkOutDate: {
                                    gt: checkInDate,
                                    lte: checkOutDate,
                                },
                            },
                            {
                                // Case 3: Requested period overlaps with the start of an existing booking
                                AND: [
                                    { checkInDate: { lte: checkInDate } },
                                    { checkOutDate: { gt: checkInDate } },
                                ],
                            },
                            {
                                // Case 4: Requested period overlaps with the end of an existing booking
                                AND: [
                                    { checkInDate: { lt: checkOutDate } },
                                    { checkOutDate: { gte: checkOutDate } },
                                ],
                            },
                        ],
                    },
                });

                const isAvailable = existingBookings.length === 0;

                return {
                    isAvailable,
                    room,
                    existingBookings: isAvailable ? [] : existingBookings,
                };
            } catch (error) {
                console.error("Failed to check room availability:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to check room availability",
                });
            }
        }),

    // Get available room count (used for booking validation)
    getAvailableRoomCount: publicProcedure
        .input(
            z.object({
                roomId: z.string(),
                checkInDate: z.date(),
                checkOutDate: z.date(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { roomId, checkInDate, checkOutDate } = input;

            try {
                // Get the room's total capacity
                const room = await ctx.db.room.findUnique({
                    where: { id: roomId },
                    select: { numberofrooms: true }
                });

                if (!room) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found",
                    });
                }

                // Count existing bookings that overlap with the requested period
                const bookedRoomsCount = await ctx.db.booking.count({
                    where: {
                        roomId,
                        status: { in: ['CONFIRMED', 'PENDING'] },
                        OR: [
                            // Same overlap logic as in checkRoomAvailability
                            {
                                checkInDate: { gte: checkInDate, lt: checkOutDate },
                            },
                            {
                                checkOutDate: { gt: checkInDate, lte: checkOutDate },
                            },
                            {
                                AND: [
                                    { checkInDate: { lte: checkInDate } },
                                    { checkOutDate: { gt: checkInDate } },
                                ],
                            },
                            {
                                AND: [
                                    { checkInDate: { lt: checkOutDate } },
                                    { checkOutDate: { gte: checkOutDate } },
                                ],
                            },
                        ],
                    },
                });

                const availableRooms = Math.max(0, room.numberofrooms - bookedRoomsCount);

                return {
                    totalRooms: room.numberofrooms,
                    bookedRooms: bookedRoomsCount,
                    availableRooms,
                };
            } catch (error) {
                console.error("Failed to get available room count:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get available room count",
                });
            }
        }),

    // Admin procedures (protected routes)

    // Create a new room (admin only)
    createRoom: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                pricePerNight: z.number().positive(),
                roomTypeId: z.string(),
                totalRooms: z.number().int().positive(),
                capacity: z.number().int().positive(),
                amenityIds: z.array(z.string()).optional(),
                images: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is admin (implement your admin check here)
            if (!ctx.session?.user?.email?.endsWith('@admin.com')) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only administrators can create rooms",
                });
            }

            try {
                const newRoom = await ctx.db.room.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        pricePerNight: input.pricePerNight,
                        numberofrooms: input.totalRooms,
                        maxOccupancy: input.capacity,
                        isActive: true,
                        roomType: {
                            connect: { id: input.roomTypeId }
                        },
                        amenities: input.amenityIds ? input.amenityIds.join(',') : null,
                        imageUrl: input.images && input.images.length > 0 ? input.images[0] : null,
                    },
                    include: {
                        roomType: true
                    }
                });

                return newRoom;
            } catch (error) {
                console.error("Failed to create room:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create room",
                });
            }
        }),

    // Update a room (admin only)
    updateRoom: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                pricePerNight: z.number().positive().optional(),
                roomTypeId: z.string().optional(),
                totalRooms: z.number().int().positive().optional(),
                capacity: z.number().int().positive().optional(),
                isActive: z.boolean().optional(),
                amenityIds: z.array(z.string()).optional(),
                images: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is admin (implement your admin check here)
            if (!ctx.session?.user?.email?.endsWith('@admin.com')) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only administrators can update rooms",
                });
            }

            try {
                // Check if room exists
                const existingRoom = await ctx.db.room.findUnique({
                    where: { id: input.id }
                });

                if (!existingRoom) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found",
                    });
                }

                // Handle amenities updates if provided
                let amenitiesUpdate = undefined;
                if (input.amenityIds) {
                    // Join amenities into a comma-separated string
                    amenitiesUpdate = input.amenityIds.join(',');
                }

                // Handle images updates if provided
                let imageUrl = undefined;
                if (input.images && input.images.length > 0) {
                    // Just take the first image URL
                    imageUrl = input.images[0];
                }

                // Update the room
                const updatedRoom = await ctx.db.room.update({
                    where: { id: input.id },
                    data: {
                        name: input.name,
                        description: input.description,
                        pricePerNight: input.pricePerNight,
                        numberofrooms: input.totalRooms,
                        maxOccupancy: input.capacity,
                        isActive: input.isActive,
                        roomType: input.roomTypeId ? {
                            connect: { id: input.roomTypeId }
                        } : undefined,
                        amenities: amenitiesUpdate,
                        imageUrl: imageUrl,
                    },
                    include: {
                        roomType: true,
                    }
                });

                return updatedRoom;
            } catch (error) {
                console.error("Failed to update room:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update room",
                });
            }
        }),

    // Delete a room (admin only)
    deleteRoom: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if user is admin (implement your admin check here)
            if (!ctx.session?.user?.email?.endsWith('@admin.com')) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only administrators can delete rooms",
                });
            }

            try {
                // Check for active bookings for this room
                const activeBookings = await ctx.db.booking.findFirst({
                    where: {
                        roomId: input.id,
                        status: { in: ['CONFIRMED', 'PENDING'] },
                        checkOutDate: { gt: new Date() }
                    }
                });

                if (activeBookings) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Cannot delete room with active bookings",
                    });
                }

                // Instead of deleting, mark as inactive
                const deletedRoom = await ctx.db.room.update({
                    where: { id: input.id },
                    data: { isActive: false }
                });

                return { success: true, message: "Room successfully deleted" };
            } catch (error) {
                console.error("Failed to delete room:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete room",
                });
            }
        }),

    // Get user's bookings (protected procedure)
    getUserBookings: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                if (!ctx.session?.user?.email) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to view your bookings",
                    });
                }

                // Try to get real bookings from the database first
                try {
                    const userBookings = await ctx.db.booking.findMany({
                        where: {
                            userId: ctx.session.user.email,
                        },
                        include: {
                            room: {
                                select: {
                                    id: true,
                                    name: true,
                                    pricePerNight: true,
                                    imageUrl: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });

                    return userBookings;
                } catch (dbError) {
                    console.error("Failed to fetch bookings from database:", dbError);
                    // Return empty array on database error
                    return [];
                }
            } catch (error) {
                console.error("Failed to fetch user bookings:", error);

                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch your bookings",
                });
            }
        }),

    // Create a new booking
    createBooking: protectedProcedure
        .input(
            z.object({
                roomId: z.string(),
                checkInDate: z.date(),
                checkOutDate: z.date(),
                guestCount: z.number().int().positive(),
                specialRequests: z.string().optional(),
                totalAmount: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                if (!ctx.session?.user?.email) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to create a booking",
                    });
                }

                // Find the user
                const user = await ctx.db.user.findUnique({
                    where: { email: ctx.session.user.email },
                });

                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found",
                    });
                }

                // Check if room exists and is available
                const room = await ctx.db.room.findUnique({
                    where: { id: input.roomId },
                });

                if (!room || !room.isActive) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Room not found or not available",
                    });
                }

                // Check room availability for the dates
                const conflictingBookings = await ctx.db.booking.findMany({
                    where: {
                        roomId: input.roomId,
                        status: { in: ["PENDING", "CONFIRMED"] },
                        OR: [
                            {
                                checkInDate: { lte: input.checkInDate },
                                checkOutDate: { gt: input.checkInDate },
                            },
                            {
                                checkInDate: { lt: input.checkOutDate },
                                checkOutDate: { gte: input.checkOutDate },
                            },
                            {
                                checkInDate: { gte: input.checkInDate },
                                checkOutDate: { lte: input.checkOutDate },
                            },
                        ],
                    },
                });

                if (conflictingBookings.length >= (room.numberofrooms || 1)) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Room is not available for the selected dates",
                    });
                }

                // Create the booking
                const booking = await ctx.db.booking.create({
                    data: {
                        userId: user.email,
                        roomId: input.roomId,
                        checkInDate: input.checkInDate,
                        checkOutDate: input.checkOutDate,
                        guestCount: input.guestCount,
                        totalAmount: input.totalAmount,
                        specialRequests: input.specialRequests,
                        status: "CONFIRMED",
                        createdAt: new Date(),
                    },
                    include: {
                        room: {
                            include: {
                                roomType: true,
                            },
                        },
                        user: true,
                    },
                });

                return { success: true, booking };
            } catch (error) {
                console.error("Failed to create booking:", error);

                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create booking",
                });
            }
        }),

    // Get booking by ID
    getBookingById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const booking = await ctx.db.booking.findUnique({
                    where: { id: input.id },
                    include: {
                        room: {
                            include: {
                                roomType: true,
                            },
                        },
                        user: true,
                    },
                });

                if (!booking) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Booking not found",
                    });
                }

                return booking;
            } catch (error) {
                console.error("Failed to fetch booking:", error);

                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch booking",
                });
            }
        }),
});
