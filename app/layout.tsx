import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import SessionWrapper from '@/components/layout/SessionWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Presentify ERP — Academic Portal',
  description:
    'A modern Academic ERP portal for Students and Teachers. Manage fees, attendance, results, grievances, and classroom resources — all in one place.',
  keywords: [
    'academic ERP',
    'student portal',
    'teacher portal',
    'attendance management',
    'fee management',
    'hall ticket',
    'result card',
  ],
  authors: [{ name: 'Presentify Academic Systems' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <SessionWrapper>
          <AppProvider>{children}</AppProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
