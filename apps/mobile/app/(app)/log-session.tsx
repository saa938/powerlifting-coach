import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import {
  Screen,
  Txt,
  Card,
  Button,
  Field,
  Divider,
  Loading,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import type { SessionLogInput } from '@liftly/shared-types';

interface SetRow {
  reps: string;
  weight: string;
  rpe: string;
}
type SetsByExercise = Record<string, SetRow[]>;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogSession() {
  const router = useRouter();
  const { data, error, loading, refetch } = useApi(() => api.getProgram(), []);
  const [dayIndex, setDayIndex] = useState(0);
  const [sets, setSets] = useState<SetsByExercise>({});
  const [bodyweight, setBodyweight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = data?.week?.days ?? [];
  const day = days[dayIndex];

  useEffect(() => {
    if (!day) return;
    setSets((prev) => {
      const next = { ...prev };
      for (const ex of day.exercises) {
        if (!next[ex.name]) {
          next[ex.name] = Array.from({ length: Math.max(1, ex.sets) }, () => ({
            reps: ex.reps ? String(ex.reps) : '',
            weight: ex.estimatedWeight ? String(ex.estimatedWeight) : '',
            rpe: ex.targetRPE ? String(ex.targetRPE) : '',
          }));
        }
      }
      return next;
    });
  }, [dayIndex, day]);

  function updateSet(exercise: string, i: number, field: keyof SetRow, value: string) {
    setSets((prev) => {
      const rows = [...(prev[exercise] ?? [])];
      rows[i] = { ...rows[i], [field]: value };
      return { ...prev, [exercise]: rows };
    });
  }

  function addSet(exercise: string) {
    setSets((prev) => {
      const rows = [...(prev[exercise] ?? [])];
      const last = rows[rows.length - 1] ?? { reps: '', weight: '', rpe: '' };
      return { ...prev, [exercise]: [...rows, { ...last }] };
    });
  }

  async function submit() {
    if (!data?.hasProgram || !day) return;
    const exercises = day.exercises
      .map((ex) => ({
        exercise: ex.name,
        sets: (sets[ex.name] ?? [])
          .map((s) => ({
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
            actualRPE: Number(s.rpe) || 0,
          }))
          .filter((s) => s.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    if (exercises.length === 0) {
      setSubmitError('Enter at least one set.');
      return;
    }

    const input: SessionLogInput = {
      weekNumber: data.currentWeek ?? 1,
      dayNumber: day.dayNumber,
      date: todayIso(),
      exercises,
      bodyweight: bodyweight ? Number(bodyweight) : undefined,
      notes: notes || undefined,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.logSession(input);
      router.replace('/(app)/today');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to log session');
    } finally {
      setSubmitting(false);
    }
  }

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
  if (!data?.hasProgram || days.length === 0) {
    return (
      <Screen>
        <EmptyState title="No session to log" subtitle="You need an active program first." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Log session
      </Txt>

      <View className="flex-row flex-wrap gap-2 mb-4">
        {days.map((d, i) => (
          <Pressable
            key={d.dayNumber}
            onPress={() => setDayIndex(i)}
            className={`rounded-full px-3 py-1.5 ${i === dayIndex ? 'bg-blood' : 'bg-iron-700'}`}
          >
            <Txt variant="muted" className={i === dayIndex ? 'text-white' : ''}>
              {d.dayName}
            </Txt>
          </Pressable>
        ))}
      </View>

      {day?.exercises.map((ex) => (
        <Card key={ex.name} className="mb-3">
          <Txt variant="heading" className="mb-1">
            {ex.name}
          </Txt>
          <Txt variant="muted" className="mb-3">
            target {ex.sets}×{ex.reps} @ RPE {ex.targetRPE}
          </Txt>
          {(sets[ex.name] ?? []).map((row, i) => (
            <View key={i} className="mb-2">
              {i > 0 ? <Divider className="mb-2" /> : null}
              <View className="flex-row gap-2">
                <Field
                  label={i === 0 ? 'Reps' : undefined}
                  className="flex-1"
                  value={row.reps}
                  onChangeText={(v) => updateSet(ex.name, i, 'reps', v)}
                  keyboardType="number-pad"
                />
                <Field
                  label={i === 0 ? 'Weight' : undefined}
                  className="flex-1"
                  value={row.weight}
                  onChangeText={(v) => updateSet(ex.name, i, 'weight', v)}
                  keyboardType="decimal-pad"
                />
                <Field
                  label={i === 0 ? 'RPE' : undefined}
                  className="flex-1"
                  value={row.rpe}
                  onChangeText={(v) => updateSet(ex.name, i, 'rpe', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          ))}
          <Pressable onPress={() => addSet(ex.name)} className="mt-1 self-start">
            <Txt variant="muted" className="text-blood-bright">
              + Add set
            </Txt>
          </Pressable>
        </Card>
      ))}

      <Card className="mb-3">
        <Field
          label="Bodyweight (optional)"
          value={bodyweight}
          onChangeText={setBodyweight}
          keyboardType="decimal-pad"
        />
        <View className="h-3" />
        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="How did it feel?"
        />
      </Card>

      {submitError ? (
        <Txt variant="muted" className="text-red-signal mb-2">
          {submitError}
        </Txt>
      ) : null}
      <Button label="Save session" onPress={submit} loading={submitting} />
    </Screen>
  );
}
