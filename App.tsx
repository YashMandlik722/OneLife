import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import VerifyOtpScreen from './src/screens/VerifyOtpScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { startForegroundSync, stopForegroundSync } from './src/services/activitySyncManager';

export default function App() {
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>('login');
  const [userEmail, setUserEmail] = useState('yash.mandlik@digivalet.com');

  useEffect(() => {
    if (authStep === 'authenticated') {
      startForegroundSync();
    } else {
      stopForegroundSync();
    }
  }, [authStep]);

  const handleSendOtp = (email: string) => {
    setUserEmail(email);
    setAuthStep('otp');
  };

  const handleVerifySuccess = () => {
    setAuthStep('authenticated');
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
  };

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
        <TabNavigator onSignOut={() => setAuthStep('login')} />
      )}
    </SafeAreaProvider>
  );
}

