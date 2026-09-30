import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import VerifyOtpScreen from './src/screens/VerifyOtpScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { startForegroundSync, stopForegroundSync } from './src/services/activitySyncManager';
import { prefetchLeaderboard } from './src/api/leaderboard';
import { getActiveUserId, setActiveUserEmail } from './src/api/client';
import { loadSession, clearSession } from './src/utils/sessionStorage';
import { colors } from './src/theme/colors';

export default function App() {
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [initializing, setInitializing] = useState(true);

  // Check stored 15-day persistent session on App Launch
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await loadSession();
        if (session && session.token) {
          setUserEmail(session.email);
          setAuthStep('authenticated');
        }
      } catch (err) {
        console.warn('[App] Error initializing session:', err);
      } finally {
        setInitializing(false);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    let leaderboardInterval: ReturnType<typeof setInterval> | null = null;

    if (authStep === 'authenticated') {
      startForegroundSync(getActiveUserId());

      // 1. Initial prefetch on App Launch / Authentication
      prefetchLeaderboard(userEmail);

      // 2. Auto-hit API every 5 minutes in background even when on another screen
      leaderboardInterval = setInterval(() => {
        prefetchLeaderboard(userEmail);
      }, 5 * 60 * 1000);
    } else {
      stopForegroundSync();
    }

    return () => {
      if (leaderboardInterval) {
        clearInterval(leaderboardInterval);
      }
    };
  }, [authStep, userEmail]);

  const handleSendOtp = (email: string) => {
    setUserEmail(email);
    setActiveUserEmail(email);
    setAuthStep('otp');
  };

  const handleVerifySuccess = () => {
    setAuthStep('authenticated');
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
  };

  const handleSignOut = async () => {
    await clearSession();
    setUserEmail('');
    setAuthStep('login');
  };

  if (initializing) {
    return (
      <SafeAreaProvider style={styles.splashContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentCyan} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {authStep === 'login' && (
        <LoginScreen onSendOtp={handleSendOtp} />
      )}
      {authStep === 'otp' && (
        <VerifyOtpScreen
          email={userEmail}
          onVerifySuccess={handleVerifySuccess}
          onBack={handleBackToLogin}
        />
      )}
      {authStep === 'authenticated' && (
        <TabNavigator onSignOut={handleSignOut} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


