import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/api/client';
import { Screen, Txt, Card, Button } from '@/components/ui';
import { uploadToSignedUrl } from '@/lib/upload';
import type { LiftType } from '@liftly/shared-types';

const LIFTS: { label: string; value: LiftType }[] = [
  { label: 'Bench', value: 'bench' },
  { label: 'Squat', value: 'squat' },
  { label: 'Deadlift', value: 'deadlift' },
];

export default function FormCheckCapture() {
  const router = useRouter();
  const [lift, setLift] = useState<LiftType>('bench');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pickVideo() {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  }

  async function recordVideo() {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera permission is required to record.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 30,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  }

  async function analyze() {
    if (!videoUri) return;
    setBusy(true);
    setError(null);
    try {
      setStatus('Preparing upload…');
      const ticket = await api.requestFormCheckUpload(lift, 'video/mp4');
      setStatus('Uploading video…');
      await uploadToSignedUrl({
        uploadUrl: ticket.uploadUrl,
        method: ticket.method,
        fileUri: videoUri,
        contentType: 'video/mp4',
        headers: ticket.headers,
      });
      setStatus('Analyzing form…');
      const detail = await api.startFormCheckAnalysis(ticket.formCheckId);
      router.replace(`/(app)/formcheck/${detail.result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-1">
        Record a lift
      </Txt>
      <Txt variant="muted" className="mb-6">
        Film side-on, whole barbell in frame, for the clearest bar-path read.
      </Txt>

      <Txt variant="label" className="mb-2">
        Lift
      </Txt>
      <View className="flex-row gap-2 mb-6">
        {LIFTS.map((l) => (
          <Pressable
            key={l.value}
            onPress={() => setLift(l.value)}
            className={`flex-1 rounded-xl py-3 items-center ${lift === l.value ? 'bg-blood' : 'bg-iron-700'}`}
          >
            <Txt variant="body" className={lift === l.value ? 'text-white' : ''}>
              {l.label}
            </Txt>
          </Pressable>
        ))}
      </View>

      <Card className="mb-4 items-center py-8 gap-2">
        {videoUri ? (
          <>
            <Txt variant="heading">Video ready</Txt>
            <Txt variant="muted">Tap analyze to run form analysis.</Txt>
          </>
        ) : (
          <Txt variant="muted">No video selected yet.</Txt>
        )}
      </Card>

      <View className="flex-row gap-3 mb-3">
        <Button label="Record" variant="secondary" onPress={recordVideo} className="flex-1" />
        <Button label="Choose video" variant="secondary" onPress={pickVideo} className="flex-1" />
      </View>

      {status ? (
        <Txt variant="muted" className="mb-2">
          {status}
        </Txt>
      ) : null}
      {error ? (
        <Txt variant="muted" className="text-red-signal mb-2">
          {error}
        </Txt>
      ) : null}

      <Button label="Analyze form" onPress={analyze} loading={busy} disabled={!videoUri} />
    </Screen>
  );
}
