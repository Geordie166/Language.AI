import { Scenario } from './scenarios';

export interface ScenarioProgress {
  scenarioId: string;
  completedAt: Date;
  duration: number; // in seconds
  score: number; // 0-100
  feedback: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };
  objectivesCompleted: string[];
}

export interface UserProgress {
  userId: string;
  scenarios: Record<string, ScenarioProgress[]>;
  totalPracticeTime: number;
  streak: number;
  lastPracticeDate: Date;
}

export class ProgressService {
  private static instance: ProgressService;
  private progress: Record<string, UserProgress> = {};

  private constructor() {}

  static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  async saveScenarioProgress(userId: string, progress: ScenarioProgress): Promise<void> {
    if (!this.progress[userId]) {
      this.progress[userId] = {
        userId,
        scenarios: {},
        totalPracticeTime: 0,
        streak: 0,
        lastPracticeDate: new Date()
      };
    }

    const userProgress = this.progress[userId];
    
    // Initialize scenario array if it doesn't exist
    if (!userProgress.scenarios[progress.scenarioId]) {
      userProgress.scenarios[progress.scenarioId] = [];
    }

    // Add new progress
    userProgress.scenarios[progress.scenarioId].push(progress);

    // Update total practice time
    userProgress.totalPracticeTime += progress.duration;

    // Update streak
    const today = new Date();
    const lastPractice = new Date(userProgress.lastPracticeDate);
    const daysSinceLastPractice = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastPractice === 1) {
      userProgress.streak++;
    } else if (daysSinceLastPractice > 1) {
      userProgress.streak = 1;
    }

    userProgress.lastPracticeDate = today;

    // In a real implementation, this would save to a database
    // For now, we'll just keep it in memory
    console.log('Progress saved:', userProgress);
  }

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    return this.progress[userId] || null;
  }

  async getScenarioProgress(userId: string, scenarioId: string): Promise<ScenarioProgress[]> {
    return this.progress[userId]?.scenarios[scenarioId] || [];
  }

  async getCompletedScenarios(userId: string): Promise<string[]> {
    const userProgress = this.progress[userId];
    if (!userProgress) return [];
    return Object.keys(userProgress.scenarios);
  }

  async getScenarioStats(userId: string, scenarioId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    totalTime: number;
  } | null> {
    const progress = await this.getScenarioProgress(userId, scenarioId);
    if (!progress.length) return null;

    return {
      totalAttempts: progress.length,
      averageScore: progress.reduce((acc, p) => acc + p.score, 0) / progress.length,
      bestScore: Math.max(...progress.map(p => p.score)),
      totalTime: progress.reduce((acc, p) => acc + p.duration, 0)
    };
  }

  async getOverallStats(userId: string): Promise<{
    totalScenarios: number;
    totalPracticeTime: number;
    averageScore: number;
    streak: number;
    lastPracticeDate: Date;
  } | null> {
    const userProgress = this.progress[userId];
    if (!userProgress) return null;

    const allProgress = Object.values(userProgress.scenarios).flat();
    const totalScores = allProgress.reduce((acc, p) => acc + p.score, 0);

    return {
      totalScenarios: Object.keys(userProgress.scenarios).length,
      totalPracticeTime: userProgress.totalPracticeTime,
      averageScore: allProgress.length ? totalScores / allProgress.length : 0,
      streak: userProgress.streak,
      lastPracticeDate: userProgress.lastPracticeDate
    };
  }
} 