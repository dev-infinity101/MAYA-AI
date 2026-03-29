"use client";

import { Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { Checkbox } from "./checkbox";

// Add global styles for placeholder text
const globalStyles = `
  .enterprise-input::placeholder {
    color: #6B7280 !important;
  }
`;

export interface SocialProvider {
  id: 'google' | 'github';
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface AuthSignupFormProps {
  onSubmit?: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => void;
  onSocialLogin?: (provider: 'google' | 'github') => void;
  socialProviders?: SocialProvider[];
  showSocialLogin?: boolean;
  className?: string;
  isLoading?: boolean;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  };
  termsUrl?: string;
  privacyUrl?: string;
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1-1.265.06a6 6 0 1 0 2.103 6.836l.001-.004h-3.66a1 1 0 0 1-.992-.883L13 13v-2a1 1 0 0 1 1-1h6.945a1 1 0 0 1 .994.89q.06.55.061 1.11c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2"
      fill="currentColor"
    />
  </svg>
);

const DEFAULT_SOCIAL_PROVIDERS: SocialProvider[] = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: Github },
];

export default function AuthSignupForm({
  onSubmit,
  onSocialLogin,
  socialProviders = DEFAULT_SOCIAL_PROVIDERS,
  showSocialLogin = true,
  className,
  isLoading = false,
  termsUrl = "#",
  privacyUrl = "#",
}: AuthSignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword || !acceptTerms) {
        return;
      }

      onSubmit?.({
        fullName: name.trim(),
        email: email.trim(),
        password,
      });
    },
    [name, email, password, confirmPassword, acceptTerms, onSubmit]
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div 
        className={cn("w-full max-w-xs mx-auto rounded-xl border shadow-2xl", className)} 
        style={{ 
          backgroundColor: '#1C1C1F',
          borderColor: '#2A2A2E',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          borderRadius: '14px'
        }}
      >
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#FFFFFF' }}>
            Create an account
          </h1>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            Enter your information to get started
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Social Login Buttons */}
        {showSocialLogin && socialProviders.length > 0 && (
          <div className="space-y-2">
            {socialProviders.map((provider) => {
              const Icon = provider.icon;
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSocialLogin?.(provider.id);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm"
                  style={{
                    background: 'transparent',
                    border: '1px solid #2A2A2E',
                    color: '#FFFFFF',
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F1F23';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#6B7280', opacity: 0.7 }} />
                  Continue with {provider.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Separator */}
        {showSocialLogin && socialProviders.length > 0 && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div 
                className="w-full border-t" 
                style={{ borderColor: '#2A2A2E', opacity: 0.6 }}
              ></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span 
                className="px-2" 
                style={{ 
                  backgroundColor: '#1C1C1F',
                  color: '#6B7280'
                }}
              >
                Or continue with email
              </span>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Full name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe..."
              className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none enterprise-input"
              style={{
                background: '#18181B',
                border: '1px solid #2A2A2E',
                borderRadius: '10px',
                color: '#E5E7EB'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2A2A2E';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Email <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com..."
              className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none enterprise-input"
              style={{
                background: '#18181B',
                border: '1px solid #2A2A2E',
                borderRadius: '10px',
                color: '#E5E7EB'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2A2A2E';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password..."
                className="w-full px-3 pr-10 py-2.5 rounded-lg text-sm transition-all focus:outline-none enterprise-input"
                style={{
                  background: '#18181B',
                  border: '1px solid #2A2A2E',
                  borderRadius: '10px',
                  color: '#E5E7EB'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2A2A2E';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                style={{ color: '#6B7280', opacity: 0.7 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
              Confirm password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password..."
                className="w-full px-3 pr-10 py-2.5 rounded-lg text-sm transition-all focus:outline-none enterprise-input"
                style={{
                  background: '#18181B',
                  border: '1px solid #2A2A2E',
                  borderRadius: '10px',
                  color: '#E5E7EB'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2A2A2E';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                style={{ color: '#6B7280', opacity: 0.7 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="mt-1 data-[state=checked]:border-blue-600"
              style={{
                border: '1px solid #2A2A2E',
                background: 'transparent'
              }}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed" style={{ color: '#E5E7EB' }}>
              I agree to the{" "}
              <a
                href={termsUrl}
                className="underline hover:no-underline transition-colors"
                style={{ color: '#60A5FA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60A5FA';
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href={privacyUrl}
                className="underline hover:no-underline transition-colors"
                style={{ color: '#60A5FA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60A5FA';
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <span style={{ color: '#EF4444' }}>*</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          style={{
            background: '#F3F4F6',
            color: '#0A0A0A',
            borderRadius: '10px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#E5E7EB';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#F3F4F6';
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </div>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      </div>
      </div>
    </>
  );
}
