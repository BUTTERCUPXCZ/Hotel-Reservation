// app/api/create-demo-user/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST() {
    try {
        // Check if demo user already exists
        const existingUser = await db.user.findUnique({
            where: { email: 'demo@example.com' },
        });

        if (existingUser) {
            return NextResponse.json({
                success: true,
                message: 'Demo user already exists',
                user: {
                    email: existingUser.email,
                    firstname: existingUser.firstname,
                    lastname: existingUser.lastname
                }
            });
        }

        // Create demo user
        const hashedPassword = await bcrypt.hash('demo123', 10);

        const demoUser = await db.user.create({
            data: {
                firstname: 'Demo',
                lastname: 'User',
                email: 'demo@example.com',
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Demo user created successfully',
            user: {
                email: demoUser.email,
                firstname: demoUser.firstname,
                lastname: demoUser.lastname
            }
        });
    } catch (error: any) {
        console.error('Failed to create demo user:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to create demo user',
            details: error.message
        }, { status: 500 });
    }
}
