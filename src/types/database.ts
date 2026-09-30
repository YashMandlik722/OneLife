/**
 * Database schema models matching POC spec (8 tables)
 */
export type { Challenge } from './challenge';

export interface Department {
  id: string | number;
  name: string;
  created_at?: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  department_id?: string | number;
  department?: Department;
  created_at?: string;
}

export interface Team {
  id: string | number;
  name: string;
  created_at?: string;
}

export interface TeamMember {
  id: string | number;
  team_id: string | number;
  user_id: string | number;
  joined_at?: string;
}

export interface ChallengeProgress {
  id: string | number;
  challenge_id: string | number;
  user_id: string | number;
  current_value: number;
  completed: boolean;
  completed_at?: string | null;
  updated_at?: string;
}

export interface Activity {
  id: string | number;
  user_id: string | number;
  steps: number;
  calories: number;
  elevation: number;
  activity_date: string;
  created_at?: string;
}

export interface PointTransaction {
  id: string | number;
  user_id?: string | number | null;
  team_id?: string | number | null;
  points: number;
  reason: string;
  created_at?: string;
}

/**
 * Derived Models for UI Presentation
 */
export interface LeaderboardUserEntry {
  id: string | number;
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
  id: string | number;
  rank: number;
  name: string;
  membersCount: number;
  points: number;
  color: string;
}
