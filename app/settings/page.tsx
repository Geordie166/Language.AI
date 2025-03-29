'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/user-context';
import { useTheme } from '../context/theme-context';
import type { UserSettings } from '../lib/types';

export default function SettingsPage() {
  const { user, setUser, isLoading } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    theme: isDarkMode ? 'dark' : 'light',
    emailNotifications: true,
    practiceReminders: true,
    audioEnabled: true,
    autoPlayPronunciation: false,
    preferredPracticeTime: 30,
    dailyGoal: 3,
    interfaceLanguage: 'en',
    fontSize: 'medium',
    highContrastMode: false,
    keyboardShortcuts: true,
    showProgressChart: true,
    showStreak: true,
    privacyMode: 'public',
  });

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, [user]);

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: isDarkMode ? 'dark' : 'light'
    }));
  }, [isDarkMode]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          settings
        };
        setUser(updatedUser);
        // Here you would typically also save to your backend
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Please sign in to access settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {/* Appearance */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Theme</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                >
                  {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

              <div>
                <label className="font-medium">Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={e => handleSettingChange('fontSize', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highContrastMode"
                  checked={settings.highContrastMode}
                  onChange={e => handleSettingChange('highContrastMode', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="highContrastMode" className="ml-2">
                  High Contrast Mode
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={e => handleSettingChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2">
                  Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="practiceReminders"
                  checked={settings.practiceReminders}
                  onChange={e => handleSettingChange('practiceReminders', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="practiceReminders" className="ml-2">
                  Practice Reminders
                </label>
              </div>
            </div>
          </div>

          {/* Practice Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Practice Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Daily Goal (conversations)</label>
                <input
                  type="number"
                  value={settings.dailyGoal}
                  onChange={e => handleSettingChange('dailyGoal', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="font-medium">Preferred Practice Time (minutes)</label>
                <input
                  type="number"
                  value={settings.preferredPracticeTime}
                  onChange={e => handleSettingChange('preferredPracticeTime', parseInt(e.target.value))}
                  min="5"
                  max="60"
                  step="5"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPlayPronunciation"
                  checked={settings.autoPlayPronunciation}
                  onChange={e => handleSettingChange('autoPlayPronunciation', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoPlayPronunciation" className="ml-2">
                  Auto-play Pronunciation
                </label>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Display Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showProgressChart"
                  checked={settings.showProgressChart}
                  onChange={e => handleSettingChange('showProgressChart', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="showProgressChart" className="ml-2">
                  Show Progress Chart
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showStreak"
                  checked={settings.showStreak}
                  onChange={e => handleSettingChange('showStreak', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="showStreak" className="ml-2">
                  Show Practice Streak
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <div>
              <label className="font-medium">Profile Privacy</label>
              <select
                value={settings.privacyMode}
                onChange={e => handleSettingChange('privacyMode', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 