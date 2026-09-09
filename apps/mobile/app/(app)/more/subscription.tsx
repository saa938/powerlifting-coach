import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { Screen, Txt, Loading, EmptyState } from '@/components/ui';
import {
  configurePurchases,
  presentCustomerCenter,
  getCustomerInfo,
  planFromCustomerInfo,
} from '@/iap/purchases';

export default function Subscription() {
  const { user } = useAuth();
  const router = useRouter();
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const presented = useRef(false);

  useEffect(() => {
    if (presented.current) return;
    presented.current = true;

    const ok = configurePurchases(user?.id ?? null);
    if (!ok) {
      setNotConfigured(true);
      return;
    }

    (async () => {
      try {
        await presentCustomerCenter();
        // The user may have cancelled/restored inside the Customer Center — resync.
        const info = await getCustomerInfo();
        await api.syncEntitlement({
          plan: planFromCustomerInfo(info),
          rcAppUserId: user?.id ?? '',
        });
        router.back();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not open the Customer Center');
      }
    })();
  }, [user?.id, router]);

  if (notConfigured) {
    return (
      <Screen>
        <EmptyState
          title="Subscription management unavailable"
          subtitle="RevenueCat isn't configured in this build. Set EXPO_PUBLIC_REVENUECAT_* keys and rebuild."
        />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <EmptyState title="Something went wrong" subtitle={error} />
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-iron-900">
      <Loading label="Opening subscription settings…" />
    </View>
  );
}
