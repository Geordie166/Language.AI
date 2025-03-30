'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '@/app/lib/achievement-service';
import { Progress } from '@/app/components/ui/progress';

interface AchievementCardProps {
  achievement: Achievement;
  progress: {
    progress: number;
    total: number;
    isUnlocked: boolean;
  };
  onUnlock?: (achievement: Achievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  onUnlock
}) => {
  const progressPercentage = (progress.progress / progress.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-card rounded-lg p-4 shadow-sm ${
        progress.isUnlocked ? 'border-2 border-primary' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          
          {!progress.isUnlocked && (
            <div className="mt-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{progress.progress}</span>
                <span>{progress.total}</span>
              </div>
            </div>
          )}

          {progress.isUnlocked && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-primary">
              <span>+{achievement.reward.xp} XP</span>
              <span>{achievement.reward.badge}</span>
            </div>
          )}
        </div>
      </div>

      {progress.isUnlocked && achievement.unlockedAt && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}; 