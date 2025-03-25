'use client';

import React, { useState } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { PracticeResult } from '../lib/types';

interface PracticeExerciseProps {
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  audioUrl?: string;
  explanation?: string;
}

export default function PracticeExercise({
  lessonId,
  question,
  options,
  correctAnswer,
  audioUrl,
  explanation,
}: PracticeExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const { updateLessonProgress } = useProgress();

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(index);
    const isCorrect = index === correctAnswer;
    
    const result: PracticeResult = {
      isCorrect,
      feedback: isCorrect ? '¡Correcto!' : 'Incorrecto. Intenta de nuevo.',
      correctAnswer: options[correctAnswer],
      explanation,
    };
    
    setResult(result);
    setShowFeedback(true);

    // Update progress
    updateLessonProgress(
      lessonId,
      isCorrect ? 100 : 0,
      1,
      isCorrect ? 1 : 0
    );
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {question}
        </h3>
        {audioUrl && (
          <button
            onClick={handlePlayAudio}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Escuchar pronunciación
          </button>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left p-3 rounded-md transition-colors ${
              selectedAnswer === null
                ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                : selectedAnswer === index
                ? result?.isCorrect
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
                : index === correctAnswer && showFeedback
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && result && (
        <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700">
          <p className={`font-semibold ${
            result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {result.feedback}
          </p>
          {!result.isCorrect && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Respuesta correcta: {result.correctAnswer}
            </p>
          )}
          {result.explanation && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {result.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 