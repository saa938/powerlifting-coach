import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import {
  Screen,
  Txt,
  Card,
  Button,
  Pill,
  Divider,
  Loading,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { fmtWeight } from '@/lib/format';

export default function Program() {
  const router = useRouter();
  const { data, error, loading, refetch } = useApi(() => api.getProgram(), []);
  const [openDay, setOpenDay] = useState<number | null>(0);

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

  if (!data.hasProgram || !data.week) {
    return (
      <Screen>
        <EmptyState
          title="No program yet"
          subtitle="Complete onboarding to generate your training program."
          cta={<Button label="Onboarding" onPress={() => router.push('/(app)/onboarding')} />}
        />
      </Screen>
    );
  }

  const week = data.week;

  return (
    <Screen>
      <View className="mt-4 mb-6">
        <Txt variant="display">{data.name ?? 'Program'}</Txt>
        <View className="flex-row gap-2 mt-2">
          {data.currentBlock ? <Pill label={data.currentBlock} tone="blood" /> : null}
          <Pill label={`Week ${data.currentWeek ?? 1}/${data.totalWeeks ?? '?'}`} />
        </View>
      </View>

      {week.days.map((day) => {
        const open = openDay === day.dayNumber;
        return (
          <Card key={day.dayNumber} className="mb-3">
            <Pressable
              onPress={() => setOpenDay(open ? null : day.dayNumber)}
              className="flex-row justify-between items-center"
            >
              <Txt variant="heading">{day.dayName}</Txt>
              <Txt variant="muted">{day.exercises.length} exercises</Txt>
            </Pressable>
            {open ? (
              <View className="mt-3 gap-3">
                {day.exercises.map((ex, i) => (
                  <View key={`${ex.name}-${i}`}>
                    {i > 0 ? <Divider className="mb-3" /> : null}
                    <View className="flex-row justify-between">
                      <Txt variant="body" className="flex-1">
                        {ex.name}
                      </Txt>
                      {ex.estimatedWeight ? (
                        <Txt variant="muted">{fmtWeight(ex.estimatedWeight, ex.unit ?? 'lbs')}</Txt>
                      ) : null}
                    </View>
                    <Txt variant="muted">
                      {ex.sets}×{ex.reps} @ RPE {ex.targetRPE}
                    </Txt>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}

      <Button
        label="Log this session"
        onPress={() => router.push('/(app)/log-session')}
        className="mt-2"
      />
    </Screen>
  );
}
