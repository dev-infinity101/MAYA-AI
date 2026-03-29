import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import AuthLoginForm from '../components/ui/auth-login-form';
import { supabase } from '../lib/supabase';
import { getReadableAuthError } from '../lib/auth-errors';

export function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const showSocialLogin = import.meta.env.VITE_AUTH_ENABLE_SOCIAL === 'true';

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (!signInData.session) {
        throw new Error('No active session was created.');
      }

      navigate('/chat', { replace: true });
    } catch (error: any) {
      setAuthError(
        getReadableAuthError(error, {
          fallback: 'Failed to sign in.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setAuthError(null);
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden text-white font-sans">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,255,178,0.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(0,136,255,0.08),transparent_30%)]" />
      
      {/* Back Button */}
      <Link to="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm z-20">
        <ArrowLeft size={16} /> Back to Chat
      </Link>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,255,204,0.15)]">
            <Sparkles className="text-primary w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/95">Welcome back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to orchestrate your agents</p>
        </div>

        {/* Premium Glassmorphism Wrapper */}
        <div className="bg-[#0f0f0f]/80 border border-white/10 p-8 rounded-2xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            {authError && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-300">
                {authError}
              </div>
            )}
            <AuthLoginForm
              onSubmit={handleLogin}
              onSocialLogin={handleSocialLogin}
              isLoading={isLoading}
              showRememberMe={false}
              showSocialLogin={showSocialLogin}
            />
            <div className="mt-4 text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-6 text-sm text-white/40">
          Don't have an account? <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
