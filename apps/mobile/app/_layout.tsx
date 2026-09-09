import '../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAppFonts } from '@/theme/useAppFonts';
import { setUnauthorizedHandler } from '@/api/client';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import { isSupabaseConfigured } from '@/env';
import { ErrorState } from '@/components/ui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    // Any 401 from the API drops the session; the index route then sends to login.
    setUnauthorizedHandler(() => {
      void supabase.auth.signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  // Without real Supabase env vars, the app has nothing to authenticate
  // against. Surface that clearly instead of rendering a login screen that
  // would just hang or fail confusingly against a placeholder project.
  if (!isSupabaseConfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.iron900 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: colors.iron900, justifyContent: 'center' }}>
            <ErrorState
              error={
                new Error(
                  'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to apps/mobile/.env (or the EAS build profile env) and rebuild.',
                )
              }
            />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.iron900 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: colors.iron900 }}>
            <Slot />
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
