import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// Define a simplified session type for our app
interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
}

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    // Add the Prisma client to make it available in all procedures
    db,
  };
};

// Original context creator for Pages Router
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Simple session check from cookies or headers
  let session: Session | null = null;

  // Check if there's an authentication cookie or header
  // This is a simplified version - in a real app you'd verify a JWT or session cookie
  const userId = req.cookies['userId'] || req.headers['x-user-id'];
  const userEmail = req.cookies['userEmail'] || req.headers['x-user-email'];
  const userName = req.cookies['userName'] || req.headers['x-user-name'];

  if (userId && userEmail) {
    session = {
      user: {
        id: userId.toString(),
        email: userEmail.toString(),
        name: userName?.toString(),
      }
    };
  }

  return createInnerTRPCContext({
    session,
  });
};

// New context creator for App Router
export const createTRPCContextApp = async (opts: { req: NextRequest }) => {
  const { req } = opts;

  // Simple session check from cookies or headers
  let session: Session | null = null;

  try {
    // Check if there's an authentication cookie or header
    // This is a simplified version - in a real app you'd verify a JWT or session cookie
    const userId = req.cookies.get('userId')?.value || req.headers.get('x-user-id');
    const userEmail = req.cookies.get('userEmail')?.value || req.headers.get('x-user-email');
    const userName = req.cookies.get('userName')?.value || req.headers.get('x-user-name');

    console.log("TRPC Context - Found cookies:", {
      userId: userId ? "present" : "missing",
      userEmail: userEmail ? "present" : "missing",
      userName: userName ? "present" : "missing"
    });

    if (userId && userEmail) {
      session = {
        user: {
          id: userId.toString(),
          email: userEmail.toString(),
          name: userName?.toString(),
        }
      };
      console.log("TRPC Context - Session created for user:", userEmail);
    } else {
      console.log("TRPC Context - No valid session found");
    }
  } catch (error) {
    console.error("TRPC Context - Error creating session:", error);
  }

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  console.log("Protected procedure - checking auth:", {
    hasSession: !!ctx.session,
    hasUser: !!ctx.session?.user,
    userEmail: ctx.session?.user?.email
  });

  if (!ctx.session || !ctx.session.user) {
    console.log("Protected procedure - UNAUTHORIZED: No session or user");
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action'
    });
  }

  console.log("Protected procedure - AUTH SUCCESS for user:", ctx.session.user.email);

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
