'use client';

import { motion } from 'framer-motion';
import { Clock, Flame, BookOpen, GraduationCap } from 'lucide-react';

interface DashboardStatsProps {
  practiceTime: {
    used: number;
    total: number;
  };
  streak: number;
  wordsLearned: number;
  wordOfTheDay: {
    word: string;
    definition: string;
    example: string;
  };
}

export function DashboardStats({
  practiceTime,
  streak,
  wordsLearned,
  wordOfTheDay
}: DashboardStatsProps) {
  const progressPercentage = Math.round((practiceTime.used / practiceTime.total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Practice Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Practice Time</h3>
            <p className="text-sm text-gray-500">Today's progress</p>
          </div>
          <Clock className="w-5 h-5 text-blue-500" />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {practiceTime.used} / {practiceTime.total} minutes
            </span>
            <span className="text-sm font-medium text-blue-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Streak</h3>
            <p className="text-sm text-gray-500">Keep it going!</p>
          </div>
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-orange-500">{streak}</span>
            <span className="ml-2 text-gray-600">days</span>
          </div>
        </div>
      </motion.div>

      {/* Words Learned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Words Learned</h3>
            <p className="text-sm text-gray-500">Vocabulary growth</p>
          </div>
          <BookOpen className="w-5 h-5 text-green-500" />
        </div>
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-green-500">{wordsLearned}</span>
            <span className="ml-2 text-gray-600">words</span>
          </div>
        </div>
      </motion.div>

      {/* Word of the Day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Word of the Day</h3>
            <p className="text-sm text-gray-500">Learn something new</p>
          </div>
          <GraduationCap className="w-5 h-5 text-purple-500" />
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-xl font-semibold text-purple-600">{wordOfTheDay.word}</h4>
          <p className="text-sm text-gray-700">{wordOfTheDay.definition}</p>
          <p className="text-sm text-gray-600 italic">"{wordOfTheDay.example}"</p>
        </div>
      </motion.div>
    </div>
  );
} 