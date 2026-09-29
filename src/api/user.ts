/**
 * User & User Dashboard API Service with SWR Caching
 */

import { apiFetch, ApiResponse } from './client';
import { fetchWithCache, TTL, getCache, setCache } from '../utils/cache';
import { User, Department, Activity, PointTransaction } from '../types/database';

export interface UserDashboardData {
  user: User;
  department?: Department;
  points: {
    total: number;
    sources?: PointTransaction[];
  };
  activities: {
    today: {
      steps: number;
      calories: number;
      elevation: number;
    };
    total_steps: number;
    total_calories: number;
    total_elevation: number;
    recent?: Activity[];
  };
  active_challenges?: Array<{
    id: number;
    title: string;
    description: string;
    target_value: number;
    target_unit: string;
    points: number;
    user_progress: number;
    team_progress: number;
    percentage: number;
  }>;
  teams?: Array<{ id: number; name: string }>;
  leaderboard_position?: {
    rank: number;
    total_users: number;
  };
}

/**
 * Fetch current logged-in user profile with SWR Caching
 * GET /api/v1/users/me
 */
export async function fetchMeProfile(
  onFreshData?: (user: User) => void
): Promise<{ data: User | null; isCached: boolean; error?: string }> {
  return fetchWithCache<User>(
    'user_me_profile',
    () => apiFetch<User>('/api/v1/users/me'),
    TTL.USER_PROFILE,
    onFreshData
  );
}

/**
 * Fetch current logged-in user dashboard with SWR Caching
 * GET /api/v1/users/me/dashboard
 */
export async function fetchUserDashboard(
  onFreshData?: (dashboard: UserDashboardData) => void
): Promise<{ data: UserDashboardData | null; isCached: boolean; error?: string }> {
  return fetchWithCache<UserDashboardData>(
    'user_me_dashboard',
    () => apiFetch<UserDashboardData>('/api/v1/users/me/dashboard'),
    TTL.DASHBOARD,
    onFreshData
  );
}

/**
 * Direct cache accessor for instant sync access
 */
export function getCachedMeProfile(): User | null {
  return getCache<User>('user_me_profile');
}

export function getCachedUserDashboard(): UserDashboardData | null {
  return getCache<UserDashboardData>('user_me_dashboard');
}
