import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { Screen, Txt, Card, Button } from '@/components/ui';

const METRICS = [
  { key: 'sleep', label: 'Sleep', hint: '10 = fully rested' },
  { key: 'energy', label: 'Energy', hint: '10 = high energy' },
  { key: 'soreness', label: 'Soreness', hint: '10 = very sore' },
  { key: 'stress', label: 'Stress', hint: '10 = very stressed' },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        className="w-10 h-10 rounded-full bg-iron-700 items-center justify-center active:bg-iron-600"
      >
        <Txt variant="heading">−</Txt>
      </Pressable>
      <View className="flex-1 h-2 rounded-full bg-iron-700 overflow-hidden">
        <View style={{ width: `${(value / 10) * 100}%` }} className="h-2 bg-blood" />
      </View>
      <Pressable
        onPress={() => onChange(Math.min(10, value + 1))}
        className="w-10 h-10 rounded-full bg-iron-700 items-center justify-center active:bg-iron-600"
      >
        <Txt variant="heading">+</Txt>
      </Pressable>
    </View>
  );
}

export default function Readiness() {
  const router = useRouter();
  const [values, setValues] = useState<Record<MetricKey, number>>({
    sleep: 7,
    energy: 7,
    soreness: 3,
    stress: 3,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitReadiness({
        date: todayIso(),
        sleep: values.sleep,
        energy: values.energy,
        soreness: values.soreness,
        stress: values.stress,
        pain: null,
        painNote: null,
        note: null,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-2">
        Readiness
      </Txt>
      <Txt variant="muted" className="mb-6">
        A quick check-in. It only ever suggests a soft ceiling — it never forces a change.
      </Txt>

      {METRICS.map((m) => (
        <Card key={m.key} className="mb-3">
          <View className="flex-row justify-between mb-2">
            <Txt variant="heading">{m.label}</Txt>
            <Txt variant="title">{values[m.key]}</Txt>
          </View>
          <Stepper value={values[m.key]} onChange={(v) => setValues((s) => ({ ...s, [m.key]: v }))} />
          <Txt variant="muted" className="mt-1">
            {m.hint}
          </Txt>
        </Card>
      ))}

      {error ? (
        <Txt variant="muted" className="text-red-signal mb-2">
          {error}
        </Txt>
      ) : null}
      <Button label="Submit" onPress={submit} loading={submitting} className="mt-2" />
    </Screen>
  );
}
