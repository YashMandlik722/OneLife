/**
 * Automated Activity Sync Manager for iOS & Android
 * Handles:
 * 1. Foreground Sync: Hits POST /api/v1/activities every 2 minutes when App is Open/Active.
 * 2. Background/Killed Sync: Hits POST /api/v1/activities every 10 minutes when App is in Background or Killed.
 */

import { AppState, AppStateStatus, NativeModules } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { syncNativeHealthKitActivity } from '../api/activity';

export const BACKGROUND_HEALTH_SYNC_TASK = 'BACKGROUND_HEALTH_ACTIVITY_SYNC_TASK';
const FOREGROUND_SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
const BACKGROUND_SYNC_INTERVAL_SEC = 10 * 60;      // 10 minutes in seconds

// Helper to check if native ExpoTaskManager module is available in current build
function isTaskManagerAvailable(): boolean {
  try {
    return (
      TaskManager &&
      typeof TaskManager.defineTask === 'function' &&
      typeof TaskManager.isTaskRegisteredAsync === 'function'
    );
  } catch {
    return false;
  }
}

// ==========================================
// 1. BACKGROUND / KILLED STATE TASK DEFINITION
// ==========================================
if (isTaskManagerAvailable()) {
  try {
    TaskManager.defineTask(BACKGROUND_HEALTH_SYNC_TASK, async () => {
      console.log('[BackgroundSync] Triggered background/killed health sync (10-min interval)...');
      try {
        const result = await syncNativeHealthKitActivity(undefined, true);
        if (result.success) {
          console.log('[BackgroundSync] Background health activity successfully synced to API.');
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } else {
          console.warn('[BackgroundSync] Background health sync returned no new data:', result.message);
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }
      } catch (error) {
        console.error('[BackgroundSync] Background health sync error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  } catch (err) {
    console.warn('[BackgroundSync] TaskManager.defineTask warning:', err);
  }
}

/**
 * Register the 10-minute Background Fetch task for iOS & Android
 */
export async function registerBackgroundSyncTask(): Promise<boolean> {
  if (!isTaskManagerAvailable()) {
    console.log('[BackgroundSync] Native ExpoTaskManager module not linked in current build. Will sync in foreground.');
    return false;
  }
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_HEALTH_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_HEALTH_SYNC_TASK, {
        minimumInterval: BACKGROUND_SYNC_INTERVAL_SEC, // 10 minutes
        stopOnTerminate: false,                         // Android: keep task running when app is killed/terminated
        startOnBoot: true,                             // Android: restart task after device reboot
      });
      console.log('[BackgroundSync] Registered 10-min background/killed sync task for iOS & Android.');
      return true;
    }
    return true;
  } catch (err) {
    console.warn('[BackgroundSync] Could not register background fetch task:', err);
    return false;
  }
}

// ==========================================
// 2. FOREGROUND ACTIVE STATE SYNC MANAGER (2 MIN)
// ==========================================
let foregroundTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: any = null;
let currentUserId: string | number | undefined = undefined;

function runForegroundSync() {
  console.log('[ForegroundSync] Executing 2-minute active app health sync...');
  syncNativeHealthKitActivity(currentUserId).catch((err) => {
    console.warn('[ForegroundSync] Health activity sync error:', err);
  });
}

/**
 * Start the 2-minute Foreground Sync manager
 */
export function startForegroundSync(userId?: string | number): void {
  currentUserId = userId;

  // Immediate sync on start
  runForegroundSync();

  // Clear existing timer if any
  if (foregroundTimer) {
    clearInterval(foregroundTimer);
  }

  // Set 2-minute recurring interval
  foregroundTimer = setInterval(runForegroundSync, FOREGROUND_SYNC_INTERVAL_MS);

  // Monitor AppState transitions
  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log(`[ActivitySyncManager] AppState changed to: ${nextAppState}`);

      if (nextAppState === 'active') {
        // App opened / brought to foreground: Sync immediately & resume 2-minute timer
        runForegroundSync();
        if (!foregroundTimer) {
          foregroundTimer = setInterval(runForegroundSync, FOREGROUND_SYNC_INTERVAL_MS);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background: Pause 2-minute timer (10-min background task handles background)
        if (foregroundTimer) {
          clearInterval(foregroundTimer);
          foregroundTimer = null;
        }
      }
    });
  }

  // Also register background fetch task for when app is killed/backgrounded
  registerBackgroundSyncTask().catch(() => {});
}

/**
 * Stop foreground sync timer (e.g. on logout)
 */
export function stopForegroundSync(): void {
  if (foregroundTimer) {
    clearInterval(foregroundTimer);
    foregroundTimer = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}
