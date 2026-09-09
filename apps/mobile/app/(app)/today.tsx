import { RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Button, Pill, Loading, ErrorState } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { fmtDate } from '@/lib/format';

type Tone = 'green' | 'amber' | 'red' | 'neutral';

export default function Today() {
  const router = useRouter();
  const { data, error, loading, refetch } = useApi(() => api.getDashboard(), []);

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading label="Loading your day…" />
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
  if (!data) return null;

  const r = data.readinessToday;
  const tone: Tone = r ? r.flag : 'neutral';

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.blood} />
      }
    >
      <View className="mt-4 mb-6">
        <Txt variant="muted">Welcome back</Txt>
        <Txt variant="display">{data.name ?? 'Lifter'}</Txt>
      </View>

      {!data.hasProfile ? (
        <Card className="mb-4 border-blood">
          <Txt variant="heading">Finish setting up</Txt>
          <Txt variant="muted" className="mt-1 mb-3">
            Tell us your lifts and goals so we can build your program.
          </Txt>
          <Button label="Complete onboarding" onPress={() => router.push('/(app)/onboarding')} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Txt variant="label">Readiness</Txt>
          {r ? <Pill label={r.flag.toUpperCase()} tone={tone} /> : null}
        </View>
        {r ? (
          <Txt variant="body">{r.headline}</Txt>
        ) : (
          <>
            <Txt variant="muted" className="mb-3">
              Log how you feel to tune today&apos;s ceiling.
            </Txt>
            <Button
              label="Log readiness"
              variant="secondary"
              onPress={() => router.push('/(app)/readiness')}
            />
          </>
        )}
      </Card>

      <Card className="mb-4">
        <Txt variant="label">Today&apos;s session</Txt>
        {data.today ? (
          <>
            <Txt variant="heading" className="mt-1">
              {data.today.dayName}
            </Txt>
            <Txt variant="muted" className="mb-3">
              Week {data.today.weekNumber} · {data.today.exerciseCount} exercises
            </Txt>
            <Button label="Start logging" onPress={() => router.push('/(app)/log-session')} />
          </>
        ) : (
          <Txt variant="muted" className="mt-1">
            No session scheduled. Enjoy the recovery.
          </Txt>
        )}
      </Card>

      <View className="flex-row gap-3">
        <Card className="flex-1">
          <Txt variant="label">Streak</Txt>
          <Txt variant="title">{data.streakDays}d</Txt>
        </Card>
        <Card className="flex-1">
          <Txt variant="label">Last session</Txt>
          <Txt variant="title">{data.lastSessionDate ? fmtDate(data.lastSessionDate) : '—'}</Txt>
        </Card>
      </View>
    </Screen>
  );
}
