import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'muted' | 'label';

const TEXT_VARIANT: Record<Variant, string> = {
  display: 'font-display-bold text-chalk text-3xl',
  title: 'font-display text-chalk text-2xl',
  heading: 'font-display text-chalk text-lg',
  body: 'font-sans text-chalk text-base',
  muted: 'font-sans text-chalk-muted text-sm',
  label: 'font-sans-semibold text-chalk-muted text-xs uppercase tracking-wide',
};

export function Txt({
  variant = 'body',
  className = '',
  children,
  numberOfLines,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} className={`${TEXT_VARIANT[variant]} ${className}`}>
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = true,
  className = '',
  refreshControl,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  refreshControl?: React.ReactElement<any>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.iron900, paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 72,
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          <View className={className}>{children}</View>
        </ScrollView>
      ) : (
        <View className={`flex-1 px-5 ${className}`}>{children}</View>
      )}
    </View>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-2xl bg-iron-800 border border-iron-700 p-4 ${className}`}>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const base = 'rounded-xl py-3.5 px-4 items-center justify-center flex-row';
  const container: Record<string, string> = {
    primary: 'bg-blood active:bg-blood-bright',
    secondary: 'bg-iron-700 active:bg-iron-600',
    ghost: 'bg-transparent border border-iron-600 active:bg-iron-800',
    danger: 'bg-red-signal/15 border border-red-signal',
  };
  const textColor: Record<string, string> = {
    primary: 'text-white',
    secondary: 'text-chalk',
    ghost: 'text-chalk',
    danger: 'text-red-signal',
  };
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isOff}
      className={`${base} ${container[variant]} ${isOff ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.chalk} />
      ) : (
        <Text className={`font-sans-semibold text-base ${textColor[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  className = '',
  ...props
}: TextInputProps & { label?: string; error?: string; className?: string }) {
  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <TextInput
        placeholderTextColor={colors.chalkFaint}
        className="rounded-xl bg-iron-800 border border-iron-700 px-4 py-3 text-chalk font-sans text-base"
        {...props}
      />
      {error ? <Text className="text-red-signal text-xs font-sans">{error}</Text> : null}
    </View>
  );
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blood';
}) {
  const bg: Record<string, string> = {
    neutral: 'bg-iron-700',
    green: 'bg-green-signal/15',
    amber: 'bg-amber-signal/15',
    red: 'bg-red-signal/15',
    blood: 'bg-blood/15',
  };
  const fg: Record<string, string> = {
    neutral: 'text-chalk-muted',
    green: 'text-green-signal',
    amber: 'text-amber-signal',
    red: 'text-red-signal',
    blood: 'text-blood-bright',
  };
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg[tone]}`}>
      <Text className={`text-xs font-sans-semibold ${fg[tone]}`}>{label}</Text>
    </View>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-iron-700 ${className}`} />;
}

export function Loading({ label }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16 gap-3">
      <ActivityIndicator color={colors.blood} size="large" />
      {label ? <Txt variant="muted">{label}</Txt> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const unauthorized = /unauthor/i.test(error.message);
  return (
    <View className="items-center justify-center py-12 gap-3">
      <Txt variant="heading">Something went wrong</Txt>
      <Txt variant="muted" className="text-center">
        {unauthorized ? 'Your session expired. Please sign in again.' : error.message}
      </Txt>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
}) {
  return (
    <View className="items-center justify-center py-12 gap-2">
      <Txt variant="heading">{title}</Txt>
      {subtitle ? (
        <Txt variant="muted" className="text-center">
          {subtitle}
        </Txt>
      ) : null}
      {cta ? <View className="mt-2">{cta}</View> : null}
    </View>
  );
}
