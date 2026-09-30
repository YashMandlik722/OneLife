import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import VerifyOtpScreen from './src/screens/VerifyOtpScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { startForegroundSync, stopForegroundSync } from './src/services/activitySyncManager';
import { prefetchLeaderboard } from './src/api/leaderboard';
import { getActiveUserId, setActiveUserEmail } from './src/api/client';
import { loadSession, clearSession } from './src/utils/sessionStorage';
import { colors } from './src/theme/colors';
import AIProcessingAnimation from './src/components/AIProcessingAnimation';

const AI_INTRO_LAST_SHOWN_KEY = 'olympus_ai_intro_last_shown';

const getLocalTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function NativeAIProcessingIntro() {
  return (
    <SafeAreaView style={styles.aiIntroContainer}>
      <StatusBar style="light" />
      <View style={styles.aiIntroContent}>
        <View style={{ marginBottom: 20 }}>
          <AIProcessingAnimation width={260} height={260} />
        </View>
        <Text style={styles.aiIntroTitle}>OLYMPUS AI</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [showDailyIntro, setShowDailyIntro] = useState<boolean>(false);

  // Check stored 15-day persistent session & daily intro on App Launch
  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      // 1. Check persistent 15-day login session
      try {
        const session = await loadSession();
        if (session && session.token && isMounted) {
          setUserEmail(session.email);
          setAuthStep('authenticated');
        }
      } catch (err) {
        console.warn('[App] Error initializing session:', err);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }

      // 2. Check and run daily AI intro animation if not shown today
      const today = getLocalTodayString();
      try {
        const lastShown = await AsyncStorage.getItem(AI_INTRO_LAST_SHOWN_KEY);
        if (lastShown !== today) {
          if (isMounted) {
            setShowDailyIntro(true);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await AsyncStorage.setItem(AI_INTRO_LAST_SHOWN_KEY, today);
          if (isMounted) {
            setShowDailyIntro(false);
          }
        }
      } catch (e) {
        console.warn('AsyncStorage intro check failed:', e);
        if (isMounted) {
          setShowDailyIntro(false);
        }
      }
    }

    initApp();

    return () => {
      isMounted = false;
    };
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

  if (showDailyIntro) {
    return (
      <SafeAreaProvider>
        <NativeAIProcessingIntro />
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
  aiIntroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  aiIntroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  aiIntroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
});

