import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/trpc/routers/_app";
import { createTRPCContextApp } from "../../../../server/trpc/context";
import { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: async () => {
            // For App Router, we need to handle sessions differently
            // as we don't have direct access to res
            return createTRPCContextApp({ req });
        },
        onError:
            process.env.NODE_ENV === "development"
                ? ({ path, error }) => {
                    console.error(`❌ tRPC error on ${path ?? "<no-path>"}: ${error.message}`);
                }
                : undefined,
    });

export { handler as GET, handler as POST };