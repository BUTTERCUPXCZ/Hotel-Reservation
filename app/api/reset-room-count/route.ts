import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomId, newCount } = body;

        if (!roomId || newCount === undefined) {
            return NextResponse.json({
                success: false,
                error: "roomId and newCount are required"
            }, { status: 400 });
        }

        console.log(`🔧 Resetting room ${roomId} count to ${newCount}`);

        const updatedRoom = await db.room.update({
            where: { id: roomId },
            data: {
                numberofrooms: newCount
            },
            select: {
                id: true,
                name: true,
                numberofrooms: true
            }
        });

        console.log(`✅ Room reset complete: ${updatedRoom.name} now has ${updatedRoom.numberofrooms} rooms`);

        return NextResponse.json({
            success: true,
            message: `Room count reset successfully`,
            room: updatedRoom
        });

    } catch (error: any) {
        console.error("❌ Room reset failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Return all rooms with their current counts
        const rooms = await db.room.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                numberofrooms: true,
                pricePerNight: true
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            success: true,
            rooms: rooms,
            message: "Current room counts"
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}
