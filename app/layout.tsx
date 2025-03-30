import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/user-context';
import { AzureSpeechProvider } from './context/azure-speech-context';
import { ThemeProvider } from './context/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language Learning Assistant',
  description: 'Practice conversations with an AI language tutor',
};

const azureSpeechConfig = {
  region: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || '',
  subscriptionKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
  language: 'en-US',
  settings: {
    silenceDurationMs: 280,
    autoDetectLanguage: false,
  },
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
            <AzureSpeechProvider config={azureSpeechConfig}>
              {children}
            </AzureSpeechProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
} 