import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const cookies = req.cookies;

    // Get all cookies
    const allCookies = Object.fromEntries(cookies.getAll().map(c => [c.name, c.value]));

    // Specifically check for our auth cookies
    const userId = cookies.get('userId')?.value;
    const userEmail = cookies.get('userEmail')?.value;
    const userName = cookies.get('userName')?.value;

    return NextResponse.json({
        message: 'Auth debug information',
        auth: {
            userId,
            userEmail,
            userName,
            isAuthenticated: !!(userId && userEmail)
        },
        allCookies,
        headers: Object.fromEntries(req.headers)
    });
}
