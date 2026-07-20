import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { Screen, Txt, Loading, EmptyState } from '@/components/ui';
import {
  configurePurchases,
  presentPaywall,
  planFromCustomerInfo,
  PAYWALL_RESULT,
} from '@/iap/purchases';

export default function Upgrade() {
  const { user } = useAuth();
  const router = useRouter();
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const presented = useRef(false);

  useEffect(() => {
    // Guard against the effect running twice (React strict mode / re-mounts).
    if (presented.current) return;
    presented.current = true;

    const ok = configurePurchases(user?.id ?? null);
    if (!ok) {
      setNotConfigured(true);
      return;
    }

    (async () => {
      try {
        const { result, customerInfo } = await presentPaywall();
        if (
          (result === PAYWALL_RESULT.PURCHASED ||
            result === PAYWALL_RESULT.RESTORED) &&
          customerInfo
        ) {
          const plan = planFromCustomerInfo(customerInfo);
          await api.syncEntitlement({ plan, rcAppUserId: user?.id ?? '' });
        }
        // CANCELLED / ERROR / NOT_PRESENTED all just return to the previous screen.
        router.back();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not open the paywall');
      }
    })();
  }, [user?.id, router]);

  if (notConfigured) {
    return (
      <Screen>
        <EmptyState
          title="In-app purchases unavailable"
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
      <Loading label="Opening Liftly Pro…" />
    </View>
  );
}
