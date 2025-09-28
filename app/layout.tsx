import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '@/components/providers/session-provider';
import { TranslationProvider } from '@/lib/hooks/use-translation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Todu - Minimal Todo & Timeline App',
  description:
    'A minimal, beautiful todo and timeline app to organize your tasks and track your progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
