import { ProgressService } from './progress-service';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'scenario' | 'streak' | 'skill' | 'social';
  requirement: {
    type: 'completion' | 'streak' | 'score' | 'time' | 'social';
    value: number;
    scenarioId?: string;
    skill?: 'pronunciation' | 'grammar' | 'vocabulary';
  };
  reward: {
    xp: number;
    badge: string;
  };
  unlockedAt?: Date;
}

export class AchievementService {
  private static instance: AchievementService;
  private progressService: ProgressService;
  private achievements: Record<string, Achievement> = {
    // Scenario Achievements
    'first-completion': {
      id: 'first-completion',
      title: 'First Steps',
      description: 'Complete your first practice scenario',
      icon: '🎯',
      category: 'scenario',
      requirement: {
        type: 'completion',
        value: 1
      },
      reward: {
        xp: 100,
        badge: '🎯'
      }
    },
    'scenario-master': {
      id: 'scenario-master',
      title: 'Scenario Master',
      description: 'Complete all scenarios in a category',
      icon: '🏆',
      category: 'scenario',
      requirement: {
        type: 'completion',
        value: 5
      },
      reward: {
        xp: 500,
        badge: '🏆'
      }
    },

    // Streak Achievements
    'week-streak': {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Maintain a 7-day practice streak',
      icon: '🔥',
      category: 'streak',
      requirement: {
        type: 'streak',
        value: 7
      },
      reward: {
        xp: 300,
        badge: '🔥'
      }
    },
    'month-streak': {
      id: 'month-streak',
      title: 'Monthly Master',
      description: 'Maintain a 30-day practice streak',
      icon: '🌟',
      category: 'streak',
      requirement: {
        type: 'streak',
        value: 30
      },
      reward: {
        xp: 1000,
        badge: '🌟'
      }
    },

    // Skill Achievements
    'pronunciation-expert': {
      id: 'pronunciation-expert',
      title: 'Pronunciation Expert',
      description: 'Achieve a 90% pronunciation score in any scenario',
      icon: '🗣️',
      category: 'skill',
      requirement: {
        type: 'score',
        value: 90,
        skill: 'pronunciation'
      },
      reward: {
        xp: 400,
        badge: '🗣️'
      }
    },
    'grammar-guru': {
      id: 'grammar-guru',
      title: 'Grammar Guru',
      description: 'Achieve a 90% grammar score in any scenario',
      icon: '📚',
      category: 'skill',
      requirement: {
        type: 'score',
        value: 90,
        skill: 'grammar'
      },
      reward: {
        xp: 400,
        badge: '📚'
      }
    },

    // Social Achievements
    'first-friend': {
      id: 'first-friend',
      title: 'Social Butterfly',
      description: 'Add your first practice partner',
      icon: '👥',
      category: 'social',
      requirement: {
        type: 'social',
        value: 1
      },
      reward: {
        xp: 200,
        badge: '👥'
      }
    },
    'practice-group': {
      id: 'practice-group',
      title: 'Group Leader',
      description: 'Create or join a practice group',
      icon: '👥',
      category: 'social',
      requirement: {
        type: 'social',
        value: 3
      },
      reward: {
        xp: 300,
        badge: '👥'
      }
    }
  };

  private constructor() {
    this.progressService = ProgressService.getInstance();
  }

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  async checkAchievements(userId: string): Promise<Achievement[]> {
    const userProgress = await this.progressService.getUserProgress(userId);
    if (!userProgress) return [];

    const unlockedAchievements: Achievement[] = [];

    for (const achievement of Object.values(this.achievements)) {
      if (await this.isAchievementUnlocked(userId, achievement)) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    }

    return unlockedAchievements;
  }

  private async isAchievementUnlocked(userId: string, achievement: Achievement): Promise<boolean> {
    const userProgress = await this.progressService.getUserProgress(userId);
    if (!userProgress) return false;

    switch (achievement.requirement.type) {
      case 'completion':
        return Object.keys(userProgress.scenarios).length >= achievement.requirement.value;
      
      case 'streak':
        return userProgress.streak >= achievement.requirement.value;
      
      case 'score':
        if (achievement.requirement.skill) {
          // Check if any scenario has achieved the required score for the specific skill
          return Object.values(userProgress.scenarios).some(scenarios =>
            scenarios.some(attempt => attempt.feedback[achievement.requirement.skill!] >= achievement.requirement.value)
          );
        }
        return false;
      
      case 'time':
        return userProgress.totalPracticeTime >= achievement.requirement.value;
      
      case 'social':
        // This will be implemented with the social features
        return false;
      
      default:
        return false;
    }
  }

  async getUnlockedAchievements(userId: string): Promise<Achievement[]> {
    const userProgress = await this.progressService.getUserProgress(userId);
    if (!userProgress) return [];

    return Object.values(this.achievements).filter(achievement => 
      achievement.unlockedAt !== undefined
    );
  }

  async getAchievementProgress(userId: string, achievementId: string): Promise<{
    progress: number;
    total: number;
    isUnlocked: boolean;
  }> {
    const achievement = this.achievements[achievementId];
    if (!achievement) return { progress: 0, total: 0, isUnlocked: false };

    const userProgress = await this.progressService.getUserProgress(userId);
    if (!userProgress) return { progress: 0, total: achievement.requirement.value, isUnlocked: false };

    let currentProgress = 0;

    switch (achievement.requirement.type) {
      case 'completion':
        currentProgress = Object.keys(userProgress.scenarios).length;
        break;
      
      case 'streak':
        currentProgress = userProgress.streak;
        break;
      
      case 'score':
        if (achievement.requirement.skill) {
          const bestScore = Math.max(
            ...Object.values(userProgress.scenarios).flatMap(scenarios =>
              scenarios.map(attempt => attempt.feedback[achievement.requirement.skill!])
            )
          );
          currentProgress = bestScore;
        }
        break;
      
      case 'time':
        currentProgress = userProgress.totalPracticeTime;
        break;
      
      case 'social':
        // Will be implemented with social features
        break;
    }

    return {
      progress: Math.min(currentProgress, achievement.requirement.value),
      total: achievement.requirement.value,
      isUnlocked: currentProgress >= achievement.requirement.value
    };
  }
} 