// lib/db.ts
import { PrismaClient } from "../generated/prisma/client";

// Define a global variable to avoid multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Function to create Prisma client with connection validation
function createPrismaClient() {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    // Test the connection on startup in development
    if (process.env.NODE_ENV === 'development') {
        client.$connect()
            .then(() => console.log('✅ Database connection established'))
            .catch(e => console.error('❌ Database connection failed:', e.message));
    }

    return client;
}

// Create a new PrismaClient instance, or use the existing one
export const db = globalForPrisma.prisma || createPrismaClient();

// If we're not in production, attach the client to the global object
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Helper function to test database connectivity
export async function testDatabaseConnection() {
    try {
        await db.$queryRaw`SELECT 1 as test`;
        return { success: true };
    } catch (error: any) {
        console.error('Database connection test failed:', error.message);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}