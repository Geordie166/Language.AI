'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart2, PieChart, Activity } from 'lucide-react';
import { AnalyticsService } from '@/app/lib/analytics-service';

interface ProgressTrendProps {
  metric: 'pronunciation' | 'grammar' | 'vocabulary';
  trend: {
    improvement: number;
    trend: 'up' | 'down' | 'stable';
    recentScore: number;
    previousScore: number;
  };
}

function ProgressTrendCard({ metric, trend }: ProgressTrendProps) {
  const getTrendIcon = () => {
    switch (trend.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 capitalize">{metric}</h3>
          <p className="text-sm text-gray-500">Progress trend</p>
        </div>
        {getTrendIcon()}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">
            {trend.recentScore.toFixed(1)}%
          </span>
          <span className={`text-sm font-medium ${
            trend.trend === 'up' ? 'text-green-600' :
            trend.trend === 'down' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {trend.improvement > 0 ? '+' : ''}{trend.improvement.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Previous: {trend.previousScore.toFixed(1)}%
        </p>
      </div>
    </motion.div>
  );
}

export function ProgressAnalytics() {
  const [weeklyProgress, setWeeklyProgress] = useState<any>(null);
  const [trends, setTrends] = useState<Record<string, any>>({});
  const [scenarios, setScenarios] = useState<{ type: string; count: number }[]>([]);
  const [difficulties, setDifficulties] = useState<Record<string, number>>({});
  const analyticsService = new AnalyticsService();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [weeklyData, pronunciationTrend, grammarTrend, vocabularyTrend, scenarioData, difficultyData] = await Promise.all([
          analyticsService.getWeeklyProgress(),
          analyticsService.getProgressTrend('pronunciation'),
          analyticsService.getProgressTrend('grammar'),
          analyticsService.getProgressTrend('vocabulary'),
          analyticsService.getMostPracticedScenarios(),
          analyticsService.getDifficultyDistribution()
        ]);

        setWeeklyProgress(weeklyData);
        setTrends({
          pronunciation: pronunciationTrend,
          grammar: grammarTrend,
          vocabulary: vocabularyTrend
        });
        setScenarios(scenarioData);
        setDifficulties(difficultyData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
        
        {/* Progress Trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(trends).map(([metric, trend]) => (
            <ProgressTrendCard
              key={metric}
              metric={metric as 'pronunciation' | 'grammar' | 'vocabulary'}
              trend={trend}
            />
          ))}
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-500">Practice time and scores</p>
            </div>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          {weeklyProgress && (
            <div className="space-y-4">
              {/* Here you would render a chart using your preferred charting library */}
              <div className="h-64 bg-gray-50 rounded-lg">
                {/* Placeholder for chart */}
                <p className="text-center pt-8 text-gray-500">
                  Weekly progress chart will be displayed here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Practice Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scenario Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Most Practiced</h3>
                <p className="text-sm text-gray-500">Scenario distribution</p>
              </div>
              <BarChart2 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-2">
              {scenarios.map(({ type, count }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                  <span className="text-sm font-medium">{count} sessions</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Difficulty Levels</h3>
                <p className="text-sm text-gray-500">Practice distribution</p>
              </div>
              <PieChart className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="space-y-2">
              {Object.entries(difficulties).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{level}</span>
                  <span className="text-sm font-medium">{count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 