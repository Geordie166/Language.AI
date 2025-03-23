import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language AI - English-Spanish Learning with AI Conversation',
  description: 'Learn Spanish through interactive lessons and AI-powered conversations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen p-4 md:p-8 pt-20">
          {children}
        </main>
      </body>
    </html>
  );
} 