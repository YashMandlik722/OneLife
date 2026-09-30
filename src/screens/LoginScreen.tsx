import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';


import { requestOtp } from '../api/auth';
import { getFriendlyErrorMessage } from '../utils/errorFormatter';

interface LoginScreenProps {
  onSendOtp: (email: string) => void;
}

export default function LoginScreen({ onSendOtp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await requestOtp(email);
      setLoading(false);

      if (res.success) {
        onSendOtp(email);
      } else {
        const friendlyError = getFriendlyErrorMessage(res.message, undefined, 'login');
        setError(friendlyError);
      }
    } catch (err: any) {
      setLoading(false);
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
          {/* Logo / Badge */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/OneLifeInAppLogo.png')}
              style={styles.loginInAppLogo}
              resizeMode="contain"
            />
          </View>


          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sign-in with email</Text>
            <Text style={styles.subtitle}>
              Enter your corporate email address to receive a secure one-time verification code.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Work Email</Text>
            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                placeholder="user@digivalet.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading ? { opacity: 0.7 } : null]}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textDark} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.textDark} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Callout */}

          {/* <View style={styles.demoCallout}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.accentGreen} />
            <Text style={styles.demoText}>
              <Text style={styles.demoBold}>Secure Login: </Text>OTP verification required
            </Text>
          </View> */}

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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginInAppLogo: {
    width: 100,
    height: 100,
  },

  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentGreenGlow,
    top: -8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
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
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.accentGreen,
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
});
