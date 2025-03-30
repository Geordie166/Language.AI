interface SessionStats {
  date: string;
  duration: number;
  wordsSpoken: number;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  scenarioType: string;
  difficulty: string;
}

interface WeeklyProgress {
  dates: string[];
  durations: number[];
  averageScores: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };
}

interface ProgressTrend {
  improvement: number;
  trend: 'up' | 'down' | 'stable';
  recentScore: number;
  previousScore: number;
}

export class AnalyticsService {
  private readonly STORAGE_KEY = 'myvoicecoach_analytics';

  async saveSessionStats(stats: SessionStats): Promise<void> {
    const savedStats = await this.getAllStats();
    savedStats.push(stats);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedStats));
  }

  async getAllStats(): Promise<SessionStats[]> {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    const stats = await this.getAllStats();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    const weeklyStats = last7Days.map(date => {
      const dayStats = stats.filter(s => s.date === date);
      return {
        duration: dayStats.reduce((sum, s) => sum + s.duration, 0),
        pronunciation: dayStats.reduce((sum, s) => sum + s.pronunciationScore, 0) / (dayStats.length || 1),
        grammar: dayStats.reduce((sum, s) => sum + s.grammarScore, 0) / (dayStats.length || 1),
        vocabulary: dayStats.reduce((sum, s) => sum + s.vocabularyScore, 0) / (dayStats.length || 1),
      };
    });

    return {
      dates: last7Days,
      durations: weeklyStats.map(s => s.duration),
      averageScores: {
        pronunciation: weeklyStats.reduce((sum, s) => sum + s.pronunciation, 0) / 7,
        grammar: weeklyStats.reduce((sum, s) => sum + s.grammar, 0) / 7,
        vocabulary: weeklyStats.reduce((sum, s) => sum + s.vocabulary, 0) / 7,
      }
    };
  }

  async getProgressTrend(metric: 'pronunciation' | 'grammar' | 'vocabulary'): Promise<ProgressTrend> {
    const stats = await this.getAllStats();
    if (stats.length < 2) {
      return {
        improvement: 0,
        trend: 'stable',
        recentScore: stats[0]?.[`${metric}Score`] || 0,
        previousScore: 0
      };
    }

    const recent = stats.slice(-5);
    const previous = stats.slice(-10, -5);

    const recentAvg = recent.reduce((sum, s) => sum + s[`${metric}Score`], 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + s[`${metric}Score`], 0) / previous.length;

    const improvement = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      improvement,
      trend: improvement > 1 ? 'up' : improvement < -1 ? 'down' : 'stable',
      recentScore: recentAvg,
      previousScore: previousAvg
    };
  }

  async getMostPracticedScenarios(): Promise<{ type: string; count: number }[]> {
    const stats = await this.getAllStats();
    const scenarioCounts = stats.reduce((acc, stat) => {
      acc[stat.scenarioType] = (acc[stat.scenarioType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(scenarioCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getDifficultyDistribution(): Promise<Record<string, number>> {
    const stats = await this.getAllStats();
    return stats.reduce((acc, stat) => {
      acc[stat.difficulty] = (acc[stat.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
} 