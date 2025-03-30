'use client';

import React, { useEffect, useState } from 'react';
import { AchievementService, Achievement } from '@/app/lib/achievement-service';
import { AchievementCard } from '@/app/components/achievements/AchievementCard';
import { motion } from 'framer-motion';
import { Trophy, Users, Target, Flame } from 'lucide-react';

interface AchievementsPageProps {
  userId: string;
}

export default function AchievementsPage({ userId }: AchievementsPageProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Record<string, {
    progress: number;
    total: number;
    isUnlocked: boolean;
  }>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'scenario', label: 'Scenarios', icon: Target },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'skill', label: 'Skills', icon: Target },
    { id: 'social', label: 'Social', icon: Users }
  ];

  useEffect(() => {
    const loadAchievements = async () => {
      const achievementService = AchievementService.getInstance();
      const allAchievements = await achievementService.getUnlockedAchievements(userId);
      setAchievements(allAchievements);

      // Load progress for each achievement
      const progressMap: Record<string, {
        progress: number;
        total: number;
        isUnlocked: boolean;
      }> = {};

      for (const achievement of allAchievements) {
        progressMap[achievement.id] = await achievementService.getAchievementProgress(
          userId,
          achievement.id
        );
      }

      setProgress(progressMap);
    };

    loadAchievements();
  }, [userId]);

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Achievements</h1>

      {/* Category Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementCard
              achievement={achievement}
              progress={progress[achievement.id] || {
                progress: 0,
                total: 0,
                isUnlocked: false
              }}
            />
          </motion.div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No achievements found in this category.</p>
        </div>
      )}
    </div>
  );
} 