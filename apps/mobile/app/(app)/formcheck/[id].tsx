import { useCallback } from 'react';
import { Image, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useApi } from '@/api/useApi';
import { Screen, Txt, Card, Button, Pill, Divider, Loading, ErrorState } from '@/components/ui';

export default function FormCheckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, error, loading, refetch } = useApi(
    useCallback(() => api.getFormCheck(String(id)), [id]),
    [id],
  );

  if (loading && !data) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading label="Loading analysis…" />
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

  const r = data.result;
  const cv = r.cv;

  return (
    <Screen>
      <View className="mt-4 mb-4 flex-row items-center justify-between">
        <Txt variant="display" className="capitalize">
          {r.liftType}
        </Txt>
        {r.estimatedRPE != null ? (
          <Pill label={`RPE ${r.estimatedRPE}${r.rpeConfidence ? ` · ${r.rpeConfidence}` : ''}`} tone="blood" />
        ) : null}
      </View>

      {cv?.overlayPng ? (
        <Card className="mb-4 p-0 overflow-hidden">
          <Image
            source={{ uri: `data:image/png;base64,${cv.overlayPng}` }}
            style={{ width: '100%', aspectRatio: 1 }}
            resizeMode="contain"
          />
        </Card>
      ) : null}

      {cv ? (
        <Card className="mb-4">
          <Txt variant="label">Bar path</Txt>
          <Txt variant="body" className="mt-1">
            {cv.summary.barPathNote}
          </Txt>
          <Divider className="my-3" />
          <View className="flex-row justify-between">
            <Txt variant="muted">Reps</Txt>
            <Txt variant="body">{cv.summary.repCount}</Txt>
          </View>
          {cv.summary.velocityLossPct != null ? (
            <View className="flex-row justify-between mt-1">
              <Txt variant="muted">Velocity loss</Txt>
              <Txt variant="body">{Math.round(cv.summary.velocityLossPct)}%</Txt>
            </View>
          ) : null}
        </Card>
      ) : null}

      {r.aiAnalysis ? (
        <Card className="mb-4">
          <Txt variant="label">Coach notes</Txt>
          <Txt variant="body" className="mt-1">
            {r.aiAnalysis}
          </Txt>
        </Card>
      ) : null}

      <Button label="Back to form checks" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
