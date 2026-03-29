import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ChatInterface } from './pages/ChatInterface';
import { FeaturesPage } from './pages/Features';
import { PricingPage } from './pages/Pricing';
import { AboutPage } from './pages/About';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthCallback } from './pages/AuthCallback';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AccountPassword } from './pages/AccountPassword';
import { supabase } from './lib/supabase';

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111113] text-white">
      <p>Checking your session...</p>
    </div>
  );
}

const isPublicChatDemo = import.meta.env.VITE_PUBLIC_CHAT_DEMO === 'true';

function ProtectedRoute({
  session,
  isLoading,
  children,
}: {
  session: Session | null;
  isLoading: boolean;
  children: JSX.Element;
}) {
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({
  session,
  isLoading,
  children,
}: {
  session: Session | null;
  isLoading: boolean;
  children: JSX.Element;
}) {
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (session) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setIsAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) {
        return;
      }

      setSession(currentSession);
      setIsAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/chat"
          element={
            isPublicChatDemo ? (
              <ChatInterface />
            ) : (
              <ProtectedRoute session={session} isLoading={isAuthLoading}>
                <ChatInterface />
              </ProtectedRoute>
            )
          }
        />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute session={session} isLoading={isAuthLoading}>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute session={session} isLoading={isAuthLoading}>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/account/password"
          element={
            <ProtectedRoute session={session} isLoading={isAuthLoading}>
              <AccountPassword />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

