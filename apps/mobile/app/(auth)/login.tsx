import { useState } from 'react';
import { View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen, Txt, Field, Button, Divider } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';

export default function Login() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(app)/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(app)/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mt-16 mb-10 items-center gap-2">
        <Txt variant="display">Liftly</Txt>
        <Txt variant="muted">Your AI powerlifting coach</Txt>
      </View>

      <View className="gap-4">
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error ? (
          <Txt variant="muted" className="text-red-signal">
            {error}
          </Txt>
        ) : null}
        <Button label="Sign in" onPress={onSignIn} loading={loading} />

        <View className="flex-row items-center gap-3 my-1">
          <Divider className="flex-1" />
          <Txt variant="muted">or</Txt>
          <Divider className="flex-1" />
        </View>

        <Button
          label="Continue with Google"
          variant="ghost"
          onPress={onGoogle}
          loading={googleLoading}
        />
      </View>

      <View className="flex-row justify-center gap-1 mt-8">
        <Txt variant="muted">New here?</Txt>
        <Link href="/(auth)/signup">
          <Txt variant="muted" className="text-blood-bright">
            Create an account
          </Txt>
        </Link>
      </View>
    </Screen>
  );
}
