import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { clerkConfigured } from '@/lib/clerk-config';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = 'https://liftly.tech';
const DESCRIPTION =
  'AI-powered block periodization, form check, and nutrition for serious powerlifters. Program auto-adjusts every session. Free to start.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Liftly · AI Powerlifting Coach',
    template: '%s · Liftly',
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Liftly',
    title: 'Liftly · AI Powerlifting Coach',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  // Card type only: a root-level twitter title/description would shallow-merge
  // over every child page's metadata, giving blog posts the generic site card.
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // No root-level canonical: it would be inherited verbatim by every page that
  // doesn't set its own, pointing them all at the homepage. Pages declare theirs.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = (
    <>
      {children}
      <Analytics />
    </>
  );

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}>
      {/* ClerkProvider belongs inside <body>, not wrapping <html>.

          It is mounted only when Clerk is actually configured. ClerkProvider
          does not degrade on a missing or malformed publishableKey — it throws,
          during prerender, which fails `next build` for every static public
          page (the landing page, /pricing, /privacy, the whole blog) and not
          just the auth ones. Skipping it is what lets the site build and serve
          in an env without keys, matching what middleware and getSession()
          already do. The auth surfaces render their own notice; nothing else
          on those pages calls a Clerk hook. */}
      <body className="font-body antialiased">
        {clerkConfigured() ? (
          <ClerkProvider appearance={clerkAppearance}>{tree}</ClerkProvider>
        ) : (
          tree
        )}
      </body>
    </html>
  );
}
