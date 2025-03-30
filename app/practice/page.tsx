'use client';

import { useState } from 'react';
import { TopBar } from '../components/practice/TopBar';
import { PracticeTabs } from '../components/practice/PracticeTabs';
import { ScenarioCard } from '../components/practice/ScenarioCard';
import { RecommendedSection } from '../components/practice/RecommendedSection';
import { BottomNav } from '../components/practice/BottomNav';

const scenarios = {
  roleplay: [
    {
      title: 'Job Interview',
      description: 'Practice common interview questions and professional responses',
      icon: '💼',
      type: 'roleplay' as const,
      estimatedTime: 5,
    },
    {
      title: 'Restaurant Order',
      description: 'Order food and interact with restaurant staff',
      icon: '🍽️',
      type: 'roleplay' as const,
      estimatedTime: 3,
    },
  ],
  social: [
    {
      title: 'Making Friends',
      description: 'Start conversations and build relationships',
      icon: '👋',
      type: 'social' as const,
      estimatedTime: 4,
    },
    {
      title: 'Party Small Talk',
      description: 'Navigate casual social conversations',
      icon: '🎉',
      type: 'social' as const,
      estimatedTime: 3,
    },
  ],
  niche: [
    {
      title: 'Tech Presentation',
      description: 'Present technical concepts to colleagues',
      icon: '💻',
      type: 'niche' as const,
      estimatedTime: 6,
    },
    {
      title: 'Medical Consultation',
      description: 'Discuss health concerns with healthcare providers',
      icon: '🏥',
      type: 'niche' as const,
      estimatedTime: 5,
    },
  ],
};

const recommendation = {
  title: 'Hotel Check-In',
  description: 'Practice checking into a hotel and handling common requests',
  type: 'roleplay' as const,
  icon: '🏨',
  estimatedTime: 3,
};

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState('roleplay');

  const handleStart = (scenario: any) => {
    // Handle starting a practice session
    console.log('Starting scenario:', scenario);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar />
      
      <main className="max-w-4xl mx-auto px-4 pb-24">
        <div className="py-6">
          <PracticeTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <RecommendedSection
          recommendation={recommendation}
          onStart={() => handleStart(recommendation)}
        />

        <div className="space-y-4">
          {scenarios[activeTab as keyof typeof scenarios].map((scenario) => (
            <ScenarioCard
              key={scenario.title}
              {...scenario}
              onStart={() => handleStart(scenario)}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
} 