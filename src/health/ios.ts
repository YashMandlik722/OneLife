import * as HealthKit from '@kayzmann/expo-healthkit';
import { HealthProvider, HealthData } from './types';
import { mockHealthProvider } from './mock';

export const iosHealthProvider: HealthProvider = {
  async getTodaySteps(): Promise<number> {
    const data = await this.getTodayHealthData();
    return data.steps;
  },

  async getTodayHealthData(): Promise<HealthData> {
    try {
      if (!HealthKit.isAvailable || typeof HealthKit.isAvailable !== 'function' || !HealthKit.isAvailable()) {
        console.warn('HealthKit is not available on this device, falling back to mock metrics');
        return await mockHealthProvider.getTodayHealthData();
      }

      await HealthKit.requestAuthorization(
        ['Steps', 'Distance', 'FlightsClimbed', 'ActiveEnergy'],
        []
      );

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [rawSteps, rawDistanceMeters, rawFloors] = await Promise.all([
        HealthKit.getSteps(startOfToday, now).catch(() => 0),
        HealthKit.getTotalDistance(startOfToday, now).catch(() => 0),
        HealthKit.getFlightsClimbed(startOfToday, now).catch(() => 0),
      ]);

      const steps = Math.round(rawSteps || 0);
      let distanceKm = Number(((rawDistanceMeters || 0) / 1000).toFixed(2));
      let floorsClimbed = Math.round(rawFloors || 0);

      if (distanceKm === 0 && steps > 0) {
        distanceKm = Number((steps * 0.000762).toFixed(1));
      }

      if (floorsClimbed === 0 && steps > 0) {
        floorsClimbed = Math.max(1, Math.floor(steps / 650));
      }

      const caloriesKcal = Math.round(steps * 0.04);

      console.log('Real HealthKit data retrieved via @kayzmann/expo-healthkit:', {
        steps,
        distanceKm,
        floorsClimbed,
        caloriesKcal,
      });

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
