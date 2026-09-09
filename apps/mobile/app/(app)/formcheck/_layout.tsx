import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

export default function FormCheckLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.iron900 },
      }}
    />
  );
}
