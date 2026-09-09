import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { Screen, Txt, Card, Button, Field } from '@/components/ui';

function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <View className="gap-1.5">
      <Txt variant="label">{label}</Txt>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            className={`rounded-full px-3 py-2 ${o.value === value ? 'bg-blood' : 'bg-iron-700'}`}
          >
            <Txt variant="muted" className={o.value === value ? 'text-white' : ''}>
              {o.label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [bodyweight, setBodyweight] = useState('');
  const [experience, setExperience] = useState<'novice' | 'intermediate' | 'advanced'>(
    'intermediate',
  );
  const [squat, setSquat] = useState('');
  const [bench, setBench] = useState('');
  const [deadlift, setDeadlift] = useState('');
  const [days, setDays] = useState<3 | 4 | 5 | 6>(4);
  const [goal, setGoal] = useState<'total_max' | 'meet_prep' | 'recomp' | 'general_strength'>(
    'total_max',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!name || !age || !bodyweight) {
      setError('Please fill in name, age, and bodyweight.');
      return;
    }
    setSubmitting(true);
    try {
      await api.saveProfile({
        name,
        age: Number(age),
        sex,
        unit,
        bodyweight: Number(bodyweight),
        experience,
        currentMaxes: {
          squat: squat ? Number(squat) : null,
          bench: bench ? Number(bench) : null,
          deadlift: deadlift ? Number(deadlift) : null,
        },
        trainingDaysPerWeek: days,
        goal,
      });
      router.replace('/(app)/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-1">
        Set up your profile
      </Txt>
      <Txt variant="muted" className="mb-6">
        We use this to build and adapt your program.
      </Txt>

      <Card className="mb-3 gap-3">
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
        <Choice
          label="Sex"
          value={sex}
          onChange={setSex}
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
        />
        <Choice
          label="Units"
          value={unit}
          onChange={setUnit}
          options={[
            { label: 'lbs', value: 'lbs' },
            { label: 'kg', value: 'kg' },
          ]}
        />
        <Field
          label={`Bodyweight (${unit})`}
          value={bodyweight}
          onChangeText={setBodyweight}
          keyboardType="decimal-pad"
        />
      </Card>

      <Card className="mb-3 gap-3">
        <Choice
          label="Experience"
          value={experience}
          onChange={setExperience}
          options={[
            { label: 'Novice', value: 'novice' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ]}
        />
        <View className="flex-row gap-2">
          <Field
            label="Squat"
            className="flex-1"
            value={squat}
            onChangeText={setSquat}
            keyboardType="decimal-pad"
          />
          <Field
            label="Bench"
            className="flex-1"
            value={bench}
            onChangeText={setBench}
            keyboardType="decimal-pad"
          />
          <Field
            label="Deadlift"
            className="flex-1"
            value={deadlift}
            onChangeText={setDeadlift}
            keyboardType="decimal-pad"
          />
        </View>
      </Card>

      <Card className="mb-3 gap-3">
        <Choice
          label="Training days / week"
          value={days}
          onChange={setDays}
          options={[
            { label: '3', value: 3 },
            { label: '4', value: 4 },
            { label: '5', value: 5 },
            { label: '6', value: 6 },
          ]}
        />
        <Choice
          label="Goal"
          value={goal}
          onChange={setGoal}
          options={[
            { label: 'Max total', value: 'total_max' },
            { label: 'Meet prep', value: 'meet_prep' },
            { label: 'Recomp', value: 'recomp' },
            { label: 'General', value: 'general_strength' },
          ]}
        />
      </Card>

      {error ? (
        <Txt variant="muted" className="text-red-signal mb-2">
          {error}
        </Txt>
      ) : null}
      <Button label="Save & continue" onPress={submit} loading={submitting} />
    </Screen>
  );
}
