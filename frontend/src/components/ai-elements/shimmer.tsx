import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Shimmer — animated gradient text effect used for "Thinking..." label
 * while the reasoning component is streaming.
 */
export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  className,
  duration = 1.5,
}) => {
  return (
    <span
      className={cn("inline-block relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(
          90deg,
          rgba(191,191,191,0.5) 0%,
          rgba(255,255,255,1) 40%,
          rgba(191,191,191,0.5) 60%
        )`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: `shimmer-sweep ${duration}s linear infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes shimmer-sweep {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  );
};
