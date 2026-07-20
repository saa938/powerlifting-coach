import { useState } from 'react';
import { View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen, Txt, Field, Button } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';

export default function Signup() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSignUp() {
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUpWithEmail(email, password);
      if (needsConfirmation) {
        setNotice('Check your email to confirm your account, then sign in.');
      } else {
        router.replace('/(app)/today');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mt-16 mb-10 items-center gap-2">
        <Txt variant="display">Create account</Txt>
        <Txt variant="muted">Start training with Liftly</Txt>
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        {error ? (
          <Txt variant="muted" className="text-red-signal">
            {error}
          </Txt>
        ) : null}
        {notice ? (
          <Txt variant="muted" className="text-green-signal">
            {notice}
          </Txt>
        ) : null}
        <Button label="Create account" onPress={onSignUp} loading={loading} />
      </View>

      <View className="flex-row justify-center gap-1 mt-8">
        <Txt variant="muted">Already have an account?</Txt>
        <Link href="/(auth)/login">
          <Txt variant="muted" className="text-blood-bright">
            Sign in
          </Txt>
        </Link>
      </View>
    </Screen>
  );
}
