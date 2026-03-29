import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getReadableAuthError } from '../lib/auth-errors';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage('Check your email for a password reset link.');
    } catch (authError: any) {
      setError(
        getReadableAuthError(authError, {
          fallback: 'Failed to send reset email.',
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
            <h1 className="text-2xl font-semibold text-white">Reset password</h1>
            <p className="text-sm text-white/45">We will email you a secure reset link.</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Mail size={16} className="text-white/40" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full bg-transparent text-white outline-none placeholder:text-white/25"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00ffcc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
