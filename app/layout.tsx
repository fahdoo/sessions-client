import './globals.css';
import { Assistant } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navigation } from '@/components/layout/navigation';

const assistantFont = Assistant({ subsets: ['latin'], weight: ['200', '400', '600', '700'] });

export const metadata = {
  title: 'Sessions App',
  description: 'Record and manage your podcast sessions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${assistantFont.className} bg-slate-100 dark:bg-slate-900`}>
          <Navigation />
          <main className="pt-16 pb-4">
            <div className="md:max-w-2xl md:mx-auto">
              {children}
            </div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
