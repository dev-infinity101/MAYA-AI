import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,178,0.6)]",
    secondary: "bg-secondary text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,201,255,0.6)]",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-text-secondary hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const glowStyle = glow ? "shadow-[0_0_15px_rgba(0,255,178,0.3)]" : "";

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], glowStyle, className))}
      {...props}
    >
      {children}
    </button>
  );
}
