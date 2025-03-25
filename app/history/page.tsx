'use client';

import React, { useState, useEffect } from 'react';
import ConversationHistory from '../components/ConversationHistory';
import { SavedConversation, UserRole } from '../lib/types';

export default function HistoryPage() {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [userRole, setUserRole] = useState<UserRole>({
    type: 'student',
    permissions: {
      viewConversations: true,
      addFeedback: false,
      deleteConversations: false
    }
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const savedConversations = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    setConversations(savedConversations);

    // In a real app, this would be fetched from user session/auth
    const userRoleFromStorage = localStorage.getItem('userRole');
    if (userRoleFromStorage) {
      setUserRole(JSON.parse(userRoleFromStorage));
    }
  }, []);

  const handleDeleteConversation = (id: string) => {
    // In a real app, this would be an API call
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    localStorage.setItem('savedConversations', JSON.stringify(updatedConversations));
    setConversations(updatedConversations);
  };

  const handleAddFeedback = (id: string, feedback: SavedConversation['feedback']) => {
    // In a real app, this would be an API call
    const updatedConversations = conversations.map(conv =>
      conv.id === id ? { ...conv, feedback } : conv
    );
    localStorage.setItem('savedConversations', JSON.stringify(updatedConversations));
    setConversations(updatedConversations);
  };

  // Temporary function to toggle user role (for demo purposes)
  const toggleRole = () => {
    const newRole: UserRole = {
      type: userRole.type === 'student' ? 'teacher' : 'student',
      permissions: {
        viewConversations: true,
        addFeedback: userRole.type === 'student',
        deleteConversations: userRole.type === 'student'
      }
    };
    localStorage.setItem('userRole', JSON.stringify(newRole));
    setUserRole(newRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Temporary role toggle button (for demo purposes) */}
      <div className="container mx-auto px-4 mb-8">
        <button
          onClick={toggleRole}
          className="text-sm text-gray-600 hover:text-gray-700"
        >
          Current Role: {userRole.type} (Click to toggle)
        </button>
      </div>

      <ConversationHistory
        conversations={conversations}
        userRole={userRole}
        onDeleteConversation={handleDeleteConversation}
        onAddFeedback={handleAddFeedback}
      />

      {conversations.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No saved conversations yet.</p>
          <p className="text-sm mt-2">
            Complete a conversation practice to see it here.
          </p>
        </div>
      )}
    </div>
  );
} 