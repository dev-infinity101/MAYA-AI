import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getReadableAuthError } from '../lib/auth-errors';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>('Verifying reset link...');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const prepareRecovery = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const providerError = queryParams.get('error_description') || hashParams.get('error_description');

      if (providerError) {
        setError(providerError);
        setMessage(null);
        return;
      }

      const authCode = queryParams.get('code');
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
          setError(getReadableAuthError(error, { fallback: 'Recovery link is invalid or expired.' }));
          setMessage(null);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setError(getReadableAuthError(error, { fallback: 'Recovery link is invalid or expired.' }));
        setMessage(null);
        return;
      }

      setMessage(null);
      setIsReady(true);
    };

    void prepareRecovery();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      setMessage('Password updated successfully. Redirecting to chat...');
      setTimeout(() => navigate('/chat', { replace: true }), 1000);
    } catch (authError: any) {
      setError(
        getReadableAuthError(authError, {
          fallback: 'Failed to update password.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111113] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Choose a new password</h1>
            <p className="text-sm text-white/45">Use a strong password you have not used before.</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

        {isReady && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                label: 'New password',
                value: password,
                setter: setPassword,
                shown: showPassword,
                toggle: () => setShowPassword((prev) => !prev),
              },
              {
                label: 'Confirm password',
                value: confirmPassword,
                setter: setConfirmPassword,
                shown: showConfirmPassword,
                toggle: () => setShowConfirmPassword((prev) => !prev),
              },
            ].map((field) => (
              <label key={field.label} className="block">
                <span className="mb-2 block text-sm text-white/70">{field.label}</span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <KeyRound size={16} className="text-white/40" />
                  <input
                    value={field.value}
                    onChange={(event) => field.setter(event.target.value)}
                    type={field.shown ? 'text' : 'password'}
                    required
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {field.shown ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00ffcc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
