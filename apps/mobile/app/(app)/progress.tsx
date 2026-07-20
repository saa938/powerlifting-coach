import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Loading, ErrorState, EmptyState } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { fmtWeight } from '@/lib/format';

const LIFTS = ['squat', 'bench', 'deadlift'] as const;
type Lift = (typeof LIFTS)[number];

export default function Progress() {
  const { data, error, loading, refetch } = useApi(() => api.getProgress(), []);

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
  if (!data) return null;

  const pointsFor = (lift: Lift) =>
    data.e1rms
      .filter((p) => p[lift] != null)
      .map((p) => ({ date: p.date, e1rm: p[lift] as number }));

  const hasAnyLift = LIFTS.some((lift) => pointsFor(lift).length > 0);

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-6">
        Progress
      </Txt>

      {!hasAnyLift ? (
        <EmptyState
          title="No lifts logged yet"
          subtitle="Log a session to see your estimated 1RM trend."
        />
      ) : null}

      {LIFTS.map((lift) => {
        const points = pointsFor(lift);
        if (points.length === 0) return null;
        return (
          <Card key={lift} className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Txt variant="heading" className="capitalize">
                {lift}
              </Txt>
              <Txt variant="muted">best {fmtWeight(data.summary.best[lift], data.unit)}</Txt>
            </View>
            {points.length > 1 ? (
              <LineChart
                data={points.map((p) => ({ value: p.e1rm }))}
                color={colors.blood}
                thickness={2}
                hideDataPoints={points.length > 12}
                yAxisTextStyle={{ color: colors.chalkFaint }}
                xAxisColor={colors.iron600}
                yAxisColor={colors.iron600}
                rulesColor={colors.iron700}
                height={140}
                adjustToWidth
              />
            ) : (
              <Txt variant="muted">Not enough data yet.</Txt>
            )}
            <Txt variant="muted" className="mt-2">
              Current e1RM {fmtWeight(data.summary.current[lift], data.unit)}
            </Txt>
          </Card>
        );
      })}
    </Screen>
  );
}
