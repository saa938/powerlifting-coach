import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { clerkConfigured } from '@/lib/clerk-config';

// Clerk owns the session. clerkMiddleware() reads the session cookie, refreshes
// the token, and makes auth() work in every server component and route handler
// downstream. Route *protection* deliberately does not live here: each page and
// handler gates itself via requireSession/requireCoach/requireAdminPage, which
// is both Clerk's own recommendation and what keeps an anonymous request from
// starting DB queries it will never use (see the comment on requireAdminPage —
// a gate that loses a race to a redirect leaks a connection out of the `max: 1`
// pool and hangs every later DB-backed route).
const handler = clerkMiddleware();

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // No Clerk configured (local dev without keys, or a misdeployed env): pass the
  // request straight through instead of 500ing every route on the site. Mirrors
  // the graceful degradation getSession() applies on the server.
  if (!clerkConfigured()) return NextResponse.next();
  return handler(request, event);
}

export const config = {
  matcher: [
    // Everything except Next's static output and image files...
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // ...plus API and tRPC routes, which the pattern above skips when they
    // contain a dot.
    '/(api|trpc)(.*)',
  ],
};
