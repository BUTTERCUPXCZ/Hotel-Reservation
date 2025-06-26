import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This endpoint is for testing room availability updates
export async function POST(request: NextRequest) {
    try {
        const { roomId } = await request.json();

        if (!roomId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'roomId is required'
                },
                { status: 400 }
            );
        }

        // Find the room
        const room = await db.room.findUnique({
            where: { id: roomId },
            select: { id: true, name: true, numberofrooms: true }
        });

        if (!room) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Room not found'
                },
                { status: 404 }
            );
        }

        // Check if rooms are available
        if (room.numberofrooms <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No rooms available to decrement',
                    room: {
                        id: room.id,
                        name: room.name,
                        available: room.numberofrooms,
                        status: 'Fully Booked'
                    }
                },
                { status: 400 }
            );
        }

        // Decrement room count
        const updatedRoom = await db.room.update({
            where: { id: roomId },
            data: {
                numberofrooms: {
                    decrement: 1
                }
            },
            select: {
                id: true,
                name: true,
                numberofrooms: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Room availability decremented successfully',
            room: {
                id: updatedRoom.id,
                name: updatedRoom.name,
                available: updatedRoom.numberofrooms,
                status: updatedRoom.numberofrooms > 0 ? 'Available' : 'Fully Booked'
            }
        });
    } catch (error) {
        console.error('Failed to decrement room availability:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to decrement room availability'
            },
            { status: 500 }
        );
    }
}
