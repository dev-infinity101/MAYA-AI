import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthSignupForm from '../components/ui/auth-signup-form';
import { getReadableAuthError } from '../lib/auth-errors';

type SignupData = {
  fullName: string;
  email: string;
  password: string;
};

export function Signup() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const showSocialLogin = import.meta.env.VITE_AUTH_ENABLE_SOCIAL === 'true';

  const handleSignUp = async (data: SignupData) => {
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (signUpData.session) {
        navigate('/chat');
        return;
      }

      setAuthMessage('Check your email to verify your account, then sign in.');
    } catch (error: any) {
      setAuthError(
        getReadableAuthError(error, {
          fallback: 'Failed to create account.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setAuthError(
        getReadableAuthError(error, {
          provider,
          fallback: `Failed to sign in with ${provider}.`,
        })
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#111113] overflow-hidden text-white font-sans p-4">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_32%)]" />

      <Link
        to="/"
        className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm z-20"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(0,255,150,0.15)]">
            <Sparkles className="text-emerald-400 w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white/95">Join MAYA-AI</h1>
          <p className="text-white/40 mt-1 text-xs">Start scaling your business with AI</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-xs text-center">
            {authError}
          </div>
        )}

        {authMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-md text-emerald-300 text-xs text-center">
            {authMessage}
          </div>
        )}

        <AuthSignupForm
          onSubmit={handleSignUp}
          onSocialLogin={handleSocialSignUp}
          isLoading={isLoading}
          showSocialLogin={showSocialLogin}
        />

        <p className="text-center mt-5 text-xs text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
