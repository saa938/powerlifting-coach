import type { Metadata } from 'next';

// The pricing page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Liftly pricing: start free, go Pro for $12/month, or run your coaching roster at $20 per active client. Adaptive programming and AI form checks for a fraction of a human coach.',
  openGraph: {
    title: 'Liftly Pricing — Cheaper Than a Coach',
    description:
      'Start free. Pro at $12/month. Coach roster at $20 per active client. Adaptive programming, form checks, and nutrition for a fraction of a $100/mo human coach.',
    url: 'https://liftly.tech/pricing',
  },
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
