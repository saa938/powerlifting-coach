import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { ENV, isSupabaseConfigured } from '@/env';

// AsyncStorage is Supabase's documented RN session store (SecureStore has a ~2KB
// limit that JWT sessions can exceed). PKCE flow is used for the native OAuth
// redirect; detectSessionInUrl is off because there is no browser URL bar.
//
// createClient() throws synchronously if the URL/key are empty, which would
// crash this module on import (missing .env or EAS build env) before the root
// layout ever gets a chance to hide the splash screen — the app just hangs on
// a blank splash forever. Falling back to a placeholder keeps import safe;
// _layout.tsx checks isSupabaseConfigured and shows a real error instead of
// silently using this client.
export const supabase = createClient(
  isSupabaseConfigured ? ENV.supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? ENV.supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);

// Supabase recommends pausing token auto-refresh while the app is backgrounded.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
