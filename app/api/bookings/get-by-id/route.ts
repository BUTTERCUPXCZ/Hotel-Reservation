import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // Get booking ID from the query parameters
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        // Fetch booking with related room and user details
        const booking = await db.booking.findUnique({
            where: { id },
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
            return NextResponse.json(
                { error: 'Booking not found', message: `No booking found with ID: ${id}` },
                { status: 404 }
            );
        }

        // Return the booking data
        return NextResponse.json(
            {
                booking,
                timestamp: new Date().toISOString(),
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    } catch (error: any) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking', message: error.message },
            { status: 500 }
        );
    }
}
