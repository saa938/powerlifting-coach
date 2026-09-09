// Is Clerk usable in this environment?
//
// Deliberately stricter than "both env vars are set". A placeholder left in
// .env.local (`pk_test_REPLACE_ME`) is *present* but is not a key, and Clerk's
// React components throw on an unparseable one — which takes down `next build`
// for every prerendered public page, not just the auth surfaces. Validating the
// shape here is what makes the promise in .env.example true: with no keys, or
// with junk keys, the site still renders and only sign-in is unavailable.
//
// Kept in its own dependency-free module on purpose: middleware (edge runtime),
// the root layout, and the sign-in pages all need it, and pulling in
// clerk-identity's `react`/`@clerk/nextjs/server` imports just to ask a
// question about two strings is how you get an edge bundle you didn't want.
//
// This checks shape, never the network — it must stay synchronous and cheap
// enough for middleware to call on every request.

// A publishable key is `pk_test_`/`pk_live_` + base64 of the Frontend API host
// with a `$` terminator, e.g. `foo.clerk.accounts.dev$`.
const PUBLISHABLE = /^pk_(?:test|live)_(.+)$/;

// Secret keys are opaque, so the best available proxy is the prefix plus enough
// body that an obvious placeholder ("REPLACE_ME", "changeme") cannot pass.
//
// The body is base64url and really does contain `_`, `-` and `=` padding — an
// [A-Za-z0-9]-only class here silently rejects a VALID key, which is worse than
// no check at all: the app then reports itself unconfigured while holding
// working credentials, and the only symptom is a sign-in page that never
// appears.
const SECRET = /^sk_(?:test|live)_[A-Za-z0-9_=-]{20,}$/;

// The length floor alone is NOT enough, and this bit is load-bearing: the
// shipped placeholder `sk_test_REPLACE_ME=...` is >20 chars of exactly the
// class above, so it passed `SECRET` and `clerkConfigured()` reported true.
// The middleware then handed every request to clerkMiddleware(), Clerk's dev
// handshake came back with a token it could not verify, and the whole site
// 500'd — the precise failure the graceful degradation above exists to avoid.
// Worse, the symptom is invisible from the terminal: `curl` carries no cookies,
// so it never enters the handshake and keeps answering 200 while every real
// browser gets an error page.
//
// A real key is 42 random base64url chars, so the odds of one containing any
// word below are nil; matching them costs us no valid keys.
const PLACEHOLDER = /replace|changeme|placeholder|your[_-]?key|example|todo|xxxx/i;

function secretKeyLooksReal(key: string | undefined): boolean {
  const trimmed = key?.trim() ?? '';
  return SECRET.test(trimmed) && !PLACEHOLDER.test(trimmed);
}

function publishableKeyLooksReal(key: string | undefined): boolean {
  const body = PUBLISHABLE.exec(key?.trim() ?? '')?.[1];
  if (!body) return false;
  try {
    return atob(body).endsWith('$');
  } catch {
    // Not base64 at all — a placeholder or a truncated paste.
    return false;
  }
}

export function clerkConfigured(): boolean {
  return (
    publishableKeyLooksReal(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    secretKeyLooksReal(process.env.CLERK_SECRET_KEY)
  );
}
