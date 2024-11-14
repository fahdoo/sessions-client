import './globals.css';
import { Assistant } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navigation } from '@/components/layout/navigation';
import { MediaSessionProvider } from '@/components/session/audio/MediaSessionContext';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next"

const assistantFont = Assistant({ subsets: ['latin'], weight: ['200', '400', '600', '700'] });

export const metadata = {
  metadataBase: new URL('https://sessional.ai'),
  title: 'Sessional AI',
  description: 'Share your life story with an AI guide',
  openGraph: {
    title: 'Sessional AI',
    description: 'Share your life story with an AI guide',
    url: 'https://sessional.ai',
    siteName: 'Sessional AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sessional AI',
    description: 'Share your life story with an AI guide',
    images: ['/og-image.png'],
  },
  icons: {
    // icon: 'favicon.ico',
    // shortcut: 'favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="dark">
        <body className={`${assistantFont.className} bg-slate-100 dark:bg-slate-900 overflow-y-auto`}>
          <MediaSessionProvider>
            <Navigation />
            <main className="p-4 pt-20 relative min-h-screen">
              <div className="md:mx-auto">
                {children}
                {process.env.NODE_ENV === 'production' && (
                  <>
                    <Analytics />
                    <SpeedInsights />
                  </>
                )}
              </div>
            </main>
            <Toaster />
          </MediaSessionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
