import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import VerifyOtpScreen from './src/screens/VerifyOtpScreen';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>('login');
  const [userEmail, setUserEmail] = useState('jon.doe@example.com');

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
    <>
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
    </>
  );
}
