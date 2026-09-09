import { View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthProvider';
import { Loading } from '@/components/ui';
import { colors } from '@/theme/tokens';

export default function AppLayout() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 bg-iron-900">
        <Loading />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.bloodBright,
        tabBarInactiveTintColor: colors.chalkFaint,
        tabBarStyle: {
          backgroundColor: colors.iron800,
          borderTopColor: colors.iron700,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="formcheck"
        options={{
          title: 'Form',
          tabBarIcon: ({ color, size }) => <Ionicons name="videocam-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" color={color} size={size} />
          ),
        }}
      />
      {/* Pushed (non-tab) routes that live in this group. */}
      <Tabs.Screen name="log-session" options={{ href: null }} />
      <Tabs.Screen name="readiness" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
    </Tabs>
  );
}
