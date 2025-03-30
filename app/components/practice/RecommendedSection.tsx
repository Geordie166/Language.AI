'use client';

import { ScenarioCard } from './ScenarioCard';

interface RecommendedSectionProps {
  recommendation: {
    title: string;
    description: string;
    type: 'roleplay' | 'social' | 'niche';
    icon: string;
    estimatedTime?: number;
  };
  onStart: () => void;
}

export function RecommendedSection({ recommendation, onStart }: RecommendedSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xl">✨</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h2>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        <ScenarioCard
          title={recommendation.title}
          description={recommendation.description}
          type={recommendation.type}
          icon={recommendation.icon}
          estimatedTime={recommendation.estimatedTime}
          onStart={onStart}
        />
      </div>
    </div>
  );
} 