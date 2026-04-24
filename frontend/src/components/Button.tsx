import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:   "bg-primary text-white hover:bg-primary-light shadow-[0_4px_16px_rgba(196,97,10,0.25)] hover:shadow-[0_4px_20px_rgba(196,97,10,0.35)]",
    secondary: "bg-surface-warm text-text-primary border border-[rgba(196,97,10,0.15)] hover:bg-[#FDE8C0] hover:border-primary/25",
    outline:   "border border-primary text-primary hover:bg-primary/8",
    ghost:     "text-text-secondary hover:text-text-primary hover:bg-surface-warm",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
