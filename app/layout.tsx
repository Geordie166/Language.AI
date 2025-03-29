import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/user-context';
import { SpeechProvider } from './context/speech-context';
import { ThemeProvider } from './context/theme-context';

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
          <ThemeProvider>
            <SpeechProvider>
              {children}
            </SpeechProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
} 