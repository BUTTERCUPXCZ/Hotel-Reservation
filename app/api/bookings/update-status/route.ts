import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const userEmail = req.cookies.get('userEmail')?.value;
        if (!userEmail) {
            return NextResponse.json(
                { error: 'You must be logged in to update a booking' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { bookingId, status } = body;

        // Validate required fields
        if (!bookingId || !status) {
            return NextResponse.json(
                { error: 'Missing required booking information' },
                { status: 400 }
            );
        }        // Find the booking first
        const existingBooking = await db.booking.findUnique({
            where: { id: bookingId },
            select: {
                userId: true,
                id: true,
                status: true,
                roomId: true
            }
        });

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Only allow the booking owner to update it
        if (existingBooking.userId !== userEmail) {
            return NextResponse.json(
                { error: 'You do not have permission to update this booking' },
                { status: 403 }
            );
        }

        // Handle room inventory based on status change
        const previousStatus = existingBooking.status;
        const newStatus = status;

        // Start a transaction to ensure both booking and room updates happen together
        const result = await db.$transaction(async (tx) => {
            // Update booking status
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: newStatus },
                select: {
                    id: true,
                    status: true,
                    roomId: true,
                    checkInDate: true,
                    checkOutDate: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            // Handle room inventory adjustments based on status changes
            if (previousStatus !== "CONFIRMED" && newStatus === "CONFIRMED") {
                // If status changed from anything to CONFIRMED, decrement room count
                await tx.room.update({
                    where: { id: existingBooking.roomId },
                    data: {
                        numberofrooms: {
                            decrement: 1 // Decrease available rooms by 1
                        }
                    }
                });
                console.log(`Room ${existingBooking.roomId} count decremented - booking confirmed`);
            }
            else if (previousStatus === "CONFIRMED" &&
                (newStatus === "CANCELLED" || newStatus === "REFUNDED")) {
                // If status changed from CONFIRMED to CANCELLED or REFUNDED, increment room count
                await tx.room.update({
                    where: { id: existingBooking.roomId },
                    data: {
                        numberofrooms: {
                            increment: 1 // Increase available rooms by 1
                        }
                    }
                });
                console.log(`Room ${existingBooking.roomId} count incremented - booking cancelled`);
            }

            return updatedBooking;
        });

        return NextResponse.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: result
        });
    } catch (error: any) {
        console.error('Error updating booking status:', error);

        return NextResponse.json(
            {
                error: 'Failed to update booking status',
                message: error.message || 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}
