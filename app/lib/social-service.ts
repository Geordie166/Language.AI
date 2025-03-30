import { AchievementService } from './achievement-service';

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  achievements: string[];
  practiceTime: number;
  streak: number;
  lastActive: Date;
}

export interface PracticeGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
  isPrivate: boolean;
  inviteCode?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export class SocialService {
  private static instance: SocialService;
  private achievementService: AchievementService;
  private profiles: Record<string, UserProfile> = {};
  private groups: Record<string, PracticeGroup> = {};
  private friendRequests: Record<string, FriendRequest> = {};
  private friendships: Record<string, Set<string>> = {};

  private constructor() {
    this.achievementService = AchievementService.getInstance();
  }

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  // Profile Management
  async createProfile(userId: string, name: string, avatar?: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      name,
      avatar,
      level: 1,
      xp: 0,
      achievements: [],
      practiceTime: 0,
      streak: 0,
      lastActive: new Date()
    };

    this.profiles[userId] = profile;
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles[userId] || null;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = this.profiles[userId];
    if (!profile) return null;

    this.profiles[userId] = {
      ...profile,
      ...updates,
      lastActive: new Date()
    };

    return this.profiles[userId];
  }

  // Friend Management
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    const request: FriendRequest = {
      id: `${fromUserId}-${toUserId}`,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.friendRequests[request.id] = request;
    return request;
  }

  async acceptFriendRequest(requestId: string): Promise<boolean> {
    const request = this.friendRequests[requestId];
    if (!request || request.status !== 'pending') return false;

    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();

    // Add to friendships
    if (!this.friendships[request.fromUserId]) {
      this.friendships[request.fromUserId] = new Set();
    }
    if (!this.friendships[request.toUserId]) {
      this.friendships[request.toUserId] = new Set();
    }

    this.friendships[request.fromUserId].add(request.toUserId);
    this.friendships[request.toUserId].add(request.fromUserId);

    // Check for social achievements
    await this.achievementService.checkAchievements(request.toUserId);

    return true;
  }

  async rejectFriendRequest(requestId: string): Promise<boolean> {
    const request = this.friendRequests[requestId];
    if (!request || request.status !== 'pending') return false;

    request.status = 'rejected';
    request.updatedAt = new Date();
    return true;
  }

  async getFriends(userId: string): Promise<UserProfile[]> {
    const friendIds = this.friendships[userId] || new Set();
    return Array.from(friendIds)
      .map(id => this.profiles[id])
      .filter((profile): profile is UserProfile => profile !== undefined);
  }

  async getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
    return Object.values(this.friendRequests).filter(
      request => request.toUserId === userId && request.status === 'pending'
    );
  }

  // Practice Groups
  async createGroup(
    name: string,
    description: string,
    createdBy: string,
    isPrivate: boolean = false
  ): Promise<PracticeGroup> {
    const group: PracticeGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      createdBy,
      members: [createdBy],
      createdAt: new Date(),
      isPrivate
    };

    if (isPrivate) {
      group.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    this.groups[group.id] = group;
    return group;
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    const group = this.groups[groupId];
    if (!group) return false;

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      // Check for group achievement
      await this.achievementService.checkAchievements(userId);
    }

    return true;
  }

  async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    const group = this.groups[groupId];
    if (!group) return false;

    group.members = group.members.filter(id => id !== userId);
    return true;
  }

  async getGroup(groupId: string): Promise<PracticeGroup | null> {
    return this.groups[groupId] || null;
  }

  async getUserGroups(userId: string): Promise<PracticeGroup[]> {
    return Object.values(this.groups).filter(group => group.members.includes(userId));
  }

  // Leaderboard
  async getLeaderboard(metric: 'xp' | 'streak' | 'practiceTime'): Promise<UserProfile[]> {
    return Object.values(this.profiles)
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 100);
  }

  // Activity Feed
  async getActivityFeed(userId: string): Promise<{
    type: 'achievement' | 'friend_request' | 'group_join';
    userId: string;
    timestamp: Date;
    details: any;
  }[]> {
    // This would typically be implemented with a proper activity feed system
    // For now, we'll return a simple array of activities
    return [];
  }
} 