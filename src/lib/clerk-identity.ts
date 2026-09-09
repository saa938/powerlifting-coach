// The single point where this app reads an identity out of Clerk.
//
// Everything else (lib/auth for lifters, lib/coach-auth for coaches) resolves a
// Clerk user to one of OUR rows and never talks to Clerk directly. Keeping that
// boundary in one file is what made swapping Supabase Auth out a contained
// change, and is what would make the next swap contained too.
import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkConfigured } from './clerk-config';

/**
 * Is Clerk wired up at all? When it isn't — local dev without keys, or a
 * misdeployed environment — every caller treats the request as logged out
 * rather than throwing, so the landing page and other public surfaces keep
 * rendering. Calling auth() in that state throws, so this must be checked
 * first, not after.
 *
 * Re-exported so auth callers have one import; the check itself lives in
 * ./clerk-config, which middleware and the layout also use.
 */
export { clerkConfigured } from './clerk-config';

/**
 * The signed-in Clerk user id (`user_...`), or null. Reads the session cookie
 * that middleware verified — no network call, so this is the cheap path and the
 * one every authenticated request should hit once linking has happened.
 */
export async function clerkUserId(): Promise<string | null> {
  if (!clerkConfigured()) return null;
  const { userId } = await auth();
  return userId ?? null;
}

export interface ClerkIdentity {
  userId: string;
  email: string;
  name: string | null;
}

/**
 * The signed-in user's VERIFIED primary email, plus their display name.
 *
 * Verification is not a formality here: lib/auth and lib/coach-auth claim an
 * existing row by matching this email, so an unverified address would let
 * anyone sign up as someone else's email and inherit their athlete history,
 * their coach roster, or — via the ADMIN_EMAILS allowlist — the admin console.
 * Unverified or non-primary emails return null and are never matched against.
 *
 * This costs a Clerk API call, so callers use it only on the linking path — a
 * clerk_user_id lookup missed. For a lifter that is once per lifetime; for a
 * signed-in NON-coach it recurs on any page that asks for a coach session
 * (a public coach profile does), because "no coaches row" is not a fact we can
 * cache anywhere. cache() at least collapses it to one call per request no
 * matter how many auth helpers ask.
 */
export const clerkVerifiedIdentity = cache(async (): Promise<ClerkIdentity | null> => {
  if (!clerkConfigured()) return null;
  const user = await currentUser();
  if (!user) return null;

  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  if (!primary || primary.verification?.status !== 'verified') return null;

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username || null;

  return { userId: user.id, email: primary.emailAddress.trim().toLowerCase(), name };
});
