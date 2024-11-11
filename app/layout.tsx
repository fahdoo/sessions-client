import './globals.css';
import { Assistant } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navigation } from '@/components/layout/navigation';
import { MediaSessionProvider } from '@/components/session/audio/MediaSessionContext';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "@/components/ui/toaster";

const assistantFont = Assistant({ subsets: ['latin'], weight: ['200', '400', '600', '700'] });

export const metadata = {
  title: 'Sessional',
  description: 'Share your story',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className="dark">
        <body className={`${assistantFont.className} bg-slate-100 dark:bg-slate-900`}>
          <MediaSessionProvider>
            <Navigation />
            <main className="p-4 pt-20 ">
              <div className="md:max-w-3xl md:mx-auto">
                {children}
                {process.env.NODE_ENV === 'production' && <Analytics />}
              </div>
            </main>
            <Toaster />
          </MediaSessionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
