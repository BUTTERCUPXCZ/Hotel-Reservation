// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';

// This is a simple API endpoint that returns the current session
// Since we're using localStorage for auth state management in this version,
// this endpoint simply returns an empty session object for now

export async function GET() {
    return NextResponse.json({
        user: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }, { status: 200 });
}
