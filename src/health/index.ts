import { Platform } from 'react-native';
import { HealthProvider } from './types';
import { mockHealthProvider } from './mock';

export const USE_MOCK_HEALTH = process.env.EXPO_PUBLIC_USE_MOCK_HEALTH === 'true' || false;

export function getHealthProvider(): HealthProvider {
  if (USE_MOCK_HEALTH) {
    return mockHealthProvider;
  }
  if (Platform.OS === 'ios') {
    const { iosHealthProvider } = require('./ios');
    return iosHealthProvider;
  }
  if (Platform.OS === 'android') {
    const { androidHealthProvider } = require('./android');
    return androidHealthProvider;
  }
  return mockHealthProvider;
}

export * from './types';
export * from './mock';
