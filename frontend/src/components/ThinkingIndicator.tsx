import React from 'react';

interface ThinkingIndicatorProps {
    className?: string;
}

/**
 * Mini Ambient Wave Indicator
 * Purpose: Show AI active/processing state in chat dashboard
 * Pure visual "thinking" indicator - not audio-driven
 */
export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ className = '' }) => {
    return (
        <div className={`thinking-indicator ${className}`}>
            <div className="ag-wave">
                <span className="wave-line wave-line-1"></span>
                <span className="wave-line wave-line-2"></span>
                <span className="wave-line wave-line-3"></span>
            </div>

            <style>{`
        .thinking-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .ag-wave {
          position: relative;
          width: 120px;
          height: 16px;
          overflow: hidden;
          animation: breathe 6s ease-in-out infinite;
        }

        .wave-line {
          position: absolute;
          top: 50%;
          left: 0;
          width: 200%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(6, 182, 212, 0.8),
            rgba(103, 232, 249, 0.9),
            rgba(168, 85, 247, 0.7),
            rgba(236, 72, 153, 0.6),
            transparent
          );
          opacity: 0.6;
          filter: blur(0.5px);
        }

        .wave-line-1 {
          transform: translateY(-4px);
          animation: drift-1 4s ease-in-out infinite;
        }

        .wave-line-2 {
          transform: translateY(0);
          animation: drift-2 5.5s ease-in-out infinite;
          opacity: 0.8;
        }

        .wave-line-3 {
          transform: translateY(4px);
          animation: drift-3 6.5s ease-in-out infinite;
          opacity: 0.5;
        }

        @keyframes drift-1 {
          0% {
            transform: translateX(-30%) translateY(-4px);
          }
          50% {
            transform: translateX(0%) translateY(-4px);
          }
          100% {
            transform: translateX(-30%) translateY(-4px);
          }
        }

        @keyframes drift-2 {
          0% {
            transform: translateX(-30%) translateY(0px);
          }
          50% {
            transform: translateX(0%) translateY(0px);
          }
          100% {
            transform: translateX(-30%) translateY(0px);
          }
        }

        @keyframes drift-3 {
          0% {
            transform: translateX(-30%) translateY(4px);
          }
          50% {
            transform: translateX(0%) translateY(4px);
          }
          100% {
            transform: translateX(-30%) translateY(4px);
          }
        }

        @keyframes breathe {
          0%, 100% { 
            opacity: 0.6; 
          }
          50% { 
            opacity: 1; 
          }
        }

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          .wave-line {
            background: linear-gradient(
              90deg,
              transparent,
              rgba(34, 211, 238, 0.7),
              rgba(147, 197, 253, 0.8),
              rgba(196, 181, 253, 0.6),
              transparent
            );
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .ag-wave,
          .wave-line {
            animation: none;
          }
          .wave-line {
            opacity: 0.7;
          }
        }
      `}</style>
        </div>
    );
};

/**
 * Alternative: Text version with indicator
 * Use this for inline "Thinking..." text with the wave
 */
export const ThinkingWithText: React.FC<{ text?: string }> = ({
    text = 'Thinking'
}) => {
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(6, 188, 212, 0.05)',
            border: '1px solid rgba(6, 212, 150, 0.1)'
        }}>
            <span style={{
                fontSize: '13px',
                color: 'rgba(148, 163, 184, 0.9)',
                fontWeight: 500
            }}>
                {text}
            </span>
            <ThinkingIndicator />
        </div>
    );
};

export default ThinkingIndicator;
