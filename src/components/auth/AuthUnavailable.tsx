import Link from 'next/link';

// Shown in place of Clerk's <SignIn/> when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY /
// CLERK_SECRET_KEY are missing or still placeholders (see lib/clerk-config).
//
// The rest of the site degrades silently in that state — public pages render,
// getSession() just returns null — which is right everywhere except here, where
// a sign-in page with no form is indistinguishable from a broken deploy. So
// this one surface says so out loud.
export function AuthUnavailable() {
  return (
    <div className="border border-iron-800 bg-iron-900/60 p-6">
      <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-rpe-max">
        // SIGN-IN UNAVAILABLE
      </p>
      <p className="mb-4 font-body text-sm text-chalk-mute">
        Authentication isn&apos;t configured for this environment, so there&apos;s nothing to sign
        in to yet. Everything else on the site works.
      </p>
      <p className="font-body text-sm text-chalk-mute">
        Running this yourself? Set{' '}
        <code className="font-mono text-chalk">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{' '}
        <code className="font-mono text-chalk">CLERK_SECRET_KEY</code> in{' '}
        <code className="font-mono text-chalk">.env.local</code>, then restart the dev server.
      </p>
      <p className="mt-6 font-body text-sm">
        <Link href="/" className="text-blood hover:text-blood-glow">
          ← Back to the homepage
        </Link>
      </p>
    </div>
  );
}
