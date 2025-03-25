import React, { useState } from 'react';
import { SavedConversation, UserRole } from '../lib/types';

interface ConversationHistoryProps {
  conversations: SavedConversation[];
  userRole: UserRole;
  onDeleteConversation?: (id: string) => void;
  onAddFeedback?: (id: string, feedback: SavedConversation['feedback']) => void;
}

export default function ConversationHistory({
  conversations,
  userRole,
  onDeleteConversation,
  onAddFeedback
}: ConversationHistoryProps) {
  const [selectedConversation, setSelectedConversation] = useState<SavedConversation | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<{
    fluency: number;
    accuracy: number;
    vocabulary: number;
    confidence: number;
    pronunciation: number;
    comments: string;
  }>({
    fluency: 0,
    accuracy: 0,
    vocabulary: 0,
    confidence: 0,
    pronunciation: 0,
    comments: ''
  });

  const handleFeedbackSubmit = (conversationId: string) => {
    onAddFeedback?.(conversationId, feedbackForm);
    setFeedbackForm({
      fluency: 0,
      accuracy: 0,
      vocabulary: 0,
      confidence: 0,
      pronunciation: 0,
      comments: ''
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Conversation History</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="md:col-span-1 space-y-4">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <h3 className="font-semibold">{conv.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(conv.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {conv.scenario || 'Free Conversation'}
              </p>
            </div>
          ))}
        </div>

        {/* Conversation Details */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedConversation.title}</h3>
                  <p className="text-gray-600">
                    {new Date(selectedConversation.date).toLocaleString()}
                  </p>
                </div>
                {userRole.permissions.deleteConversations && (
                  <button
                    onClick={() => onDeleteConversation?.(selectedConversation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Conversation Script */}
              {selectedConversation.script && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Conversation Script</h4>
                  <ul className="list-disc list-inside text-sm">
                    {selectedConversation.script.suggestedResponses.map((response, i) => (
                      <li key={i}>{response}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4 mb-6">
                {selectedConversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{message.text}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Section */}
              {userRole.permissions.addFeedback && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Add Feedback</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: 'fluency', label: 'Speaking Fluency' },
                        { key: 'accuracy', label: 'Grammar Accuracy' },
                        { key: 'vocabulary', label: 'Vocabulary Usage' },
                        { key: 'confidence', label: 'Speaking Confidence' },
                        { key: 'pronunciation', label: 'Pronunciation' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-1 capitalize">
                            {label} (1-5)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={feedbackForm[key as keyof typeof feedbackForm] || ''}
                            onChange={e => setFeedbackForm(prev => ({
                              ...prev,
                              [key]: parseInt(e.target.value)
                            }))}
                            className="input-field w-20"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Comments
                      </label>
                      <textarea
                        value={feedbackForm.comments}
                        onChange={e => setFeedbackForm(prev => ({
                          ...prev,
                          comments: e.target.value
                        }))}
                        className="input-field w-full"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => handleFeedbackSubmit(selectedConversation.id)}
                      className="btn-primary"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Feedback */}
              {selectedConversation.feedback && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Feedback</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
                    {[
                      { key: 'fluency', label: 'Fluency' },
                      { key: 'accuracy', label: 'Accuracy' },
                      { key: 'vocabulary', label: 'Vocabulary' },
                      { key: 'confidence', label: 'Confidence' },
                      { key: 'pronunciation', label: 'Pronunciation' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <span className="text-sm text-gray-600">{label}:</span>
                        <span className="ml-2 font-medium">
                          {selectedConversation.feedback?.[key as keyof typeof selectedConversation.feedback]}/5
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedConversation.feedback.comments && (
                    <p className="text-sm text-gray-700 mt-2">
                      {selectedConversation.feedback.comments}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 