import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        console.log("🔍 Debug: Checking database rooms...");

        // Get ALL rooms (even inactive ones) to see what's actually in the database
        const allRooms = await db.room.findMany({
            include: {
                roomType: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Get only active rooms (what the API returns)
        const activeRooms = await db.room.findMany({
            where: { isActive: true },
            include: {
                roomType: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Get recent bookings
        const recentBookings = await db.booking.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                room: {
                    select: {
                        name: true,
                        numberofrooms: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalRooms: allRooms.length,
                activeRooms: activeRooms.length,
                inactiveRooms: allRooms.length - activeRooms.length,
                allRooms: allRooms.map(room => ({
                    id: room.id,
                    name: room.name,
                    isActive: room.isActive,
                    numberofrooms: room.numberofrooms,
                    pricePerNight: room.pricePerNight,
                    bookingCount: room._count.bookings,
                    roomType: room.roomType?.name
                })),
                activeRoomsDetails: activeRooms.map(room => ({
                    id: room.id,
                    name: room.name,
                    numberofrooms: room.numberofrooms,
                    pricePerNight: room.pricePerNight,
                    bookingCount: room._count.bookings,
                    roomType: room.roomType?.name
                })),
                recentBookings: recentBookings.map(booking => ({
                    id: booking.id,
                    roomId: booking.roomId,
                    roomName: booking.room?.name,
                    roomsAvailable: booking.room?.numberofrooms,
                    status: booking.status,
                    createdAt: booking.createdAt,
                    totalAmount: booking.totalAmount
                }))
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("❌ Database debug error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
