import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar as StatusBarNative,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { verifyOtp, requestOtp, DEMO_MODE_BYPASS } from '../api/auth';
import { getFriendlyErrorMessage } from '../utils/errorFormatter';

interface VerifyOtpScreenProps {
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
}

export default function VerifyOtpScreen({
  email = 'yash.mandlik@digivalet.com',
  onVerifySuccess,
  onBack,
}: VerifyOtpScreenProps) {
  // Pre-filled 6-digit OTP boxes for rapid demo testing
  const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (error) setError('');
    if (infoMessage) setInfoMessage('');

    // Auto focus next box
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, fullCode);
      setLoading(false);

      if (res.success && res.data?.token) {
        onVerifySuccess();
      } else {
        if (DEMO_MODE_BYPASS) {
          console.warn('[DemoMode] OTP verification non-success, proceeding in demo mode:', res.message);
          onVerifySuccess();
        } else {
          const friendlyError = getFriendlyErrorMessage(res.message, undefined, 'verify');
          setError(friendlyError);
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (DEMO_MODE_BYPASS) {
        console.warn('[DemoMode] Network error in verifyOtp, proceeding in demo mode:', err?.message);
        onVerifySuccess();
      } else {
        const friendlyError = getFriendlyErrorMessage(err?.message, undefined, 'verify');
        setError(friendlyError);
      }
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setInfoMessage('');
    try {
      const res = await requestOtp(email);
      setResending(false);
      if (res.success) {
        setInfoMessage('A new 6-digit OTP code has been sent to your email.');
      } else {
        const friendlyError = getFriendlyErrorMessage(res.message, undefined, 'login');
        setError(friendlyError);
      }
    } catch (err: any) {
      setResending(false);
      const friendlyError = getFriendlyErrorMessage(err?.message, undefined, 'login');
      setError(friendlyError);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify one-time code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpBox}>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading ? { opacity: 0.7 } : null]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textDark} />
            ) : (
              <>
                <Text style={styles.buttonText}>Verify & log in</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.textDark} style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendOtp}
            disabled={resending}
            activeOpacity={0.7}
          >
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {resending ? (
              <ActivityIndicator size="small" color={colors.accentGreen} />
            ) : (
              <Text style={styles.resendLink}>Resend OTP</Text>
            )}
          </TouchableOpacity>

          {/* Callout */}
          <View style={styles.demoCallout}>
            <Ionicons name="mail-unread-outline" size={18} color={colors.accentGreen} />
            <Text style={styles.demoText}>
              Enter the 6-digit OTP code received in your email inbox.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },


  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.accentGreen,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  otpInput: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    color: colors.accentGreen,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.accentGreen,
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  resendLink: {
    color: colors.accentGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  demoCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  demoText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  demoBold: {
    color: colors.accentGreen,
    fontWeight: '700',
  },
  codeText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
