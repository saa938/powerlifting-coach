import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Where Clerk drops every successful lifter sign-in. Clerk can only redirect to
// a fixed URL, but the right destination depends on our own data, so it lands
// here and we route: returning lifters to the dashboard, new accounts to
// onboarding. This is also the request on which getSession() links the Clerk
// identity to an athletes row (claiming an existing one by verified email).
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  // No session at all (e.g. email not verified yet) → back to sign-in rather
  // than into an app surface that would only bounce them out again.
  const destination = !session ? '/login' : session.hasProfile ? '/dashboard' : '/onboarding';
  return NextResponse.redirect(new URL(destination, req.url));
}
