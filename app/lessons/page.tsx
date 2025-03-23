import React from 'react';
import Link from 'next/link';

// In a real app, this would come from a database or API
const lessons = [
  {
    id: 1,
    title: 'Greetings and Introductions',
    description: 'Learn how to introduce yourself and greet others in Spanish.',
    level: 'Beginner',
    duration: '15 min',
    progress: 100
  },
  {
    id: 2,
    title: 'Numbers and Counting',
    description: 'Master the numbers in Spanish from 1 to 100.',
    level: 'Beginner',
    duration: '20 min',
    progress: 65
  },
  {
    id: 3,
    title: 'Common Phrases',
    description: 'Learn everyday phrases to help you navigate conversations.',
    level: 'Beginner',
    duration: '25 min',
    progress: 30
  },
  {
    id: 4,
    title: 'Food and Restaurants',
    description: 'Vocabulary and phrases for ordering food and dining out.',
    level: 'Intermediate',
    duration: '30 min',
    progress: 0
  },
  {
    id: 5,
    title: 'Travel and Directions',
    description: 'How to ask for and understand directions when traveling.',
    level: 'Intermediate',
    duration: '35 min',
    progress: 0
  },
  {
    id: 6,
    title: 'Past Tense Verbs',
    description: 'Learn how to conjugate and use past tense verbs correctly.',
    level: 'Advanced',
    duration: '40 min',
    progress: 0
  }
];

export default function Lessons() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-primary-600 mb-8">Spanish Lessons</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map(lesson => (
          <div key={lesson.id} className="card hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                lesson.level === 'Beginner' 
                  ? 'bg-green-100 text-green-800' 
                  : lesson.level === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {lesson.level}
              </span>
              <span className="text-xs text-gray-500 ml-2">{lesson.duration}</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            
            <div className="mt-auto">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${lesson.progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {lesson.progress === 0 
                    ? 'Not started' 
                    : lesson.progress === 100 
                      ? 'Completed' 
                      : `${lesson.progress}% complete`}
                </span>
                
                <Link 
                  href={`/lessons/${lesson.id}`}
                  className={`text-sm font-medium ${
                    lesson.progress === 100 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-primary-600 hover:text-primary-700'
                  }`}
                >
                  {lesson.progress === 0 
                    ? 'Start' 
                    : lesson.progress === 100 
                      ? 'Review' 
                      : 'Continue'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Coming Soon</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          We're constantly adding new lessons and content. Check back regularly for updates!
        </p>
      </div>
    </div>
  );
} 