/**
 * Formats API or Network errors into polished, human-friendly UI error messages.
 */

export function getFriendlyErrorMessage(
  rawError?: string | null,
  statusCode?: number,
  context?: 'login' | 'verify' | 'general'
): string {
  if (!rawError && !statusCode) {
    return 'An unexpected error occurred. Please try again.';
  }

  const msg = (rawError || '').toLowerCase();

  // Network & Connectivity Errors
  if (
    msg.includes('network error') ||
    msg.includes('failed to fetch') ||
    msg.includes('econnrefused') ||
    msg.includes('abort') ||
    msg.includes('timeout')
  ) {
    return 'Unable to connect to server. Please check your network connection and try again.';
  }

  // Rate Limiting (429)
  if (statusCode === 429 || msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many request attempts. Please wait a minute before trying again.';
  }

  // Authentication Context: Request OTP (Login)
  if (context === 'login') {
    if (msg.includes('invalid email') || msg.includes('missing email') || statusCode === 400) {
      return 'Please enter a valid corporate email address.';
    }
    if (msg.includes('not found') || statusCode === 404) {
      return 'No account was found with this email address. Please check your typing or contact your administrator.';
    }
    if (msg.includes('already exists') || statusCode === 409) {
      return 'An account with this email address is already registered.';
    }
  }

  // Authentication Context: Verify OTP
  if (context === 'verify') {
    if (
      msg.includes('invalid') ||
      msg.includes('expired') ||
      statusCode === 401 ||
      statusCode === 400
    ) {
      return 'The code you entered is invalid or has expired. Please check your code or tap "Resend OTP".';
    }
    if (msg.includes('missing') || msg.includes('otp')) {
      return 'Please enter all 6 digits of your verification code.';
    }
  }

  // Server Errors (500, 502, 503)
  if (statusCode && statusCode >= 500) {
    return 'Our servers are experiencing technical difficulties. Please try again shortly.';
  }

  // Return cleaned original message if readable, otherwise fallback
  if (rawError && rawError.length < 100 && !rawError.includes('{')) {
    // Capitalize first letter cleanly
    return rawError.charAt(0).toUpperCase() + rawError.slice(1);
  }

  return 'Something went wrong. Please try again.';
}
