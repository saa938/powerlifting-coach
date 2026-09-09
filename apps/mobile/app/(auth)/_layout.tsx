import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { colors } from '@/theme/tokens';

export default function AuthLayout() {
  const { session, initializing } = useAuth();
  if (!initializing && session) return <Redirect href="/(app)/today" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.iron900 },
      }}
    />
  );
}
