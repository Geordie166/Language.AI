export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  audioUrl?: string;
  timestamp: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  practiceReminders: boolean;
  audioEnabled: boolean;
  autoPlayPronunciation: boolean;
  preferredPracticeTime: number; // minutes per session
  dailyGoal: number; // conversations per day
  interfaceLanguage: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrastMode: boolean;
  keyboardShortcuts: boolean;
  showProgressChart: boolean;
  showStreak: boolean;
  privacyMode: 'public' | 'private' | 'friends' | 'admin';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional in profile, required during registration
  nativeLanguage: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  joinedDate: string;
  lastActive: string;
  settings: UserSettings;
  avatar?: string;
  bio?: string;
  interests?: string[];
  preferredTopics?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  studySchedule?: {
    preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
  };
}

export interface UserProgress {
  conversations: Record<string, {
    completed: boolean;
    score?: number;
    lastAttempt?: number;
  }>;
  statistics: {
    totalConversations: number;
    totalPracticeTime: number; // in minutes
    averageScore: number;
    completedScenarios: number;
    currentStreak: number;
    longestStreak: number;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    earnedDate: string;
  }[];
}

export interface SavedConversation {
  id: string;
  title: string;
  date: number;
  scenario?: string;
  templateType?: string;
  messages: Message[];
  userNativeLanguage: string;
  practiceLanguage: string;
  script?: {
    topic: string;
    keyPoints: string[];
    suggestedResponses: string[];
  };
  feedback?: {
    fluency: number;
    accuracy: number;
    vocabulary: number;
    confidence: number;
    pronunciation: number;
    comments: string;
  };
}

export interface UserRole {
  type: 'student' | 'teacher' | 'parent' | 'admin';
  permissions: {
    viewConversations: boolean;
    addFeedback: boolean;
    deleteConversations: boolean;
  };
}

export interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  joinedDate: string;
  status: 'pending' | 'notified' | 'registered';
  preferredLanguage?: string;
  source?: string;
  notes?: string;
} 