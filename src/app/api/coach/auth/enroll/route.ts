import { type NextRequest, NextResponse } from 'next/server';
import { enrollCurrentUserAsCoach } from '@/lib/coach-auth';

// The one place a coaches row gets provisioned. Reached only from the explicit
// "Set up coach console" button on /coach/login, so no lifter acquires the
// coach role just by navigating to a coach URL.
//
// POST (not GET) on purpose: this writes, and a GET would let a third-party
// page enroll a signed-in visitor by embedding the URL. Clerk's session cookie
// is SameSite=Lax, which does not accompany a cross-site POST.
export async function POST(req: NextRequest) {
  const coach = await enrollCurrentUserAsCoach();
  const destination = coach ? '/coach' : '/coach/login?error=verify_email';
  // 303 so the browser follows with GET rather than re-POSTing to the console.
  return NextResponse.redirect(new URL(destination, req.url), { status: 303 });
}
