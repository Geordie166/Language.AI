'use client';

import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import Link from 'next/link';
import type { UserProfile } from '../lib/types';

type EditFormData = Pick<UserProfile, 'name' | 'email' | 'nativeLanguage' | 'proficiencyLevel' | 'learningGoals'>;

export default function ProfilePage() {
  const { userProfile, userProgress, updateProfile, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    email: '',
    nativeLanguage: '',
    proficiencyLevel: 'beginner',
    learningGoals: [],
  });
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile Not Found</h1>
          <p className="mt-2 text-gray-600">Please sign in to view your profile.</p>
          <Link
            href="/register"
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditForm({
      name: userProfile.name,
      email: userProfile.email,
      nativeLanguage: userProfile.nativeLanguage,
      proficiencyLevel: userProfile.proficiencyLevel,
      learningGoals: [...userProfile.learningGoals],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      updateProfile({
        ...userProfile,
        ...editForm,
      });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleGoalToggle = (goal: string) => {
    setEditForm(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter(g => g !== goal)
        : [...prev.learningGoals, goal],
    }));
  };

  const commonGoals = [
    'Improve conversation skills',
    'Learn business English',
    'Prepare for travel',
    'Academic purposes',
    'Cultural understanding',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl text-primary-600">{userProfile.name[0]}</span>
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                )}
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="text-gray-500 border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-500">{userProfile.email}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/settings"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Settings
              </Link>
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Conversations</p>
              <p className="text-2xl font-bold text-primary-600">
                {userProgress?.statistics.totalConversations || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Practice Time</p>
              <p className="text-2xl font-bold text-primary-600">
                {userProgress?.statistics.totalPracticeTime || 0} mins
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-2xl font-bold text-primary-600">
                {userProgress?.statistics.currentStreak || 0} days
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Native Language</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.nativeLanguage}
                  onChange={e => setEditForm(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{userProfile.nativeLanguage}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Proficiency Level</label>
              {isEditing ? (
                <select
                  value={editForm.proficiencyLevel}
                  onChange={e => setEditForm(prev => ({ ...prev, proficiencyLevel: e.target.value as any }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900 capitalize">{userProfile.proficiencyLevel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Learning Goals</label>
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  {commonGoals.map(goal => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.learningGoals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <ul className="mt-1 list-disc list-inside text-gray-900">
                  {userProfile.learningGoals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-gray-900">
                {new Date(userProfile.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
          {userProgress?.achievements.length === 0 ? (
            <p className="text-gray-500">No achievements yet. Start practicing to earn some!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProgress?.achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 