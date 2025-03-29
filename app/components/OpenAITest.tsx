'use client';

import { useState } from 'react';
import { Button } from './ui/button';

export default function OpenAITest() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setStatus('Testing connection...');
      
      const response = await fetch('/api/test-openai');
      const data = await response.json();
      
      if (data.success) {
        setStatus(`Success: ${data.message}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Button 
        onClick={testConnection}
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Test OpenAI Connection'}
      </Button>
      {status && (
        <div className={`p-4 rounded-md ${
          status.startsWith('Success') 
            ? 'bg-green-100 text-green-800' 
            : status.startsWith('Error')
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
} 