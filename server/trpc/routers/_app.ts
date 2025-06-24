import { router } from "../trpc";
import { authRouter } from "./auth";
import { roomsRouter } from "./rooms";

export const appRouter = router({
    auth: authRouter,
    rooms: roomsRouter,
    // Add more routers here
});

export type AppRouter = typeof appRouter;