export interface HealthData {
  steps: number;
  distanceKm: number;
  floorsClimbed: number;
  caloriesKcal: number;
}

export interface HealthProvider {
  getTodaySteps(): Promise<number>;
  getTodayHealthData(): Promise<HealthData>;
}
