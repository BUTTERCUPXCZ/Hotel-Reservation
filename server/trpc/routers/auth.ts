// server/trpc/routers/auth.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
// Use bcryptjs instead of bcrypt to avoid native dependencies issues
import * as bcrypt from "bcryptjs";

export const authRouter = router({
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.session;
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return "You are logged in and can see this secret message!";
    }),

    register: publicProcedure
        .input(
            z.object({
                firstname: z.string().min(1, "First name is required"),
                lastname: z.string().min(1, "Last name is required"),
                email: z.string().email("Invalid email address"),
                password: z.string().min(6, "Password must be at least 6 characters"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            console.log("Register mutation started for:", input.email);

            if (!ctx.db) {
                console.error("Database connection not available");
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database connection not available",
                });
            }

            try {
                // Test database connection
                await ctx.db.$queryRaw`SELECT 1`;
                console.log("Database connection test successful for registration");

                // Check if user already exists
                console.log("Checking if user exists:", input.email);
                const existingUser = await ctx.db.user.findUnique({
                    where: { email: input.email },
                });

                if (existingUser) {
                    console.log("User already exists:", input.email);
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "User with this email already exists",
                    });
                }

                // Hash the password
                console.log("Hashing password");
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(input.password, salt);

                // Create the new user
                console.log("Creating new user");
                const newUser = await ctx.db.user.create({
                    data: {
                        firstname: input.firstname,
                        lastname: input.lastname,
                        email: input.email,
                        password: hashedPassword,
                    },
                });

                console.log("User created successfully:", newUser.id);
                // Return success response (without password)
                return {
                    status: "success",
                    user: {
                        id: newUser.id,
                        firstname: newUser.firstname,
                        lastname: newUser.lastname,
                        email: newUser.email,
                        name: `${newUser.firstname} ${newUser.lastname}`,
                    },
                };
            } catch (error: any) {
                console.error("Registration error details:", error);

                // Handle database or other errors
                if (error instanceof TRPCError) {
                    console.error("TRPC Error in registration:", error.message, error.code);
                    throw error;
                }

                // Check for specific Prisma errors
                if (error.code === 'P2002') {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "A user with this email already exists",
                    });
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to register user: " + (error.message || "Unknown error"),
                });
            }
        }),

    login: publicProcedure
        .input(
            z.object({
                email: z.string().email("Invalid email address"),
                password: z.string().min(1, "Password is required"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            console.log("Login mutation started for email:", input.email);

            try {
                // Test database connection first
                if (!ctx.db) {
                    console.error("Database connection not available");
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Database connection not available",
                    });
                }

                // Test the database connection more thoroughly
                console.log("Testing database connection...");
                let databaseAvailable = false;
                let dbError: any = null;

                try {
                    // Use a simple query that doesn't depend on any specific table structure
                    await ctx.db.$queryRaw`SELECT 1 as test`;
                    console.log("Database connection test successful");
                    databaseAvailable = true;
                } catch (dbTestError: any) {
                    console.error("Database connection test failed:", dbTestError.message);
                    console.error("Database error code:", dbTestError.code);
                    console.error("Database error details:", JSON.stringify({
                        code: dbTestError.code,
                        message: dbTestError.message,
                        meta: dbTestError.meta
                    }, null, 2));
                    dbError = dbTestError;
                    databaseAvailable = false;
                }

                if (!databaseAvailable) {
                    // Provide specific error messages based on the type of database error
                    if (dbError?.code === 'P1001') {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Cannot connect to database server. The database may be temporarily unavailable. Please try again in a few moments.",
                        });
                    } else if (dbError?.message?.includes('Authentication failed') || dbError?.message?.includes('database credentials')) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database authentication failed. Please check your database credentials in the .env file or configure your database connection.",
                        });
                    } else if (dbError?.message?.includes('ECONNREFUSED') || dbError?.message?.includes('connection refused')) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Cannot connect to database server. Please ensure the database is running and accessible.",
                        });
                    } else if (dbError?.message?.includes('timeout') || dbError?.code === 'P1008') {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database connection timeout. Please check your internet connection and try again.",
                        });
                    } else {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: `Database connection failed: ${dbError?.message || 'Unknown error'}. Please check your database configuration.`,
                        });
                    }
                }

                // Database is available, proceed with normal authentication
                console.log("Searching for user with email:", input.email);
                const user = await ctx.db.user.findUnique({
                    where: { email: input.email },
                    select: {
                        id: true,
                        email: true,
                        password: true,
                        firstname: true,
                        lastname: true
                    }
                });

                console.log("User search result:", user ? "User found" : "User not found");

                if (!user) {
                    console.log("User not found for email:", input.email);
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Invalid email or password",
                    });
                }

                // Verify password
                console.log("Verifying password for user:", user.email);
                const isPasswordValid = await bcrypt.compare(input.password, user.password);
                console.log("Password verification result:", isPasswordValid);

                if (!isPasswordValid) {
                    console.log("Invalid password for user:", user.email);
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "Invalid email or password",
                    });
                }

                console.log("Login successful for user:", user.email);

                // Return only necessary user data (without password)
                const response = {
                    status: "success",
                    user: {
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        name: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : undefined,
                    },
                };

                console.log("Returning login response:", response);
                return response;
            } catch (error: any) {
                console.error("Login error details:", error);
                console.error("Error message:", error.message);
                console.error("Error code:", error.code);

                // Re-throw TRPC errors (these are intentional errors with proper messages)
                if (error instanceof TRPCError) {
                    console.log("Re-throwing TRPC error:", error.message);
                    throw error;
                }

                console.error("Unexpected error during login:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred during login. Please try again.",
                });
            }
        }),
});
