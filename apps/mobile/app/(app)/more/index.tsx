import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Txt, Card, Button, Divider } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { colors } from '@/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

const ITEMS: { label: string; href: Href; icon: IconName }[] = [
  { label: 'Nutrition', href: '/(app)/more/nutrition', icon: 'nutrition-outline' },
  { label: 'AI Coach', href: '/(app)/more/chat', icon: 'chatbubbles-outline' },
  { label: 'Upgrade to Pro', href: '/(app)/more/upgrade', icon: 'sparkles-outline' },
  { label: 'Manage subscription', href: '/(app)/more/subscription', icon: 'card-outline' },
  { label: 'Profile', href: '/(app)/more/profile', icon: 'person-outline' },
  { label: 'Coach console', href: '/(app)/more/coach', icon: 'people-outline' },
  { label: 'Admin', href: '/(app)/more/admin', icon: 'shield-checkmark-outline' },
  { label: 'Settings', href: '/(app)/more/settings', icon: 'settings-outline' },
];

export default function More() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-1">
        More
      </Txt>
      <Txt variant="muted" className="mb-6">
        {user?.email ?? ''}
      </Txt>

      <Card className="mb-6 p-0">
        {ITEMS.map((item, i) => (
          <View key={item.href as string}>
            {i > 0 ? <Divider /> : null}
            <Pressable
              onPress={() => router.push(item.href)}
              className="flex-row items-center gap-3 px-4 py-4 active:bg-iron-700"
            >
              <Ionicons name={item.icon} size={20} color={colors.chalkMuted} />
              <Txt variant="body" className="flex-1">
                {item.label}
              </Txt>
              <Ionicons name="chevron-forward" size={18} color={colors.chalkFaint} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Button label="Sign out" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
