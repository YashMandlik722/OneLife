import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setActiveUserEmail, setActiveUserId } from '../api/client';

const SESSION_KEY = '@onelife_user_session';
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

export interface StoredSession {
  token: string;
  email: string;
  userId?: string | number;
  timestamp: number;
}

/**
 * Save active login session (valid for 15 days)
 */
export async function saveSession(
  token: string,
  email: string,
  userId?: string | number
): Promise<void> {
  try {
    const session: StoredSession = {
      token,
      email: email.trim().toLowerCase(),
      userId,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Update in-memory API client state
    setAuthToken(token);
    setActiveUserEmail(email);
    if (userId) setActiveUserId(userId);
  } catch (err) {
    console.warn('[SessionStorage] Failed to save session:', err);
  }
}

/**
 * Load and validate stored session (returns session if < 15 days old)
 */
export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: StoredSession = JSON.parse(raw);
    const now = Date.now();
    const age = now - session.timestamp;

    // Check 15-day expiration limit
    if (age > FIFTEEN_DAYS_MS) {
      console.log('[SessionStorage] Stored session expired (>15 days), clearing...');
      await clearSession();
      return null;
    }

    // Populate in-memory API client state
    if (session.token) setAuthToken(session.token);
    if (session.email) setActiveUserEmail(session.email);
    if (session.userId) setActiveUserId(session.userId);

    return session;
  } catch (err) {
    console.warn('[SessionStorage] Failed to load session:', err);
    return null;
  }
}

/**
 * Clear stored session (on Sign Out)
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setActiveUserEmail(null);
  } catch (err) {
    console.warn('[SessionStorage] Failed to clear session:', err);
  }
}
