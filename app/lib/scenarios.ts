export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'roleplay' | 'social' | 'niche';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context: string;
  icon: string;
  estimatedTime: number;
  topics: string[];
  keyPhrases?: string[];
  objectives?: string[];
}

export const scenarios: Record<string, Scenario> = {
  // Roleplay Scenarios
  'job-interview': {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice common job interview questions and professional responses',
    type: 'roleplay',
    difficulty: 'intermediate',
    context: 'You are interviewing for your dream job. The interviewer will ask about your experience, skills, and career goals.',
    icon: '💼',
    estimatedTime: 15,
    topics: ['work', 'career', 'professional development'],
    keyPhrases: [
      'Could you tell me about yourself?',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in five years?'
    ],
    objectives: [
      'Introduce yourself professionally',
      'Discuss work experience confidently',
      'Ask relevant questions about the position'
    ]
  },

  'restaurant-ordering': {
    id: 'restaurant-ordering',
    title: 'Restaurant Ordering',
    description: 'Practice ordering food and making special requests',
    type: 'roleplay',
    difficulty: 'beginner',
    context: 'You are at a restaurant and need to order your meal, make special requests, and interact with the waiter.',
    icon: '🍽️',
    estimatedTime: 10,
    topics: ['food', 'dining', 'service'],
    keyPhrases: [
      'I would like to order...',
      'Could you recommend...',
      'Does this contain...'
    ],
    objectives: [
      'Order food and drinks correctly',
      'Make special dietary requests',
      'Ask for recommendations'
    ]
  },

  // Social Scenarios
  'small-talk': {
    id: 'small-talk',
    title: 'Small Talk',
    description: 'Practice casual conversations about everyday topics',
    type: 'social',
    difficulty: 'beginner',
    context: 'You are meeting someone new and engaging in casual conversation about common topics.',
    icon: '💭',
    estimatedTime: 10,
    topics: ['weather', 'hobbies', 'weekend plans'],
    keyPhrases: [
      'How was your weekend?',
      'What do you like to do for fun?',
      'Nice weather we\'re having!'
    ],
    objectives: [
      'Start and maintain casual conversations',
      'Share personal experiences',
      'Show interest in others\' responses'
    ]
  },

  'making-friends': {
    id: 'making-friends',
    title: 'Making Friends',
    description: 'Learn how to introduce yourself and build connections',
    type: 'social',
    difficulty: 'intermediate',
    context: 'You are at a social event where you want to meet new people and make friends.',
    icon: '👥',
    estimatedTime: 12,
    topics: ['introductions', 'interests', 'social events'],
    keyPhrases: [
      'What brings you here?',
      'Do you have any hobbies?',
      'Would you like to hang out sometime?'
    ],
    objectives: [
      'Introduce yourself naturally',
      'Find common interests',
      'Exchange contact information'
    ]
  },

  // Niche Scenarios
  'tech-interview': {
    id: 'tech-interview',
    title: 'Tech Interview',
    description: 'Practice technical interview skills for tech jobs',
    type: 'niche',
    difficulty: 'advanced',
    context: 'You are interviewing for a technical position and need to discuss your technical skills and experience.',
    icon: '💻',
    estimatedTime: 20,
    topics: ['programming', 'software development', 'technical skills'],
    keyPhrases: [
      'Tell me about a challenging project',
      'How do you handle technical problems?',
      'What programming languages do you know?'
    ],
    objectives: [
      'Explain technical concepts clearly',
      'Discuss project experience',
      'Handle technical questions confidently'
    ]
  },

  'business-meeting': {
    id: 'business-meeting',
    title: 'Business Meeting',
    description: 'Participate in a business meeting discussion',
    type: 'niche',
    difficulty: 'advanced',
    context: 'You are attending a business meeting where you need to present ideas and discuss project updates.',
    icon: '📊',
    estimatedTime: 15,
    topics: ['business', 'project management', 'presentations'],
    keyPhrases: [
      'Let me present our progress',
      'What are your thoughts on this approach?',
      'I suggest we consider...'
    ],
    objectives: [
      'Present project updates professionally',
      'Participate in business discussions',
      'Handle questions and feedback'
    ]
  },

  'travel-planning': {
    id: 'travel-planning',
    title: 'Travel Planning',
    description: 'Plan a trip and discuss travel arrangements',
    type: 'social',
    difficulty: 'intermediate',
    context: 'You are planning a trip and need to discuss arrangements with a travel agent or friend.',
    icon: '✈️',
    estimatedTime: 12,
    topics: ['travel', 'planning', 'accommodation'],
    keyPhrases: [
      'I\'d like to book a flight to...',
      'What activities do you recommend?',
      'Could you help me find a hotel?'
    ],
    objectives: [
      'Discuss travel preferences',
      'Make bookings and reservations',
      'Ask for travel recommendations'
    ]
  },

  'healthcare-visit': {
    id: 'healthcare-visit',
    title: 'Healthcare Visit',
    description: 'Practice describing symptoms and medical concerns',
    type: 'roleplay',
    difficulty: 'intermediate',
    context: 'You are visiting a doctor and need to describe your symptoms and medical history.',
    icon: '🏥',
    estimatedTime: 15,
    topics: ['health', 'medical terms', 'symptoms'],
    keyPhrases: [
      'I\'ve been experiencing...',
      'My symptoms started...',
      'Is this treatment covered by insurance?'
    ],
    objectives: [
      'Describe symptoms accurately',
      'Understand medical instructions',
      'Ask relevant health questions'
    ]
  }
}; 