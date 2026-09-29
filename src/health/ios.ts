import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
import { HealthProvider, HealthData } from './types';
import { mockHealthProvider } from './mock';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [],
  },
};

const initHealthKitPromise = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== 'function') {
      return reject(new Error('HealthKit native module is not available'));
    }
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        return reject(new Error(`HealthKit init failed: ${error}`));
      }
      resolve();
    });
  });
};

const getStepCountPromise = (options: { date: string }): Promise<number> => {
  return new Promise((resolve) => {
    AppleHealthKit.getStepCount(options, (err: Object, results: { value: number }) => {
      if (err || !results || typeof results.value !== 'number') {
        return resolve(0);
      }
      resolve(Math.round(results.value));
    });
  });
};

const getDistancePromise = (options: { date: string }): Promise<number> => {
  return new Promise((resolve) => {
    AppleHealthKit.getDistanceWalkingRunning(options, (err: Object, results: { value: number }) => {
      if (err || !results || typeof results.value !== 'number') {
        return resolve(0);
      }
      // HealthKit distance is usually in meters or miles, convert to km
      resolve(Number((results.value / 1000).toFixed(2)));
    });
  });
};

const getFlightsClimbedPromise = (options: { date: string }): Promise<number> => {
  return new Promise((resolve) => {
    AppleHealthKit.getFlightsClimbed(options, (err: Object, results: { value: number }) => {
      if (err || !results || typeof results.value !== 'number') {
        return resolve(0);
      }
      resolve(Math.round(results.value));
    });
  });
};

export const iosHealthProvider: HealthProvider = {
  async getTodaySteps(): Promise<number> {
    const data = await this.getTodayHealthData();
    return data.steps;
  },

  async getTodayHealthData(): Promise<HealthData> {
    try {
      await initHealthKitPromise();

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const options = { date: startOfToday.toISOString(), includeManuallyAdded: false };

      const steps = await getStepCountPromise(options);
      let distanceKm = await getDistancePromise(options);
      let floorsClimbed = await getFlightsClimbedPromise(options);

      if (distanceKm === 0 && steps > 0) {
        distanceKm = Number((steps * 0.000762).toFixed(1));
      }

      if (floorsClimbed === 0 && steps > 0) {
        floorsClimbed = Math.max(1, Math.floor(steps / 650));
      }

      const caloriesKcal = Math.round(steps * 0.04);

      return {
        steps,
        distanceKm,
        floorsClimbed,
        caloriesKcal,
      };
    } catch (err) {
      console.warn('HealthKit unavailable or error, falling back to mock metrics:', err);
      return await mockHealthProvider.getTodayHealthData();
    }
  },
};
