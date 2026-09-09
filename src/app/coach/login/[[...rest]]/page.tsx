import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { LiftlyLogo } from '@/components/ui/LiftlyLogo';
import { Button } from '@/components/ui/Button';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { getCoachSession } from '@/lib/coach-auth';
import { clerkUserId } from '@/lib/clerk-identity';
import { clerkConfigured } from '@/lib/clerk-config';
import { AuthUnavailable } from '@/components/auth/AuthUnavailable';

// Three states, in order:
//   1. already a coach            → straight to the console
//   2. signed in but not a coach  → explicit opt-in to create the coaches row
//   3. signed out                 → Clerk sign-in, returning here for step 2
//
// Step 2 is a deliberate speed bump. Provisioning a coach on any visit to a
// /coach URL would hand the role — and with it the ADMIN_EMAILS surface — to
// any lifter who wandered in.
export default async function CoachLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const coach = await getCoachSession();
  if (coach) redirect('/coach');

  const signedIn = !!(await clerkUserId());

  return (
    <div className="flex min-h-screen bg-iron-950">
      {/* Visual panel — aurora drift over an engineering grid (desktop only) */}
      <div className="auth-aurora grid-lines relative hidden flex-1 overflow-hidden border-r border-iron-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="text-chalk transition-colors hover:text-blood-glow">
          <LiftlyLogo size={32} />
        </Link>
        <div>
          <p className="page-kicker mb-4">// COACH CONSOLE</p>
          <p className="stencil-heading max-w-md text-4xl leading-tight text-chalk xl:text-5xl">
            Your whole roster, <span className="text-chalk-mute">one glance.</span>
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-[0.25em] text-chalk-mute">
          THE AI DRAFTS · YOU APPROVE · NOTHING SHIPS WITHOUT SIGN-OFF
        </p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 65%)' }}
        />
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[520px] lg:shrink-0">
        <div className="stagger w-full max-w-md">
          <Link href="/" className="mb-10 block lg:hidden">
            <LiftlyLogo size={40} className="text-chalk" />
          </Link>

          <p className="page-kicker mb-2">// COACH ACCESS</p>
          <h1 className="stencil-heading mb-2 text-4xl text-chalk">
            {signedIn ? 'Set up your console' : 'Coach sign in'}
          </h1>
          <div className="accent-divider mb-6 max-w-[80px]" />

          {searchParams.error === 'verify_email' && (
            <div className="mb-6 font-mono text-sm text-rpe-max">
              Verify your email address in Clerk before setting up a coach console.
            </div>
          )}

          {signedIn ? (
            <>
              <p className="mb-6 font-body text-sm text-chalk-mute">
                You&apos;re signed in, but this account has no coach console yet. Create one to
                start building a roster. Your lifter account, if you have one, is unaffected.
              </p>
              <form action="/api/coach/auth/enroll" method="POST">
                <Button type="submit" className="w-full">
                  Create coach console →
                </Button>
              </form>
              <p className="mt-6 text-center font-body text-sm text-chalk-mute">
                Training instead?{' '}
                <Link href="/dashboard" className="text-blood hover:text-blood-glow">
                  Go to your dashboard →
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="mb-6 font-body text-sm text-chalk-mute">
                Sign in to manage your roster. Here to train?{' '}
                <Link href="/login" className="text-blood hover:text-blood-glow">
                  Lifter sign in →
                </Link>
              </p>
              {/* Returns here rather than to /coach: signing in is not the same
                  as having a console, and the next step is the opt-in above. */}
              {clerkConfigured() ? (
                <SignIn
                  appearance={clerkAppearance}
                  routing="path"
                  path="/coach/login"
                  signUpUrl="/coach/login"
                  forceRedirectUrl="/coach/login"
                />
              ) : (
                <AuthUnavailable />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
