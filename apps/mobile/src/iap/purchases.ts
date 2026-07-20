import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { ENV } from '@/env';

let configured = false;

/** Returns false when no RevenueCat key is set (so the UI can explain it). */
export function configurePurchases(appUserId?: string | null): boolean {
  if (configured) return true;
  const apiKey = Platform.OS === 'ios' ? ENV.revenueCatIosKey : ENV.revenueCatAndroidKey;
  if (!apiKey) return false;
  Purchases.configure({ apiKey, appUserID: appUserId ?? null });
  configured = true;
  return true;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchase(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restore(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Reads the current entitlement state without prompting a purchase. */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/**
 * Presents RevenueCat's hosted Paywall (designed in the dashboard) and returns
 * the outcome plus the resulting CustomerInfo when a purchase/restore succeeds.
 * The UI is fully native — no custom paywall markup needed.
 */
export async function presentPaywall(): Promise<{
  result: PAYWALL_RESULT;
  customerInfo: CustomerInfo | null;
}> {
  const result = await RevenueCatUI.presentPaywall();
  const purchased =
    result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  return {
    result,
    customerInfo: purchased ? await Purchases.getCustomerInfo() : null,
  };
}

/**
 * Presents the Paywall only if the user lacks the required entitlement.
 * Returns true if they now have it (already-entitled or just purchased).
 */
export async function presentPaywallIfNeeded(
  entitlement = 'pro',
): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: entitlement,
  });
  return (
    result === PAYWALL_RESULT.PURCHASED ||
    result === PAYWALL_RESULT.RESTORED ||
    result === PAYWALL_RESULT.NOT_PRESENTED // already entitled
  );
}

/** Presents the Customer Center (manage / cancel / restore / refund flows). */
export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}

export { PAYWALL_RESULT };

/** Maps RevenueCat entitlements to Liftly's plan tiers. */
export function planFromCustomerInfo(info: CustomerInfo): 'free' | 'pro' | 'coach' {
  const active = info.entitlements.active;
  if (active['coach']) return 'coach';
  if (active['pro']) return 'pro';
  return 'free';
}
