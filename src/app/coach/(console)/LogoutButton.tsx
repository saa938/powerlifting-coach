'use client';
import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';

export function CoachLogoutButton() {
  const { signOut } = useClerk();
  return (
    <Button
      variant="ghost"
      size="sm"
      // Ends the whole Clerk session, lifter side included — there is one
      // session now, not a separate coach cookie to drop.
      onClick={() => signOut({ redirectUrl: '/coach/login' })}
    >
      Sign out
    </Button>
  );
}
