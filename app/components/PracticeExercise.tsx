'use client';

import React, { useState } from 'react';
import { useProgress } from '../contexts/ProgressContext';

interface PracticeExerciseProps {
  scenarioId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
  onComplete: (score: number) => void;
}

export default function PracticeExercise({
  scenarioId,
  question,
  options,
  correctAnswer,
  explanation,
  audioUrl,
  onComplete
}: PracticeExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { updateConversationProgress } = useProgress();

  const handleOptionSelect = (option: string) => {
    if (selectedOption || showFeedback) return;
    
    setSelectedOption(option);
    setShowFeedback(true);
    
    const isCorrect = option === correctAnswer;
    const score = isCorrect ? 1 : 0;
    
    updateConversationProgress(scenarioId, score);
    onComplete(score);
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium">{question}</h3>
        {audioUrl && (
          <button
            onClick={handlePlayAudio}
            className="p-2 text-primary-600 hover:text-primary-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a9 9 0 010 11.9M6.343 9.657a3 3 0 114.243 4.243M8.757 7.243a6 6 0 018.486 8.486" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            disabled={showFeedback}
            className={`w-full p-4 text-left rounded-lg transition-colors ${
              showFeedback
                ? option === correctAnswer
                  ? 'bg-green-100 border-green-500'
                  : option === selectedOption
                  ? 'bg-red-100 border-red-500'
                  : 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } border`}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className={`p-4 rounded-lg ${selectedOption === correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-medium ${selectedOption === correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
            {selectedOption === correctAnswer ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer}`}
          </p>
          {explanation && (
            <p className="mt-2 text-gray-600">
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 