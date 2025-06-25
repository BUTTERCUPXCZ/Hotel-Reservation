import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const userEmail = searchParams.get('email') || 'test@example.com';
        const roomId = searchParams.get('roomId') || 'room1';

        // Check if the user exists
        const user = await db.user.findUnique({
            where: {
                email: userEmail
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true
            }
        });

        // Check if the room exists
        const room = await db.room.findUnique({
            where: {
                id: roomId
            },
            select: {
                id: true,
                name: true,
                numberofrooms: true
            }
        });
        // Try to create a test booking
        let bookingResult: any = { success: false, error: "Not attempted" };

        if (user && room) {
            try {
                const booking = await db.booking.create({
                    data: {
                        userId: userEmail,
                        roomId: roomId,
                        checkInDate: new Date(),
                        checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        guestCount: 2,
                        totalAmount: 1000,
                        status: "TEST",
                        specialRequests: "This is a test booking"
                    }
                });

                bookingResult = {
                    success: true,
                    bookingId: booking.id,
                    created: booking.createdAt
                };

                // Clean up test booking
                await db.booking.delete({
                    where: { id: booking.id }
                });
            } catch (bookingError: any) {
                bookingResult = {
                    success: false,
                    error: bookingError.message,
                    code: bookingError.code,
                    meta: bookingError.meta
                };
            }
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            user: user || { error: "User not found" },
            room: room || { error: "Room not found" },
            bookingTest: bookingResult,
            schema: {
                user: {
                    id: "Int @id @default(autoincrement())",
                    email: "String @unique"
                },
                booking: {
                    userId: "String",
                    user: "User @relation(fields: [userId], references: [email])"
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message || "Unknown error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
