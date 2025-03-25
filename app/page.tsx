'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="text-center py-10 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-600 mb-4">
          Master English with Language AI!
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
          Practice real-world English conversations with our AI language partner. Perfect for non-native speakers!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/scenarios"
            className="btn-primary text-lg px-8 py-3"
          >
            Practice Scenarios
          </Link>
          <Link 
            href="/conversation"
            className="btn-secondary text-lg px-8 py-3"
          >
            Free Conversation
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Speak Naturally</h3>
              <p className="text-gray-600">Practice speaking English naturally with our AI conversation partner.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-world Scenarios</h3>
              <p className="text-gray-600">Practice common situations like job interviews, daily conversations, and more.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
              <p className="text-gray-600">Get real-time feedback on your pronunciation, grammar, and fluency.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center py-10 md:py-20">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Speaking?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join our community of English learners and start improving your conversation skills today.
        </p>
        <Link 
          href="/conversation"
          className="btn-primary text-lg px-8 py-3"
        >
          Start Practicing Now
        </Link>
      </section>
    </main>
  );
} 