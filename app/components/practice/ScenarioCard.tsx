'use client';

import { Button } from '../ui/button';
import { Mic } from 'lucide-react';

interface ScenarioCardProps {
  title: string;
  description: string;
  type: 'roleplay' | 'social' | 'niche';
  icon: string;
  estimatedTime?: number;
  onStart: () => void;
  selected?: boolean;
}

const typeStyles = {
  roleplay: {
    bg: 'bg-white',
    border: 'border-blue-100',
    label: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  social: {
    bg: 'bg-white',
    border: 'border-green-100',
    label: 'text-green-600',
    iconBg: 'bg-green-50',
  },
  niche: {
    bg: 'bg-white',
    border: 'border-purple-100',
    label: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
};

export function ScenarioCard({
  title,
  description,
  type,
  icon,
  estimatedTime,
  onStart,
  selected = false,
}: ScenarioCardProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={`relative rounded-lg border p-4 transition-all duration-200 cursor-pointer hover:border-blue-200 ${
        styles.bg
      } ${selected ? 'border-blue-400 shadow-sm' : 'border-gray-100'}`}
      onClick={onStart}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${styles.iconBg}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {estimatedTime && (
              <span className="text-xs text-gray-500">~{estimatedTime} mins</span>
            )}
          </div>
          <span className={`text-sm ${styles.label} mt-1 block`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
} 