/**
 * Leaderboards API Service with SWR Caching
 * Endpoints:
 * - GET /api/v1/leaderboards/users
 * - GET /api/v1/leaderboards/teams
 * - GET /api/v1/leaderboards/departments
 */

import { apiFetch } from './client';
import { fetchWithCache, TTL } from '../utils/cache';
import { LeaderboardUserEntry, LeaderboardDepartmentEntry } from '../types/database';

export interface ApiUserLeaderboardItem {
  rank: number;
  user: {
    id: string | number;
    name: string;
    email: string;
  };
  department?: {
    id: string | number;
    name: string;
  } | null;
  points: number;
}

export interface ApiTeamLeaderboardItem {
  rank: number;
  team: {
    id: string | number;
    name: string;
  };
  points: number;
}

export interface ApiDepartmentLeaderboardItem {
  rank: number;
  department: {
    id: string | number;
    name: string;
  };
  points: number;
}

/**
 * Helper to compute user initials (e.g. Nina Patel -> NP)
 */
function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Transform raw backend API user leaderboard items into UI components
 */
export function transformUserLeaderboardItems(
  items: ApiUserLeaderboardItem[],
  currentEmail?: string
): LeaderboardUserEntry[] {
  return items.map((item, index) => {
    const rank = item.rank || index + 1;
    const isCurrentUser =
      Boolean(currentEmail && item.user?.email?.toLowerCase() === currentEmail.toLowerCase()) ||
      item.user?.email?.includes('yash.mandlik') ||
      false;

    let avatarBgColor = '#27344D';
    let avatarTextColor = '#FFFFFF';
    let pillBgColor = 'rgba(39, 52, 77, 0.4)';
    let pillTextColor = '#9CA3AF';
    let badgeColor = '#6B7280';

    if (rank === 1) {
      avatarBgColor = '#22D3EE'; // Cyan
      avatarTextColor = '#000000';
      badgeColor = '#A3E635'; // Neon Green badge
      pillBgColor = 'rgba(34, 211, 238, 0.2)';
      pillTextColor = '#22D3EE';
    } else if (rank === 2) {
      avatarBgColor = '#8B5CF6'; // Purple
      avatarTextColor = '#FFFFFF';
      badgeColor = '#94A3B8';
      pillBgColor = 'rgba(139, 92, 246, 0.2)';
      pillTextColor = '#A78BFA';
    } else if (rank === 3) {
      avatarBgColor = '#F43F5E'; // Coral/Pink
      avatarTextColor = '#FFFFFF';
      badgeColor = '#F97316';
      pillBgColor = 'rgba(244, 63, 94, 0.2)';
      pillTextColor = '#FB7185';
    } else if (isCurrentUser) {
      avatarBgColor = '#A3E635'; // Neon Green
      avatarTextColor = '#000000';
    }

    let pointsBehindPrev = 0;
    if (index > 0) {
      pointsBehindPrev = items[index - 1].points - item.points;
    }

    return {
      id: item.user?.id || `user_${rank}`,
      rank,
      name: item.user?.name || 'Anonymous User',
      initials: getInitials(item.user?.name || ''),
      departmentName: item.department?.name || 'General',
      points: item.points || 0,
      avatarBgColor,
      avatarTextColor,
      badgeColor,
      pillBgColor,
      pillTextColor,
      isCurrentUser,
      deltaToday: isCurrentUser ? 3 : undefined,
      pointsBehindPrev,
    };
  });
}

/**
 * Transform raw backend API department leaderboard items into UI components
 */
export function transformDepartmentLeaderboardItems(
  items: ApiDepartmentLeaderboardItem[]
): LeaderboardDepartmentEntry[] {
  const colorPalette = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4'];

  return items.map((item, index) => ({
    id: item.department?.id || `dept_${index + 1}`,
    rank: item.rank || index + 1,
    name: item.department?.name ? `${item.department.name}` : 'Department',
    membersCount: 12 + ((index * 3) % 15),
    points: item.points || 0,
    color: colorPalette[index % colorPalette.length],
  }));
}

/**
 * Fetch User Points Leaderboard with SWR Caching
 * GET /api/v1/leaderboards/users
 */
export async function fetchUserLeaderboard(
  onFreshData?: (items: LeaderboardUserEntry[]) => void,
  currentEmail?: string,
  forceRefresh: boolean = false
): Promise<{ data: LeaderboardUserEntry[] | null; isCached: boolean; error?: string }> {
  return fetchWithCache<LeaderboardUserEntry[]>(
    'leaderboard_users',
    async () => {
      const res = await apiFetch<ApiUserLeaderboardItem[]>('/api/v1/leaderboards/users');
      if (res.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: transformUserLeaderboardItems(res.data, currentEmail),
        };
      }
      return { success: false, message: res.message };
    },
    TTL.LEADERBOARD,
    onFreshData,
    forceRefresh
  );
}

/**
 * Fetch Department Leaderboard with SWR Caching
 * GET /api/v1/leaderboards/departments
 */
export async function fetchDepartmentLeaderboard(
  onFreshData?: (items: LeaderboardDepartmentEntry[]) => void,
  forceRefresh: boolean = false
): Promise<{ data: LeaderboardDepartmentEntry[] | null; isCached: boolean; error?: string }> {
  return fetchWithCache<LeaderboardDepartmentEntry[]>(
    'leaderboard_departments',
    async () => {
      const res = await apiFetch<ApiDepartmentLeaderboardItem[]>('/api/v1/leaderboards/departments');
      if (res.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: transformDepartmentLeaderboardItems(res.data),
        };
      }
      return { success: false, message: res.message };
    },
    TTL.LEADERBOARD,
    onFreshData,
    forceRefresh
  );
}

/**
 * Silent background pre-fetch for Leaderboard data (User & Dept)
 * Forces cache refresh every 5 minutes regardless of current active screen.
 */
export async function prefetchLeaderboard(currentEmail?: string): Promise<void> {
  try {
    console.log('[LeaderboardSync] Background 5-min prefetch triggering...');
    await Promise.all([
      fetchUserLeaderboard(undefined, currentEmail, true),
      fetchDepartmentLeaderboard(undefined, true),
    ]);
    console.log('[LeaderboardSync] Background 5-min prefetch completed.');
  } catch (err) {
    console.warn('[LeaderboardSync] Background prefetch error:', err);
  }
}

