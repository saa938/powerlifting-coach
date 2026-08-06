// Admin gate. There is no separate admin account system: an admin is simply a
// coach whose email is on the ADMIN_EMAILS allowlist (comma-separated env var).
// They log in through the normal coach login; requireAdmin then checks the
// allowlist. If ADMIN_EMAILS is unset, NO ONE is an admin (secure default).
import { redirect } from 'next/navigation';
import { getCoachSession, type SessionCoach } from './coach-auth';

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export async function getAdmin(): Promise<SessionCoach | null> {
  const coach = await getCoachSession();
  if (!coach || !isAdminEmail(coach.email)) return null;
  return coach;
}

export async function requireAdmin(): Promise<SessionCoach> {
  const admin = await getAdmin();
  if (!admin) throw new Error('FORBIDDEN');
  return admin;
}

/**
 * Gate for admin *pages* (as opposed to route handlers): resolves to the admin
 * or redirects to the coach login.
 *
 * Every admin page must await this before it loads any data. Putting the gate
 * only in the layout is not enough: a layout and its page render concurrently,
 * so an anonymous request would still start the admin queries and then have
 * them abandoned when the layout's redirect wins — which leaks the connection
 * out of the `max: 1` pool in ./db and hangs every later DB-backed route.
 */
export async function requireAdminPage(): Promise<SessionCoach> {
  const admin = await getAdmin();
  if (!admin) redirect('/coach/login');
  return admin;
}
