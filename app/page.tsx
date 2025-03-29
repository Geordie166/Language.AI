'use client';

import Link from 'next/link';
import WaitlistForm from './components/WaitlistForm';
import Conversation from './components/Conversation';
import OpenAITest from './components/OpenAITest';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          Language Learning Assistant
        </h1>
        <OpenAITest />
        <div className="h-8" /> {/* Spacer */}
        <Conversation />
      </div>
    </main>
  );
} 