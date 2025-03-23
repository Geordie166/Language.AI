import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="container mx-auto">
      <section className="text-center py-10 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-600 mb-4">
          Learn Spanish with Language AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
          Master Spanish through interactive lessons and AI-powered conversations
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/lessons" className="btn-primary text-lg px-6 py-3">
            Start Learning
          </Link>
          <Link href="/conversation" className="btn-secondary text-lg px-6 py-3">
            Try AI Conversation
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Lessons</h3>
            <p className="text-gray-600">
              Learn Spanish through bite-sized, engaging lessons designed to build your vocabulary and grammar skills.
            </p>
          </div>

          <div className="card text-center">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Practice Exercises</h3>
            <p className="text-gray-600">
              Reinforce what you've learned through varied exercises that test your comprehension and recall.
            </p>
          </div>

          <div className="card text-center">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Conversation</h3>
            <p className="text-gray-600">
              Practice speaking with our AI conversation partner that listens, responds, and helps improve your pronunciation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Ready to Get Started?</h2>
        <p className="text-xl text-center max-w-2xl mx-auto mb-8">
          Join thousands of learners who are mastering Spanish with Language AI's innovative approach.
        </p>
        <div className="text-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
} 