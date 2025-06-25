import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Get all cookies
        const cookies = Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value]));

        // Get authentication info
        const userId = req.cookies.get('userId')?.value;
        const userEmail = req.cookies.get('userEmail')?.value;

        // Get database statistics
        let dbStats: any = { error: 'Not available' };
        let bookings: any = { error: 'Not available' };
        let user: any = { error: 'Not available' };

        try {
            // Get booking count
            const bookingCount = await db.booking.count();

            // Get user info if authenticated
            if (userEmail) {
                const userInfo = await db.user.findUnique({
                    where: { email: userEmail },
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        lastname: true,
                        _count: {
                            select: { bookings: true }
                        }
                    }
                });

                user = userInfo || { error: 'User not found' };
            }

            // Get a sample of bookings (most recent 5)
            const recentBookings = await db.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    userId: true,
                    roomId: true,
                    checkInDate: true,
                    checkOutDate: true,
                    status: true,
                    createdAt: true
                }
            });

            dbStats = {
                bookingCount,
                userCount: await db.user.count(),
                roomCount: await db.room.count()
            };

            bookings = recentBookings;
        } catch (dbError) {
            console.error("DB error in debug endpoint:", dbError);
        }

        return NextResponse.json({
            message: 'Debug information',
            timestamp: new Date().toISOString(),
            auth: {
                userId,
                userEmail,
                isAuthenticated: !!(userId && userEmail)
            },
            cookies,
            headers: Object.fromEntries(req.headers),
            database: {
                stats: dbStats,
                bookings,
                authenticatedUser: user
            }
        });
    } catch (error) {
        console.error("Error in debug endpoint:", error);
        return NextResponse.json({ error: 'Debug endpoint error' }, { status: 500 });
    }
}
