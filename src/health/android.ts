import {
  getSdkStatus,
  initialize,
  requestPermission,
  getGrantedPermissions,
  aggregateRecord,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { HealthProvider, HealthData } from './types';
import { mockHealthProvider } from './mock';

export const androidHealthProvider: HealthProvider = {
  async getTodaySteps(): Promise<number> {
    const data = await this.getTodayHealthData();
    return data.steps;
  },

  async getTodayHealthData(): Promise<HealthData> {
    try {
      // 1. Check SDK Status
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        // Fallback to realistic mock metrics on emulators / unavailable Health Connect
        return await mockHealthProvider.getTodayHealthData();
      }

      // 2. Initialize Health Connect SDK
      const isInitialized = await initialize();
      if (!isInitialized) {
        return await mockHealthProvider.getTodayHealthData();
      }

      // 3. Request Permissions for Steps, Distance, Floors, and Calories
      const permissionsToRequest: any[] = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'FloorsClimbed' },
        { accessType: 'read', recordType: 'ElevationGained' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      ];

      try {
        const initialGranted = await getGrantedPermissions();
        const hasStepPerm = initialGranted.some(
          (p: any) => p.accessType === 'read' && p.recordType === 'Steps'
        );
        if (!hasStepPerm) {
          await requestPermission(permissionsToRequest);
        }
      } catch (e) {
        console.warn('Health Connect permission check warning:', e);
      }

      // 4. Set Time Range: Local Midnight to End of Today
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: startOfToday.toISOString(),
        endTime: endOfToday.toISOString(),
      };

      // 5. Aggregate Steps
      let steps = 0;
      try {
        const stepResult: any = await aggregateRecord({
          recordType: 'Steps',
          timeRangeFilter,
        });
        if (stepResult && typeof stepResult.COUNT_TOTAL === 'number') {
          steps = Math.round(stepResult.COUNT_TOTAL);
        }
      } catch (e) {
        console.warn('Failed to aggregate steps:', e);
      }

      // 6. Aggregate Distance (meters)
      let distanceMeters = 0;
      try {
        const distResult: any = await aggregateRecord({
          recordType: 'Distance',
          timeRangeFilter,
        });
        if (distResult && typeof distResult.DISTANCE_TOTAL === 'number') {
          distanceMeters = distResult.DISTANCE_TOTAL;
        }
      } catch (e) {
        // Silently fallback to step-derived estimation if distance permission is missing
      }

      // 7. Aggregate Floors Climbed / Elevation Gained
      let floors = 0;
      try {
        const floorsResult: any = await aggregateRecord({
          recordType: 'FloorsClimbed',
          timeRangeFilter,
        });
        if (floorsResult && typeof floorsResult.FLOORS_CLIMBED_TOTAL === 'number') {
          floors = Math.round(floorsResult.FLOORS_CLIMBED_TOTAL);
        } else {
          // Try Elevation Gained (meters) -> ~3 meters per floor
          const elevResult: any = await aggregateRecord({
            recordType: 'ElevationGained',
            timeRangeFilter,
          });
          if (elevResult && typeof elevResult.ELEVATION_GAINED_TOTAL === 'number') {
            floors = Math.round(elevResult.ELEVATION_GAINED_TOTAL / 3);
          }
        }
      } catch (e) {
        // Silently fallback to step-derived estimation if floor permission is missing
      }

      // 8. Aggregate Active Calories (kcal)
      let calories = 0;
      try {
        const calResult: any = await aggregateRecord({
          recordType: 'ActiveCaloriesBurned',
          timeRangeFilter,
        });
        if (calResult && typeof calResult.ENERGY_TOTAL === 'number') {
          calories = Math.round(calResult.ENERGY_TOTAL);
        }
      } catch (e) {
        // Silently fallback to step-derived estimation if calorie permission is missing
      }

      // Calculate secondary metrics (if 0 steps, secondary metrics are 0)
      const distanceKm = distanceMeters > 0
        ? Number((distanceMeters / 1000).toFixed(2))
        : steps > 0 ? Number((steps * 0.000762).toFixed(1)) : 0;

      const floorsClimbed = floors > 0
        ? floors
        : steps > 0 ? Math.max(1, Math.floor(steps / 650)) : 0;

      const caloriesKcal = calories > 0
        ? calories
        : Math.round(steps * 0.04);

      return {
        steps,
        distanceKm,
        floorsClimbed,
        caloriesKcal,
      };
    } catch (err) {
      console.warn('Health Connect error, falling back to mock metrics:', err);
      return await mockHealthProvider.getTodayHealthData();
    }
  },
};
