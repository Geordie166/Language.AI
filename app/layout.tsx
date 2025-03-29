import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from './contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Language AI - Master Spanish Conversation',
  description: 'Practice Spanish conversation with AI language partners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
} 