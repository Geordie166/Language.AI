'use client';

import React, { useState } from 'react';
import type { WaitlistEntry } from '../lib/types';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  submit?: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      const waitlistEntry: WaitlistEntry = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        joinedDate: new Date().toISOString(),
        status: 'pending',
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Waitlist entry:', waitlistEntry);

      setIsSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
      });
    } catch (error) {
      setErrors({
        submit: 'Failed to join waitlist. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          You're on the list! 🎉
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Thank you for your interest! We'll notify you as soon as early access becomes available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Join the Waitlist</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Be among the first to experience our AI-powered language learning platform. Sign up now for early access and exclusive benefits!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className={`block w-full rounded-md ${
              errors.fullName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`block w-full rounded-md ${
              errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className={`block w-full rounded-md ${
              errors.phoneNumber ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
            placeholder="+1 (555) 555-5555"
          />
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </button>
        </div>
      </form>
    </div>
  );
} 