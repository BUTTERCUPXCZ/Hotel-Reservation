import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const userEmail = req.cookies.get('userEmail')?.value;
        if (!userEmail) {
            return NextResponse.json(
                { error: 'You must be logged in to create a booking' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { roomId, checkInDate, checkOutDate, guestCount, totalAmount, specialRequests } = body;

        // Validate required fields
        if (!roomId || !checkInDate || !checkOutDate || !guestCount || !totalAmount) {
            return NextResponse.json(
                { error: 'Missing required booking information' },
                { status: 400 }
            );
        }

        // Start by checking if the user exists
        const user = await db.user.findUnique({
            where: { email: userEmail },
            select: { id: true, email: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. Please log in again.' },
                { status: 404 }
            );
        }

        // Check if the room exists
        const room = await db.room.findUnique({
            where: { id: roomId },
            select: { id: true, numberofrooms: true }
        });

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        if (room.numberofrooms <= 0) {
            return NextResponse.json(
                { error: 'No rooms available for booking' },
                { status: 400 }
            );
        }        // Get the status from the request or default to CONFIRMED
        const status = body.status || 'CONFIRMED';

        console.log(`Creating booking for user: ${userEmail} with room: ${roomId}`);
        console.log(`Check-in: ${new Date(checkInDate).toISOString()}, Check-out: ${new Date(checkOutDate).toISOString()}`); try {
            // Use a transaction to ensure both booking creation and room update succeed or fail together
            const result = await db.$transaction(async (tx) => {
                // 1. Create booking record
                const booking = await tx.booking.create({
                    data: {
                        userId: userEmail, // Using email which references User.email
                        roomId,
                        checkInDate: new Date(checkInDate),
                        checkOutDate: new Date(checkOutDate),
                        guestCount,
                        totalAmount,
                        specialRequests: specialRequests || '',
                        status: status
                    }
                });

                // 2. Update room availability if status is CONFIRMED
                if (status === 'CONFIRMED') {
                    await tx.room.update({
                        where: { id: roomId },
                        data: {
                            numberofrooms: {
                                decrement: 1
                            }
                        }
                    });
                    console.log(`Room ${roomId} count decremented for booking ${booking.id}`);
                }

                return booking;
            });

            // Log successful booking
            console.log('Direct API booking created:', result.id);

            // Return success response
            return NextResponse.json({
                success: true,
                message: 'Booking created successfully',
                booking: {
                    id: result.id,
                    checkInDate: result.checkInDate,
                    checkOutDate: result.checkOutDate,
                    status: result.status
                }
            });
        } catch (prismaError: any) {
            console.error("Prisma error creating booking:", prismaError);
            console.error("Error code:", prismaError.code);
            console.error("Error meta:", prismaError.meta);

            // Rethrow for outer catch handler
            throw prismaError;
        }
    } catch (error: any) {
        console.error('Error creating booking via direct API:', error);

        // Handle Prisma errors
        if (error.code) {
            console.error(`Prisma error code: ${error.code}`);

            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Invalid user or room reference', code: error.code, details: error.meta },
                    { status: 400 }
                );
            } else if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'This booking already exists', code: error.code, details: error.meta },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to create booking',
                message: error.message || 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}
