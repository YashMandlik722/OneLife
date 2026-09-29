/**
 * Authentication API Service
 * Handles OTP request & OTP verification according to OpenAPI specification.
 */

import { apiFetch, setAuthToken, ApiResponse } from './client';
import { User } from '../types/database';

/**
 * TOGGLE: Set to true for rapid dev/demo walkthroughs (bypasses static OTP 123456).
 * Set to false for strict production backend authentication.
 */
export const DEMO_MODE_BYPASS = true;

export interface RequestOtpResponseData {
  message?: string;
}

export interface VerifyOtpResponseData {
  token: string;
  user: User;
}

/**
 * Request a 6-digit login verification OTP
 * POST /api/v1/auth/request-otp
 */
export async function requestOtp(email: string): Promise<ApiResponse<RequestOtpResponseData>> {
  const result = await apiFetch<RequestOtpResponseData>('/api/v1/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  return result;
}

/**
 * Verify OTP and obtain JWT authentication token
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<ApiResponse<VerifyOtpResponseData>> {
  const result = await apiFetch<VerifyOtpResponseData>('/api/v1/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    }),
  });

  if (result.success && result.data && result.data.token) {
    // Save JWT token in memory client
    setAuthToken(result.data.token);
  }

  return result;
}
