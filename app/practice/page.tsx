'use client';

import React, { useState } from 'react';

const exercises = [
  {
    id: 1,
    type: 'translation',
    question: 'Translate: "Hello, how are you?"',
    options: [
      'Hola, ¿cómo estás?',
      'Hola, ¿dónde estás?',
      'Adiós, ¿cómo estás?',
      'Hola, ¿quién eres?'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'What is the Spanish word for "dog"?',
    options: [
      'Gato',
      'Perro',
      'Pájaro',
      'Conejo'
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    type: 'fill-in-blank',
    question: 'Complete the sentence: "Yo _____ español." (I speak Spanish)',
    options: [
      'hablo',
      'hablas',
      'habla',
      'hablan'
    ],
    correctAnswer: 0
  }
];

export default function Practice() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const currentExercise = exercises[currentExerciseIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    const correct = optionIndex === currentExercise.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
  };
  
  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setCompleted(true);
    }
  };
  
  const resetPractice = () => {
    setCurrentExerciseIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
  };
  
  return (
    <div className="container mx-auto max-w-4xl">
      {!completed ? (
        <div className="card">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-primary-600">Practice Spanish</h1>
            <div className="text-sm text-gray-500">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                currentExercise.type === 'translation' 
                  ? 'bg-primary-100 text-primary-800' 
                  : currentExercise.type === 'multiple-choice'
                    ? 'bg-secondary-100 text-secondary-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {currentExercise.type === 'translation' 
                  ? 'Translation' 
                  : currentExercise.type === 'multiple-choice' 
                    ? 'Multiple Choice' 
                    : 'Fill in the Blank'}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-center mb-6">{currentExercise.question}</h2>
            
            <div className="space-y-3">
              {currentExercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 rounded-lg border-2 ${
                    selectedOption === null 
                      ? 'border-gray-200 hover:border-primary-300' 
                      : selectedOption === index 
                        ? index === currentExercise.correctAnswer 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-red-500 bg-red-50' 
                        : index === currentExercise.correctAnswer && selectedOption !== null 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 opacity-50'
                  }`}
                  onClick={() => selectedOption === null && handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      selectedOption === null 
                        ? 'bg-gray-200'
                        : selectedOption === index 
                          ? index === currentExercise.correctAnswer 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white' 
                          : index === currentExercise.correctAnswer && selectedOption !== null 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedOption !== null && (
            <div className={`p-4 rounded-lg mb-6 ${
              isCorrect ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
            }`}>
              <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '¡Correcto! Well done!' : 'Incorrect. The correct answer is highlighted.'}
              </p>
              {!isCorrect && (
                <p className="mt-1 text-gray-700">
                  The correct answer is: {currentExercise.options[currentExercise.correctAnswer]}
                </p>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentExerciseIndex < exercises.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-primary-600 mb-6">Practice Complete!</h1>
          
          <div className="mb-8">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-primary-600">{score}/{exercises.length}</span>
            </div>
            <p className="text-xl text-gray-700">
              {score === exercises.length 
                ? 'Perfect score! Amazing job!' 
                : score >= exercises.length / 2 
                  ? 'Good job! Keep practicing to improve.' 
                  : 'Keep practicing to improve your skills.'}
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              className="btn-primary"
              onClick={resetPractice}
            >
              Practice Again
            </button>
            <button
              className="btn-secondary"
              onClick={() => window.location.href = '/lessons'}
            >
              Back to Lessons
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 