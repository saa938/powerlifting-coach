import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { Loading } from '@/components/ui';

export default function Index() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading />
      </View>
    );
  }
  return <Redirect href={session ? '/(app)/today' : '/(auth)/login'} />;
}
