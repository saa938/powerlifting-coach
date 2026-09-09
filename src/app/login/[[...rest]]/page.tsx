import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { LiftlyLogo } from '@/components/ui/LiftlyLogo';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { clerkConfigured } from '@/lib/clerk-config';
import { AuthUnavailable } from '@/components/auth/AuthUnavailable';

// Optional catch-all: Clerk's combined sign-in-or-up flow routes its own steps
// (password, email code, reset, OAuth callback) under /login/*, so this segment
// has to swallow those sub-paths. A plain page.tsx here would 404 on them.
//
// The panel, heading and copy are the app's; only the form column is Clerk's.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-iron-950">
      {/* Visual panel — aurora drift over an engineering grid (desktop only) */}
      <div className="auth-aurora grid-lines relative hidden flex-1 overflow-hidden border-r border-iron-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="text-chalk transition-colors hover:text-blood-glow">
          <LiftlyLogo size={32} />
        </Link>
        <div>
          <p className="page-kicker mb-4">// THE PLATFORM</p>
          <p className="stencil-heading max-w-md text-4xl leading-tight text-chalk xl:text-5xl">
            Every number on the bar,{' '}
            <span className="text-chalk-mute">earned and accounted for.</span>
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-[0.25em] text-chalk-mute">
          NO FLUFF · NO PUSH NOTIFICATIONS · BUILT FOR THE PLATFORM
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

          <p className="page-kicker mb-2">// WELCOME BACK</p>
          <h1 className="stencil-heading mb-2 text-4xl text-chalk">Sign in</h1>
          <div className="accent-divider mb-6 max-w-[80px]" />
          <p className="mb-6 font-body text-sm text-chalk-mute">
            Sign in to your account to continue training. Coaching a roster?{' '}
            <Link href="/coach/login" className="text-blood hover:text-blood-glow">
              Coach sign in →
            </Link>
          </p>

          {/* fallback, not force: a `redirect_url` on the query string (deep
              links like "sign in to apply to this coach") wins, and everyone
              else lands on the server route that reads the athlete row and
              sends new accounts to onboarding, returning lifters to the
              dashboard. */}
          {clerkConfigured() ? (
            <SignIn
              appearance={clerkAppearance}
              routing="path"
              path="/login"
              signUpUrl="/login"
              fallbackRedirectUrl="/api/auth/after-sign-in"
            />
          ) : (
            <AuthUnavailable />
          )}
        </div>
      </div>
    </div>
  );
}
