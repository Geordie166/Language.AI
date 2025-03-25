export interface UserProgress {
  userId: string;
  completedLessons: string[];
  scores: {
    [lessonId: string]: {
      lastAttempted: Date;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
    };
  };
  streak: number;
  lastPracticeDate: Date;
}

export interface AudioExample {
  spanish: string;
  english: string;
  audioUrl: string;
}

export interface PracticeResult {
  isCorrect: boolean;
  feedback: string;
  correctAnswer: string;
  explanation?: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  lastAttempted: Date;
  audioExamples: {
    [key: string]: {
      played: boolean;
      correct: boolean;
    };
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  audioUrl?: string;
  timestamp: number;
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