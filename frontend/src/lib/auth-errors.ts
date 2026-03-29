type AuthErrorLike = {
  code?: string | number;
  status?: number;
  error_code?: string;
  message?: string;
  msg?: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';

function getAuthCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

function getProviderSetupHint(provider: 'google' | 'github') {
  const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
  const supabaseCallback = supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : 'YOUR_SUPABASE_URL/auth/v1/callback';

  return `${providerLabel} sign-in is not enabled in this Supabase project yet. Enable ${providerLabel} in Supabase Dashboard -> Authentication -> Providers, add its client ID and secret, and allow these redirect URLs: ${supabaseCallback} and ${getAuthCallbackUrl()}.`;
}

export function getReadableAuthError(
  error: AuthErrorLike | null | undefined,
  options?: { provider?: 'google' | 'github'; fallback?: string }
) {
  const fallback = options?.fallback || 'Authentication failed. Please try again.';
  const rawMessage = error?.message || error?.msg || '';
  const normalizedMessage = rawMessage.trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  if (
    options?.provider &&
    ((String(error?.code || '') === '400' && error?.error_code === 'validation_failed') ||
      lowerMessage.includes('unsupported provider') ||
      lowerMessage.includes('provider is not enabled'))
  ) {
    return getProviderSetupHint(options.provider);
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Your email is not verified yet. Check your inbox, confirm your email, and then sign in.';
  }

  if (lowerMessage.includes('invalid login credentials')) {
    return 'The email or password is incorrect. Please check both and try again.';
  }

  if (lowerMessage.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (lowerMessage.includes('password should be at least')) {
    return normalizedMessage;
  }

  return normalizedMessage || fallback;
}

export function getProviderSetupMessage(provider: 'google' | 'github') {
  return getProviderSetupHint(provider);
}
