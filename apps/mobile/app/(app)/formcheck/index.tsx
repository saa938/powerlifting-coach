import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Button, Pill, Loading, ErrorState, EmptyState } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { fmtDate } from '@/lib/format';

export default function FormCheckList() {
  const router = useRouter();
  const { data, error, loading, refetch } = useApi(() => api.listFormChecks(), []);

  return (
    <Screen>
      <View className="mt-4 mb-6 flex-row items-center justify-between">
        <Txt variant="display">Form check</Txt>
        <Pressable
          onPress={() => router.push('/(app)/formcheck/capture')}
          className="w-11 h-11 rounded-full bg-blood items-center justify-center"
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      </View>

      {loading && !data ? <Loading /> : null}
      {error && !data ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title="No form checks yet"
          subtitle="Film a set of bench, squat, or deadlift and get bar-path + RPE analysis."
          cta={
            <Button label="Record a lift" onPress={() => router.push('/(app)/formcheck/capture')} />
          }
        />
      ) : null}

      {data?.items.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/(app)/formcheck/${item.id}`)}>
          <Card className="mb-3 flex-row items-center justify-between">
            <View>
              <Txt variant="heading" className="capitalize">
                {item.liftType}
              </Txt>
              <Txt variant="muted">{fmtDate(item.createdAt)}</Txt>
            </View>
            <View className="items-end gap-1">
              {item.estimatedRPE != null ? (
                <Pill label={`RPE ${item.estimatedRPE}`} tone="blood" />
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={colors.chalkFaint} />
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
