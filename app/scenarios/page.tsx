'use client';

import React from 'react';
import Link from 'next/link';

const scenarios = [
  {
    id: 'daily-life',
    title: 'Daily Life',
    description: 'Practice everyday English conversations like greetings, small talk, and casual discussions.',
    level: 'beginner',
    situations: ['Meeting new people', 'Weather talk', 'Weekend plans', 'Shopping conversations']
  },
  {
    id: 'work-life',
    title: 'Work & Career',
    description: 'Essential English for workplace communication and professional development.',
    level: 'intermediate',
    situations: ['Job interviews', 'Office small talk', 'Email writing', 'Meeting participation']
  },
  {
    id: 'academic',
    title: 'Academic English',
    description: 'Practice English for academic settings, presentations, and discussions.',
    level: 'advanced',
    situations: ['Class discussions', 'Academic presentations', 'Group projects', 'Research discussions']
  },
  {
    id: 'social',
    title: 'Social Situations',
    description: 'Handle social gatherings and casual conversations with confidence.',
    level: 'beginner',
    situations: ['Making friends', 'Party conversations', 'Cultural events', 'Social media chat']
  },
  {
    id: 'travel',
    title: 'Travel & Tourism',
    description: 'Essential English for traveling, navigation, and tourist situations.',
    level: 'intermediate',
    situations: ['Airport navigation', 'Hotel check-in', 'Tourist attractions', 'Public transport']
  },
  {
    id: 'business',
    title: 'Business English',
    description: 'Professional English for meetings, presentations, and networking.',
    level: 'advanced',
    situations: ['Business meetings', 'Negotiations', 'Client communication', 'Professional networking']
  }
];

export default function ScenariosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">English Conversation Practice</h1>
        <p className="text-xl text-gray-600">
          Choose a scenario to practice real-world English conversations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/conversation?scenario=${scenario.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {scenario.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  scenario.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  scenario.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {scenario.level}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {scenario.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Practice Situations:
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm">
                  {scenario.situations.map((situation, index) => (
                    <li key={index}>{situation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 