import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        console.log("Auth debug endpoint called");
        const cookies = req.cookies;

        // Get all cookies
        const allCookies = Object.fromEntries(cookies.getAll().map(c => [c.name, c.value]));

        // Specifically check for our auth cookies
        const userId = cookies.get('userId')?.value;
        const userEmail = cookies.get('userEmail')?.value;
        const userName = cookies.get('userName')?.value;

        // Test database connection
        let dbStatus = "disconnected";
        let userCount = 0;
        let dbError: string | null = null;
        let sampleUsers: any[] = [];

        try {
            await db.$queryRaw`SELECT 1`;
            dbStatus = "connected";

            // Count users in database
            userCount = await db.user.count();

            // Get first few users (without passwords)
            sampleUsers = await db.user.findMany({
                take: 3,
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    createdAt: true
                }
            });
        } catch (error: any) {
            dbError = error.message;
            console.error("Database connection error:", error);
        }

        // Check environment variables
        const envCheck = {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrl: process.env.DATABASE_URL ?
                process.env.DATABASE_URL.substring(0, 30) + "..." :
                "not set",
            nodeEnv: process.env.NODE_ENV,
        };

        return NextResponse.json({
            message: 'Auth debug information',
            timestamp: new Date().toISOString(),
            auth: {
                userId,
                userEmail,
                userName,
                isAuthenticated: !!(userId && userEmail)
            },
            database: {
                status: dbStatus,
                userCount,
                error: dbError,
                sampleUsers
            },
            environment: envCheck,
            allCookies,
            headers: Object.fromEntries(req.headers)
        });
    } catch (error: any) {
        console.error("Debug endpoint error:", error);
        return NextResponse.json({
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
