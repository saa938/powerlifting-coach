import { createApiClient, type ApiClient } from '@liftly/api-client';
import { supabase } from '@/lib/supabase';
import { ENV } from '@/env';

// Registered by the root layout so a 401 can drop the session and route to login
// from anywhere, without the api-client importing React/navigation.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

export const api: ApiClient = createApiClient({
  baseUrl: ENV.apiBaseUrl,
  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
  onUnauthorized: () => {
    unauthorizedHandler?.();
  },
});
