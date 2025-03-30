'use client';

export function TopBar() {
  return (
    <div className="w-full bg-white text-center py-8">
      <h1 className="text-4xl font-bold mb-2">
        <span className="bg-gradient-to-r from-blue-500 to-coral-500 bg-clip-text text-transparent">
          MyVoiceCoach
        </span>
      </h1>
      <p className="text-gray-600">
        Select a conversation to start practicing
      </p>
    </div>
  );
} 