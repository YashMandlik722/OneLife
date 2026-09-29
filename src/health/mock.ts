import { HealthProvider, HealthData } from './types';

export const mockHealthProvider: HealthProvider = {
  async getTodaySteps(): Promise<number> {
    return 12480;
  },

  async getTodayHealthData(): Promise<HealthData> {
    return {
      steps: 12480,
      distanceKm: 8.7,
      floorsClimbed: 18,
      caloriesKcal: 499,
    };
  },
};
