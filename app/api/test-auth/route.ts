// app/api/test-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.log('🔄 Testing auth API endpoint...');

        // Test database connection
        const dbTest = await testDatabaseConnection();

        return NextResponse.json({
            status: 'success',
            message: 'Auth API endpoint is working',
            database: dbTest,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Auth API test failed:', error.message);

        return NextResponse.json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('🔄 Test login request:', body.email);

        // Simple validation
        if (!body.email || !body.password) {
            return NextResponse.json({
                status: 'error',
                message: 'Email and password are required'
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Test login endpoint is working',
            received: {
                email: body.email,
                passwordLength: body.password.length
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
