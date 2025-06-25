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
    }), register: publicProcedure
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
                // Handle database or other errors
                if (error instanceof TRPCError) {
                    console.error("TRPC Error in registration:", error.message, error.code);
                    throw error;
                }

                console.error("Registration error details:", error);

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
        }), login: publicProcedure
            .input(
                z.object({
                    email: z.string().email("Invalid email address"),
                    password: z.string().min(1, "Password is required"),
                })
            )
            .mutation(async ({ ctx, input }) => {
                try {
                    // Check if user exists with a more efficient query
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

                    if (!user) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "User not found",
                        });
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(input.password, user.password);
                    if (!isPasswordValid) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Invalid password",
                        });
                    }

                    // Return only necessary user data (without password)
                    return {
                        status: "success",
                        user: {
                            id: user.id,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            name: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : undefined,
                        },
                    };
                } catch (error) {
                    // Simplified error handling
                    if (error instanceof TRPCError) {
                        throw error;
                    }

                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to log in",
                    });
                }
            }),
});