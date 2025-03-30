'use client';

import React, { useEffect, useState } from 'react';
import { SocialService } from '@/app/lib/social-service';
import SocialPage from '../social/page';

export default function TestSocialPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const testUserId = 'test-user-1';

  useEffect(() => {
    const initializeTestData = async () => {
      const socialService = SocialService.getInstance();
      
      // Create test user profile
      await socialService.createProfile(
        testUserId,
        'Test User',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
      );

      // Create some test friends
      const friend1 = await socialService.createProfile(
        'friend-1',
        'John Doe',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
      );
      const friend2 = await socialService.createProfile(
        'friend-2',
        'Jane Smith',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
      );

      // Create a test group
      await socialService.createGroup(
        'English Practice Group',
        'A group for practicing English conversation',
        testUserId,
        true
      );

      // Send and accept friend requests
      const request1 = await socialService.sendFriendRequest(testUserId, friend1.id);
      await socialService.acceptFriendRequest(request1.id);

      const request2 = await socialService.sendFriendRequest(testUserId, friend2.id);
      await socialService.acceptFriendRequest(request2.id);

      // Update profiles with some XP and levels
      await socialService.updateProfile(testUserId, { level: 5, xp: 2500 });
      await socialService.updateProfile(friend1.id, { level: 3, xp: 1500 });
      await socialService.updateProfile(friend2.id, { level: 4, xp: 2000 });

      setIsInitialized(true);
    };

    initializeTestData();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <SocialPage userId={testUserId} />;
} 