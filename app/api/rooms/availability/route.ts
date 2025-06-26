import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rooms/availability - Get current room availability
export async function GET() {
    try {
        const rooms = await db.room.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                numberofrooms: true,
                roomType: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            rooms: rooms.map(room => ({
                id: room.id,
                name: room.name,
                available: room.numberofrooms,
                roomType: room.roomType?.name || 'Unknown',
                status: room.numberofrooms > 0 ? 'Available' : 'Fully Booked',
            })),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Failed to fetch room availability:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch room availability',
            },
            { status: 500 }
        );
    }
}

// POST /api/rooms/availability - Update room availability (for testing)
export async function POST(request: NextRequest) {
    try {
        const { roomId, operation } = await request.json();

        if (!roomId || !operation) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'roomId and operation (increment/decrement) are required',
                },
                { status: 400 }
            );
        }

        const room = await db.room.findUnique({
            where: { id: roomId },
            select: { id: true, name: true, numberofrooms: true },
        });

        if (!room) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Room not found',
                },
                { status: 404 }
            );
        }

        let updateData;
        if (operation === 'decrement') {
            if (room.numberofrooms <= 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Cannot decrement - room already has 0 availability',
                    },
                    { status: 400 }
                );
            }
            updateData = { numberofrooms: { decrement: 1 } };
        } else if (operation === 'increment') {
            updateData = { numberofrooms: { increment: 1 } };
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid operation. Use "increment" or "decrement"',
                },
                { status: 400 }
            );
        }

        const updatedRoom = await db.room.update({
            where: { id: roomId },
            data: updateData,
            select: {
                id: true,
                name: true,
                numberofrooms: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: `Room ${operation}ed successfully`,
            room: {
                id: updatedRoom.id,
                name: updatedRoom.name,
                available: updatedRoom.numberofrooms,
                status: updatedRoom.numberofrooms > 0 ? 'Available' : 'Fully Booked',
            },
        });
    } catch (error) {
        console.error('Failed to update room availability:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update room availability',
            },
            { status: 500 }
        );
    }
}
