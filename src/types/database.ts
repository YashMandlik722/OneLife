/**
 * Database schema models matching POC spec (8 tables)
 */

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department_id: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
}

export interface Challenge {
  id: string;
  team_id: string;
  title: string;
  description: string;
  target_value: number;
  target_unit: string;
  points: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  current_value: number;
  completed: boolean;
  completed_at?: string | null;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  steps: number;
  calories: number;
  elevation: number;
  activity_date: string;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  team_id?: string | null;
  points: number;
  reason: string;
  created_at: string;
}

/**
 * Derived Models for UI Presentation
 */
export interface LeaderboardUserEntry {
  id: string;
  rank: number;
  name: string;
  initials: string;
  departmentName: string;
  points: number;
  avatarBgColor: string;
  avatarTextColor?: string;
  badgeColor?: string;
  pillBgColor?: string;
  pillTextColor?: string;
  isCurrentUser?: boolean;
  deltaToday?: number;
  pointsBehindPrev?: number;
}

export interface LeaderboardDepartmentEntry {
  id: string;
  rank: number;
  name: string;
  membersCount: number;
  points: number;
  color: string;
}
