// Raw color tokens for contexts that can't use Tailwind classes (charts,
// gradients, StatusBar, native props). Mirrors tailwind.config.js.
export const colors = {
  iron900: '#0A0A0B',
  iron800: '#131316',
  iron700: '#1C1C21',
  iron600: '#26262D',
  iron500: '#3A3A44',
  chalk: '#F5F6F8',
  chalkMuted: '#A1A1AA',
  chalkFaint: '#6B6B73',
  blood: '#2F6BFF',
  bloodBright: '#4C86FF',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
} as const;

export const readinessColor = (flag: 'green' | 'amber' | 'red'): string =>
  flag === 'green' ? colors.green : flag === 'amber' ? colors.amber : colors.red;
