import { useState } from 'react';
import { View } from 'react-native';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import {
  Screen,
  Txt,
  Card,
  Button,
  Field,
  Pill,
  Divider,
  Loading,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export default function Nutrition() {
  const { data, error, loading, refetch } = useApi(() => api.getNutrition(), []);
  const [steer, setSteer] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  async function generate(optimize: boolean) {
    setGenerating(true);
    setGenError(null);
    try {
      await api.generateNutrition({ steer: steer || undefined, optimize });
      setSteer('');
      refetch();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading label="Loading nutrition…" />
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

  const targets = data?.targets ?? null;
  const plan = data?.plan ?? null;

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Nutrition
      </Txt>

      {targets ? (
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <Txt variant="label">Daily targets</Txt>
            {data?.stale ? <Pill label="Stale" tone="amber" /> : null}
          </View>
          <Txt variant="title" className="mt-1">
            {Math.round(targets.calories)} kcal
          </Txt>
          <Txt variant="muted" className="mt-1">
            P {Math.round(targets.protein_g)}g · C {Math.round(targets.carbs_g)}g · F{' '}
            {Math.round(targets.fat_g)}g
          </Txt>
        </Card>
      ) : null}

      {plan ? (
        plan.meals.map((meal, i) => (
          <Card key={`${meal.name}-${i}`} className="mb-3">
            <View className="flex-row justify-between">
              <Txt variant="heading">{meal.name}</Txt>
              <Txt variant="muted">{Math.round(meal.calories)} kcal</Txt>
            </View>
            <Txt variant="muted" className="mb-2">
              {meal.timing}
            </Txt>
            {meal.items.map((item, j) => (
              <View key={j} className="flex-row justify-between py-0.5">
                <Txt variant="body" className="flex-1">
                  {item.food}
                </Txt>
                <Txt variant="muted">{item.quantity}</Txt>
              </View>
            ))}
          </Card>
        ))
      ) : (
        <EmptyState
          title="No meal plan yet"
          subtitle="Generate an allergy-safe plan tuned to your training phase."
        />
      )}

      <Divider className="my-4" />
      <Field
        label="Steer (optional)"
        value={steer}
        onChangeText={setSteer}
        placeholder="e.g. more Asian food, cheaper meals"
        multiline
      />
      {genError ? (
        <Txt variant="muted" className="text-red-signal mt-2">
          {genError}
        </Txt>
      ) : null}
      <View className="flex-row gap-3 mt-3">
        <Button
          label={plan ? 'Regenerate' : 'Generate plan'}
          onPress={() => generate(false)}
          loading={generating}
          className="flex-1"
        />
        <Button
          label="Optimize my diet"
          variant="secondary"
          onPress={() => generate(true)}
          className="flex-1"
        />
      </View>
    </Screen>
  );
}
