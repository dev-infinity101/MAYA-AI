import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/api';
import { getProviderSetupMessage, getReadableAuthError } from '../lib/auth-errors';

export function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const finishAuth = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const providerError = queryParams.get('error_description') || hashParams.get('error_description');
      const providerName = (queryParams.get('provider') || hashParams.get('provider') || '').toLowerCase();
      const provider =
        providerName === 'google' || providerName === 'github'
          ? providerName
          : undefined;

      if (providerError) {
        const lowerError = providerError.toLowerCase();
        if (
          provider &&
          (lowerError.includes('unsupported provider') || lowerError.includes('provider is not enabled'))
        ) {
          setMessage(getProviderSetupMessage(provider));
        } else {
          setMessage(providerError);
        }
        return;
      }

      const authCode = queryParams.get('code');
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
          setMessage(
            getReadableAuthError(error, {
              provider,
              fallback: 'Failed to complete sign-in.',
            })
          );
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setMessage(
          getReadableAuthError(error, {
            provider,
            fallback: 'No active session found.',
          })
        );
        return;
      }

      setMessage('Verifying backend session...');

      try {
        await chatService.getProfile();
        navigate('/chat', { replace: true });
      } catch (backendError: any) {
        setMessage(
          backendError?.response?.data?.detail ||
            backendError?.message ||
            'Signed in, but backend verification failed.'
        );
      }
    };

    finishAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#111113]">
      <p>{message}</p>
    </div>
  );
}
