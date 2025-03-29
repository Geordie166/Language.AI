'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navigation() {
  const pathname = usePathname();
  const { userProfile } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const isAdmin = userProfile?.settings?.privacyMode === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                Language AI
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/scenarios"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/scenarios'
                    ? 'border-primary-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Practice Scenarios
              </Link>
              <Link
                href="/conversation"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/conversation'
                    ? 'border-primary-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Free Conversation
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {userProfile ? (
              <>
                <Link
                  href="/settings"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                    pathname === '/settings'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/waitlist"
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                      pathname === '/admin/waitlist'
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Waitlist Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                    pathname === '/profile'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {userProfile.name}
                </Link>
              </>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/scenarios"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/scenarios'
                ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Practice Scenarios
          </Link>
          <Link
            href="/conversation"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === '/conversation'
                ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Free Conversation
          </Link>
          {userProfile ? (
            <>
              <Link
                href="/settings"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === '/settings'
                    ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Settings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/waitlist"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === '/admin/waitlist'
                      ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Waitlist Admin
                </Link>
              )}
              <Link
                href="/profile"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === '/profile'
                    ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <Link
              href="/register"
              className="block pl-3 pr-4 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 