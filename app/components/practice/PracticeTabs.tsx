'use client';

import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'roleplay', label: 'Roleplay' },
  { id: 'social', label: 'Social' },
  { id: 'niche', label: 'Niche' },
];

export function PracticeTabs({ activeTab, onTabChange }: { 
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-8 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 