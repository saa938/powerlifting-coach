// Public runtime config. Expo inlines EXPO_PUBLIC_* at build time. These values
// are shipped in the app bundle and are NOT secret (the Supabase anon key is
// public; RLS protects data). Server-only secrets never appear here.

function optional(value: string | undefined): string {
  return value ?? '';
}

export const ENV = {
  supabaseUrl: optional(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: optional(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  apiBaseUrl: optional(process.env.EXPO_PUBLIC_API_BASE_URL || 'https://liftly.tech').replace(/\/$/, ''),
  revenueCatAndroidKey: optional(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY),
  revenueCatIosKey: optional(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY),
};

export const isSupabaseConfigured = Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);
