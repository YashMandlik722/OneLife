/**
 * Health & Fitness Activity Logging API Service
 * Endpoint: POST /api/v1/activities
 */

import { apiFetch, ApiResponse } from './client';
import { getHealthProvider } from '../health';
import { fetchUserDashboard } from './user';
import { getFriendlyErrorMessage } from '../utils/errorFormatter';

export interface LogActivityPayload {
  user_id?: string | number;
  steps: number;
  calories: number;
  elevation: number; // elevation gained in meters / floors
  activity_date?: string; // YYYY-MM-DD
}

export interface ActivityRecord {
  id: string | number;
  user_id: string | number;
  steps: number;
  calories: number;
  elevation: number;
  activity_date: string;
  created_at: string;
}

export interface ChallengeUpdateInfo {
  updatedChallenges?: any[];
  completedChallenges?: any[];
}

export interface LogActivityResponseData {
  activity: ActivityRecord;
  challenge_updates?: ChallengeUpdateInfo;
}

/**
 * Submit health/fitness activity to backend API
 * POST /api/v1/activities
 */
export async function submitActivity(
  payload: LogActivityPayload
): Promise<ApiResponse<LogActivityResponseData>> {
  const todayStr = new Date().toISOString().split('T')[0];

  const requestBody = {
    steps: Math.max(0, payload.steps || 0),
    calories: Math.max(0, payload.calories || 0),
    elevation: Math.max(0, payload.elevation || 0),
    activity_date: payload.activity_date || todayStr,
    ...(payload.user_id ? { user_id: payload.user_id } : {}),
  };

  const response = await apiFetch<LogActivityResponseData>('/api/v1/activities', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return response;
}

let lastSyncedSteps = -1;
let isSyncing = false;

/**
 * Reads native iOS HealthKit metrics and automatically syncs them to the backend API.
 * Triggers backend challenge progress calculations & point distributions.
 */
export async function syncNativeHealthKitActivity(
  userId?: string | number,
  force: boolean = false
): Promise<{
  success: boolean;
  message?: string;
  data?: LogActivityResponseData;
}> {
  if (isSyncing) {
    return { success: false, message: 'Sync already in progress' };
  }

  isSyncing = true;

  try {
    const provider = getHealthProvider();
    const health = await provider.getTodayHealthData();

    // Prevent redundant network requests if step count hasn't changed (unless forced)
    if (!force && health.steps === lastSyncedSteps && health.steps > 0) {
      isSyncing = false;
      return { success: true, message: 'Activity up-to-date' };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const result = await submitActivity({
      user_id: userId,
      steps: health.steps,
      calories: health.caloriesKcal || Math.round(health.steps * 0.04),
      elevation: health.floorsClimbed || Math.round(health.steps / 650),
      activity_date: todayStr,
    });

    isSyncing = false;

    if (result.success && result.data) {
      lastSyncedSteps = health.steps;

      // Revalidate User Dashboard cache after activity submission
      fetchUserDashboard().catch(() => {});

      return {
        success: true,
        message: result.message || 'Health activity successfully synced with server.',
        data: result.data,
      };
    } else {
      const friendlyError = getFriendlyErrorMessage(result.message, undefined, 'general');
      return {
        success: false,
        message: friendlyError,
      };
    }
  } catch (err: any) {
    isSyncing = false;
    const friendlyError = getFriendlyErrorMessage(err?.message, undefined, 'general');
    return {
      success: false,
      message: friendlyError,
    };
  }
}

/**
 * Fetch activity history for a specific user ID
 * GET /api/v1/users/{id}/activities
 */
export async function fetchUserActivities(
  userId: string | number
): Promise<ApiResponse<ActivityRecord[]>> {
  return apiFetch<ActivityRecord[]>(`/api/v1/users/${userId}/activities`);
}

/**
 * Fetch activities for a specific user ID on a given date (YYYY-MM-DD)
 * GET /api/v1/users/{id}/activities/{date}
 */
export async function fetchUserActivityByDate(
  userId: string | number,
  date: string
): Promise<ApiResponse<ActivityRecord[]>> {
  return apiFetch<ActivityRecord[]>(`/api/v1/users/${userId}/activities/${date}`);
}

