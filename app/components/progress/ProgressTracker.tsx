'use client';

import React, { useEffect, useState } from 'react';
import { ProgressService, UserProgress, ScenarioProgress } from '@/app/lib/progress-service';
import { scenarios } from '@/app/lib/scenarios';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Flame } from 'lucide-react';

interface ProgressTrackerProps {
  userId: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [overallStats, setOverallStats] = useState<{
    totalScenarios: number;
    totalPracticeTime: number;
    averageScore: number;
    streak: number;
    lastPracticeDate: Date;
  } | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      const progressService = ProgressService.getInstance();
      const userProgress = await progressService.getUserProgress(userId);
      const stats = await progressService.getOverallStats(userId);
      setProgress(userProgress);
      setOverallStats(stats);
    };

    loadProgress();
  }, [userId]);

  if (!progress || !overallStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Scenarios</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{overallStats.totalScenarios}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Practice Time</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatTime(overallStats.totalPracticeTime)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Avg Score</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{Math.round(overallStats.averageScore)}%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{overallStats.streak} days</div>
        </motion.div>
      </div>

      {/* Scenario Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Scenario Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(progress.scenarios).map(([scenarioId, attempts]) => {
            const scenario = scenarios[scenarioId];
            const latestAttempt = attempts[attempts.length - 1];
            const averageScore = attempts.reduce((acc, p) => acc + p.score, 0) / attempts.length;

            return (
              <motion.div
                key={scenarioId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div>
                    <h4 className="font-medium">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground">{scenario.difficulty}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attempts:</span>
                    <span className="font-medium">{attempts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best Score:</span>
                    <span className="font-medium">{Math.round(Math.max(...attempts.map(p => p.score)))}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Score:</span>
                    <span className="font-medium">{Math.round(averageScore)}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${averageScore}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 