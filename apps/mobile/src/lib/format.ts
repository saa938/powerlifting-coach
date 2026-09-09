import type { Unit } from '@liftly/shared-types';

export function fmtWeight(value: number | null | undefined, unit: Unit): string {
  if (value == null) return '—';
  return `${Math.round(value * 10) / 10} ${unit}`;
}

export function fmtNumber(value: number | null | undefined, digits = 0): string {
  if (value == null) return '—';
  return value.toFixed(digits);
}

export function fmtDate(input: string | number | null | undefined): string {
  if (input == null) return '—';
  const d = typeof input === 'number' ? new Date(input) : new Date(`${input}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function relativeDays(days: number | null | undefined): string {
  if (days == null) return 'never';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}
