/**
 * AI Challenges API Service with Google Gemini AI & SWR Caching
 * Endpoints:
 * - GET /api/v1/challenges
 * - POST /api/v1/challenges/generate (Gemini AI generator)
 * - GET /api/v1/challenges/{id}
 */

import { apiFetch, ApiResponse } from './client';
import { fetchWithCache, TTL } from '../utils/cache';
import { Challenge } from '../types/database';
import { getFriendlyErrorMessage } from '../utils/errorFormatter';

export interface GenerateChallengePayload {
  team_id?: string | number;
  preferred_unit?: 'steps' | 'calories' | 'elevation';
}

export interface ApiChallengeItem {
  id: string | number;
  team_id?: string | number;
  title: string;
  description: string;
  target_value: number;
  target_unit: 'steps' | 'calories' | 'elevation' | string;
  points: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  created_at?: string;
  team_progress?: number;
  user_progress?: number;
}

/**
 * Fetch list of team challenges with SWR caching
 * GET /api/v1/challenges
 */
export async function fetchChallenges(
  teamId?: string | number,
  status?: 'ACTIVE' | 'COMPLETED',
  onFreshData?: (challenges: Challenge[]) => void
): Promise<{ data: Challenge[] | null; isCached: boolean; error?: string }> {
  let endpoint = '/api/v1/challenges';
  const queryParams: string[] = [];
  if (teamId) queryParams.push(`team_id=${teamId}`);
  if (status) queryParams.push(`status=${status}`);
  if (queryParams.length > 0) {
    endpoint += `?${queryParams.join('&')}`;
  }

  const cacheKey = `challenges_${teamId || 'all'}_${status || 'all'}`;

  return fetchWithCache<Challenge[]>(
    cacheKey,
    async () => {
      const res = await apiFetch<Challenge[]>(endpoint);
      if (res.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: res.data,
        };
      }
      return { success: false, message: res.message };
    },
    TTL.DASHBOARD,
    onFreshData
  );
}

/**
 * Fetch specific challenge details by ID
 * GET /api/v1/challenges/{id}
 */
export async function fetchChallengeDetails(
  challengeId: string | number
): Promise<ApiResponse<Challenge>> {
  return apiFetch<Challenge>(`/api/v1/challenges/${challengeId}`);
}
