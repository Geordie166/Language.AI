import React, { useState } from 'react';

interface TemplateQuestion {
  id: string;
  question: string;
  placeholder: string;
}

interface ConversationTemplateProps {
  onComplete: (answers: Record<string, string>) => void;
  templateType: string;
}

const templates: Record<string, TemplateQuestion[]> = {
  'daily-activities': [
    {
      id: 'activities',
      question: 'What activities did you do today?',
      placeholder: 'E.g., walked my dog, had my car washed'
    },
    {
      id: 'time',
      question: 'When did you do these activities?',
      placeholder: 'E.g., in the morning, after lunch'
    },
    {
      id: 'feelings',
      question: 'How did you feel about your day?',
      placeholder: 'E.g., tired but satisfied, energetic'
    }
  ],
  'weekend-plans': [
    {
      id: 'plans',
      question: 'What are your plans for the weekend?',
      placeholder: 'E.g., going to a movie, meeting friends'
    },
    {
      id: 'people',
      question: 'Who are you going with?',
      placeholder: 'E.g., my friends, my family'
    },
    {
      id: 'expectations',
      question: 'What are you looking forward to the most?',
      placeholder: 'E.g., trying a new restaurant'
    }
  ],
  'work-day': [
    {
      id: 'tasks',
      question: 'What tasks did you work on today?',
      placeholder: 'E.g., attended meetings, completed a project'
    },
    {
      id: 'challenges',
      question: 'Did you face any challenges?',
      placeholder: 'E.g., technical issues, tight deadlines'
    },
    {
      id: 'achievements',
      question: 'What did you achieve?',
      placeholder: 'E.g., solved a problem, helped a colleague'
    }
  ]
};

export default function ConversationTemplate({ onComplete, templateType }: ConversationTemplateProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = templates[templateType] || templates['daily-activities'];

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    // Generate conversation script based on answers
    onComplete(answers);
  };

  const isComplete = questions.every(q => answers[q.id]?.trim());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Prepare Your Conversation</h3>
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {q.question}
            </label>
            <input
              type="text"
              className="input-field w-full"
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          className={`btn-primary w-full ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={!isComplete}
        >
          Generate Conversation Script
        </button>
      </div>
    </div>
  );
} 