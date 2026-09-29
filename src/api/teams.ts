/**
 * Teams API Service with SWR Caching
 * Endpoints:
 * - GET /api/v1/teams
 * - GET /api/v1/teams/{id}
 * - GET /api/v1/teams/{id}/dashboard
 */

import { apiFetch, ApiResponse } from './client';
import { fetchWithCache, TTL } from '../utils/cache';
import { Team, User, PointTransaction } from '../types/database';

export interface TeamDetail extends Team {
  members?: Array<{
    id: string | number;
    team_id: string | number;
    user_id: string | number;
    user?: User;
  }>;
  membersCount?: number;
  totalPoints?: number;
}

export interface TeamDashboardData {
  team: Team;
  members: User[];
  points: {
    total: number;
    history: PointTransaction[];
  };
  active_challenges: Array<{
    id: string | number;
    title: string;
    description: string;
    target_value: number;
    target_unit: string;
    points: number;
    user_progress?: number;
    team_progress?: number;
    percentage?: number;
  }>;
  leaderboard_position: {
    rank: number;
    total_teams: number;
  };
}

/**
 * Fetch all teams with member roster & SWR caching
 * GET /api/v1/teams
 */
export async function fetchTeams(
  onFreshData?: (teams: TeamDetail[]) => void
): Promise<{ data: TeamDetail[] | null; isCached: boolean; error?: string }> {
  return fetchWithCache<TeamDetail[]>(
    'teams_list',
    async () => {
      const res = await apiFetch<TeamDetail[]>('/api/v1/teams');
      if (res.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: res.data.map((team) => ({
            ...team,
            membersCount: team.members?.length || 0,
          })),
        };
      }
      return { success: false, message: res.message };
    },
    TTL.USER_PROFILE,
    onFreshData
  );
}

/**
 * Fetch specific team details by ID
 * GET /api/v1/teams/{id}
 */
export async function fetchTeamById(
  teamId: string | number
): Promise<ApiResponse<TeamDetail>> {
  const response = await apiFetch<TeamDetail>(`/api/v1/teams/${teamId}`);
  if (response.success && response.data) {
    return {
      ...response,
      data: {
        ...response.data,
        membersCount: response.data.members?.length || 0,
      },
    };
  }
  return response;
}

/**
 * Fetch full team dashboard (team stats, roster, active challenges, rank)
 * GET /api/v1/teams/{id}/dashboard
 */
export async function fetchTeamDashboard(
  teamId: string | number,
  onFreshData?: (dashboard: TeamDashboardData) => void
): Promise<{ data: TeamDashboardData | null; isCached: boolean; error?: string }> {
  return fetchWithCache<TeamDashboardData>(
    `team_dashboard_${teamId}`,
    async () => {
      const res = await apiFetch<TeamDashboardData>(`/api/v1/teams/${teamId}/dashboard`);
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message };
    },
    TTL.DASHBOARD,
    onFreshData
  );
}
