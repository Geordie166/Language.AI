'use client';

import { ProgressProvider } from './contexts/ProgressContext';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SpeechProvider } from './contexts/SpeechContext';
import Navigation from './components/Navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ThemeProvider>
        <SpeechProvider>
          <ProgressProvider>
            <Navigation />
            <main className="min-h-screen p-4 md:p-8 pt-20">
              {children}
            </main>
          </ProgressProvider>
        </SpeechProvider>
      </ThemeProvider>
    </UserProvider>
  );
} 