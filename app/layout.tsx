import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/user-context';
import { SpeechProvider } from './context/speech-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language Learning Assistant',
  description: 'Practice conversations with an AI language tutor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <SpeechProvider>
            {children}
          </SpeechProvider>
        </UserProvider>
      </body>
    </html>
  );
} 