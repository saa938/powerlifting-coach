import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Button, Divider, Loading, ErrorState } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Txt variant="muted">{label}</Txt>
      <Txt variant="body">{value}</Txt>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, error, loading, refetch } = useApi(() => api.getProfile(), []);

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading />
      </View>
    );
  }
  if (error && !data) {
    return (
      <Screen>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const p = (data?.profile ?? {}) as Record<string, unknown>;
  const str = (k: string) => (p[k] == null ? '—' : String(p[k]));

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Profile
      </Txt>
      <Card className="mb-4">
        <Row label="Name" value={data?.name ?? str('name')} />
        <Divider />
        <Row label="Email" value={data?.email ?? '—'} />
        <Divider />
        <Row label="Experience" value={str('experience')} />
        <Divider />
        <Row label="Bodyweight" value={`${str('bodyweight')} ${str('unit')}`} />
        <Divider />
        <Row label="Goal" value={str('goal')} />
      </Card>

      <Button
        label="Edit profile"
        variant="secondary"
        onPress={() => router.push('/(app)/onboarding')}
      />
      <View className="h-3" />
      <Button label="Sign out" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
