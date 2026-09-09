import { Linking, View } from 'react-native';
import Constants from 'expo-constants';
import { Screen, Txt, Card, Button, Divider } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { ENV } from '@/env';

export default function Settings() {
  const { signOut } = useAuth();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen>
      <Txt variant="display" className="mt-4 mb-4">
        Settings
      </Txt>

      <Card className="mb-4">
        <View className="flex-row justify-between py-2">
          <Txt variant="muted">Version</Txt>
          <Txt variant="body">{version}</Txt>
        </View>
        <Divider />
        <View className="flex-row justify-between py-2">
          <Txt variant="muted">Backend</Txt>
          <Txt variant="muted">{ENV.apiBaseUrl.replace(/^https?:\/\//, '')}</Txt>
        </View>
      </Card>

      <Card className="mb-4">
        <Button
          label="Privacy policy"
          variant="ghost"
          onPress={() => Linking.openURL(`${ENV.apiBaseUrl}/privacy`)}
        />
        <View className="h-3" />
        <Button
          label="Terms of service"
          variant="ghost"
          onPress={() => Linking.openURL(`${ENV.apiBaseUrl}/terms`)}
        />
      </Card>

      <Button label="Sign out" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
