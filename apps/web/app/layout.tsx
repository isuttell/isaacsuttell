import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import { ConvexClientProvider } from './convex-client-provider';
import { Analytics } from '@vercel/analytics/next';
import { UserMenu } from './components/user-menu';
import { BASE_URL } from './lib/config';
import { safeJsonLd } from './lib/format';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Isaac Suttell',
  description: 'Personal website of Isaac Suttell',
  authors: [{ name: 'Isaac Suttell', url: BASE_URL }],
  creator: 'Isaac Suttell',
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Isaac Suttell RSS Feed' }],
    },
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Isaac Suttell',
  url: BASE_URL,
  author: {
    '@type': 'Person',
    name: 'Isaac Suttell',
    url: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="dark">
        <body className={`${jakarta.variable} ${jetbrains.variable} antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
          />
          <ConvexClientProvider>
            <UserMenu />
            {children}
          </ConvexClientProvider>
          <Analytics />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
