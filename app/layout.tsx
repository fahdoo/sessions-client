import './globals.css';
import { Rubik } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navigation } from '@/components/layout/navigation';

const rubik = Rubik({ subsets: ['latin'] });

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
        <body className={`${rubik.className}`}>
          <Navigation />
          <main className="container mx-auto py-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
