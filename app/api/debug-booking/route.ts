import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Get current room status with booking counts
        const rooms = await db.room.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                numberofrooms: true,
                pricePerNight: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            },
        });

        const bookings = await db.booking.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                roomId: true,
                status: true,
                createdAt: true,
                totalAmount: true,
                room: {
                    select: {
                        name: true
                    }
                }
            },
        });

        return NextResponse.json({
            success: true,
            rooms: rooms,
            recentBookings: bookings,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Debug booking error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
        });
    }
}
