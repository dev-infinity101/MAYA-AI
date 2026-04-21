import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { LandingPage } from './pages/LandingPage';
import { ChatInterface } from './pages/ChatInterface';
import { FeaturesPage } from './pages/Features';
import { PricingPage } from './pages/Pricing';
import { AboutPage } from './pages/About';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import SettingsPage from './pages/SettingsPage';
import Dashboard from './pages/Dashboard';

/** Redirects unauthenticated users to /sign-in, preserving the intended destination. */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
    <>
        <SignedIn>{children}</SignedIn>
        <SignedOut><RedirectToSignIn /></SignedOut>
    </>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/"          element={<LandingPage />} />
                <Route path="/features"  element={<FeaturesPage />} />
                <Route path="/pricing"   element={<PricingPage />} />
                <Route path="/about"     element={<AboutPage />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Auth routes — Clerk hosted UI in our theme */}
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />

                {/* Protected — requires Clerk session */}
                <Route path="/chat" element={
                    <ProtectedRoute>
                        <ChatInterface />
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
