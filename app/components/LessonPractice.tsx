'use client';

import React, { useState } from 'react';
import { Lesson } from '../lib/lessons';
import { useProgress } from '../contexts/ProgressContext';

interface LessonPracticeProps {
  lesson: Lesson;
  onComplete: () => void;
}

export default function LessonPractice({ lesson, onComplete }: LessonPracticeProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const { updateLessonProgress } = useProgress();
  const currentExercise = lesson.content.practice[currentExerciseIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentExercise.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
  };
  
  const handleNext = () => {
    if (currentExerciseIndex < lesson.content.practice.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setCompleted(true);
      const finalScore = ((score + (isCorrect ? 1 : 0)) / lesson.content.practice.length) * 100;
      updateLessonProgress(lesson.id, finalScore, lesson.content.practice.length, score + (isCorrect ? 1 : 0));
      onComplete();
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary-600">Practice: {lesson.title}</h2>
          <div className="text-sm text-gray-500">
            Question {currentExerciseIndex + 1} of {lesson.content.practice.length}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">{currentExercise.question}</h3>
          
          <div className="space-y-3">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                className={`w-full text-left p-4 rounded-lg border-2 ${
                  selectedOption === null 
                    ? 'border-gray-200 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500' 
                    : selectedOption === index 
                      ? index === currentExercise.correctAnswer 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : index === currentExercise.correctAnswer && selectedOption !== null 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 opacity-50 dark:border-gray-700'
                }`}
                onClick={() => selectedOption === null && handleOptionSelect(index)}
                disabled={selectedOption !== null}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    selectedOption === null 
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : selectedOption === index 
                        ? index === currentExercise.correctAnswer 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white' 
                        : index === currentExercise.correctAnswer && selectedOption !== null 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedOption !== null && (
          <div className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-100 border border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-100 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <p className={`font-medium ${isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {isCorrect ? '¡Correcto! Well done!' : 'Incorrect. The correct answer is highlighted.'}
            </p>
            {!isCorrect && (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                The correct answer is: {currentExercise.options[currentExercise.correctAnswer]}
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            {currentExerciseIndex < lesson.content.practice.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
} 