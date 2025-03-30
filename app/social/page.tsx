'use client';

import React, { useEffect, useState } from 'react';
import { SocialService, UserProfile, PracticeGroup, FriendRequest } from '@/app/lib/social-service';
import { motion } from 'framer-motion';
import { Users, Trophy, UserPlus, UserCheck, UserX } from 'lucide-react';

interface SocialPageProps {
  userId: string;
}

export default function SocialPage({ userId }: SocialPageProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<PracticeGroup[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSocialData = async () => {
      const socialService = SocialService.getInstance();
      
      try {
        const [friendsData, groupsData, leaderboardData, requestsData] = await Promise.all([
          socialService.getFriends(userId),
          socialService.getUserGroups(userId),
          socialService.getLeaderboard('xp'),
          socialService.getPendingFriendRequests(userId)
        ]);

        setFriends(friendsData);
        setGroups(groupsData);
        setLeaderboard(leaderboardData);
        setFriendRequests(requestsData);
      } catch (error) {
        console.error('Failed to load social data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialData();
  }, [userId]);

  const handleSendFriendRequest = async (toUserId: string) => {
    const socialService = SocialService.getInstance();
    await socialService.sendFriendRequest(userId, toUserId);
    // Refresh friend requests
    const requests = await socialService.getPendingFriendRequests(userId);
    setFriendRequests(requests);
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    const socialService = SocialService.getInstance();
    await socialService.acceptFriendRequest(requestId);
    // Refresh friends and requests
    const [friendsData, requestsData] = await Promise.all([
      socialService.getFriends(userId),
      socialService.getPendingFriendRequests(userId)
    ]);
    setFriends(friendsData);
    setFriendRequests(requestsData);
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    const socialService = SocialService.getInstance();
    await socialService.rejectFriendRequest(requestId);
    // Refresh requests
    const requests = await socialService.getPendingFriendRequests(userId);
    setFriendRequests(requests);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Social Hub</h1>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendRequests.map(request => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Friend Request</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {request.fromUserId}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptFriendRequest(request.id)}
                      className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"
                    >
                      <UserCheck className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRejectFriendRequest(request.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                    >
                      <UserX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'friends'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Friends</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'groups'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Groups</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === 'friends' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Friends</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 rounded-full bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{friend.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Level {friend.level} • {friend.xp} XP
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Practice Groups</h2>
              <button
                onClick={() => {/* TODO: Implement create group modal */}}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Users className="h-4 w-4" />
                <span>Create Group</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg p-4 shadow-sm"
                >
                  <h3 className="font-medium mb-2">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {group.members.length} members
                    </div>
                    {group.isPrivate && (
                      <div className="text-sm text-muted-foreground">
                        Invite: {group.inviteCode}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Global Leaderboard</h2>
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Level {user.level} • {user.xp} XP
                      </p>
                    </div>
                    <button
                      onClick={() => handleSendFriendRequest(user.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full"
                    >
                      <UserPlus className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 