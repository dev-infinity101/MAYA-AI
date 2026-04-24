import React, { useState, useEffect } from 'react';

export type ThinkingMode = 'thinking' | 'web-search' | 'db-search' | 'agent-active';

// Default rotating status sets per agent
const DEFAULT_STATUS_SETS: Record<string, string[]> = {
  scheme: ['Scanning vectors', 'Querying database', 'Analyzing matches', 'Cross-referencing', 'Ranking relevance', 'Validating eligibility', 'Compiling results'],
  market: ['Gathering market data', 'Analyzing trends', 'Processing insights', 'Researching competitors', 'Synthesizing findings', 'Building report', 'Finalizing'],
  brand: ['Brainstorming concepts', 'Generating ideas', 'Refining identity', 'Testing narratives', 'Validating brand voice', 'Polishing messaging', 'Ready'],
  financial: ['Processing numbers', 'Analyzing financials', 'Building models', 'Forecasting scenarios', 'Calculating metrics', 'Validating assumptions', 'Generating insights'],
  default: ['Thinking', 'Analyzing query', 'Processing information', 'Consulting knowledge', 'Preparing insights', 'Refining response', 'Almost there']
};

const useRotatingStatus = (
  statuses: string[] | undefined,
  interval: number = 1500,
  isActive: boolean = true
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive || !statuses || statuses.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % statuses.length);
    }, interval);

    return () => clearInterval(timer);
  }, [statuses, interval, isActive]);

  // Reset index when statuses change or inactive
  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0);
    }
  }, [isActive]);

  return statuses?.[currentIndex] ?? '';
};

interface ThinkingIndicatorProps {
    className?: string;
    mode?: ThinkingMode;
}

// Neon green dot-pulse — replaces the wave for "thinking"
const DotPulse = () => (
    <div className="dot-pulse-wrap">
        <span className="dp dp1" />
        <span className="dp dp2" />
        <span className="dp dp3" />
    </div>
);

const WebSearch = () => (
    <div className="globe-wrap">
        <div className="globe">
            <div className="orbit" />
            <div className="orbit orbit-2" />
            <div className="center-dot" />
        </div>
    </div>
);

const AgentActive = () => (
    <div className="diamond-wrap">
        <div className="diamond" />
        <div className="diamond-pulse" />
    </div>
);

const DbSearch = () => (
    <div className="db-wrap">
        <span className="disk disk-1" />
        <span className="disk disk-2" />
        <span className="disk disk-3" />
    </div>
);

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
    className = '',
    mode = 'thinking'
}) => (
    <div className={`t-indicator ${className}`}>
        {mode === 'thinking'      && <DotPulse />}
        {mode === 'web-search'    && <WebSearch />}
        {mode === 'agent-active'  && <AgentActive />}
        {mode === 'db-search'     && <DbSearch />}

        <style>{`
        .t-indicator { display: inline-flex; align-items: center; gap: 8px; }

        /* ── DOT PULSE ── */
        .dot-pulse-wrap { display: flex; align-items: center; gap: 5px; }
        .dp {
            display: block;
            width: 7px; height: 7px;
            border-radius: 50%;
            background: #C4610A;
            box-shadow: 0 0 8px #C4610A, 0 0 16px rgba(196,97,10,.4);
            animation: dp-pulse 1.4s ease-in-out infinite;
        }
        .dp2 { animation-delay: .2s; }
        .dp3 { animation-delay: .4s; }
        @keyframes dp-pulse {
            0%, 80%, 100% { transform: scale(0.7); opacity: .4; }
            40%            { transform: scale(1.2); opacity: 1;  }
        }

        /* ── WEB SEARCH / GLOBE ── */
        .globe-wrap { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
        .globe {
            position: relative;
            width: 20px; height: 20px;
            border-radius: 50%;
            border: 2px solid rgba(196,97,10,.5);
            box-shadow: 0 0 12px rgba(196,97,10,.4), 0 0 20px rgba(245,166,35,.3);
        }
        .orbit {
            position: absolute; top: 50%; left: 50%;
            width: 100%; height: 100%;
            border-radius: 50%;
            border: 1.5px solid transparent;
            border-top-color: rgba(196,97,10,.9);
            border-bottom-color: rgba(245,166,35,.9);
            transform: translate(-50%,-50%) rotate(45deg);
            animation: spin 1.5s linear infinite;
            filter: drop-shadow(0 0 4px rgba(196,97,10,.6));
        }
        .orbit-2 {
            width: 70%; height: 70%;
            border-top-color: rgba(245,166,35,.9);
            border-bottom-color: rgba(245,166,35,.8);
            animation: spin-rev 2s linear infinite;
        }
        .center-dot {
            position: absolute; top: 50%; left: 50%;
            width: 4px; height: 4px;
            background: linear-gradient(135deg,#C4610A,#F5A623);
            border-radius: 50%;
            transform: translate(-50%,-50%);
            box-shadow: 0 0 8px rgba(196,97,10,.8), 0 0 12px rgba(245,166,35,.6);
            animation: pd 2s infinite;
        }
        @keyframes spin     { to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes pd {
            0%,100% { box-shadow: 0 0 8px rgba(196,97,10,.8), 0 0 12px rgba(245,166,35,.6); }
            50%      { box-shadow: 0 0 15px rgba(196,97,10,1),  0 0 20px rgba(245,166,35,.8); }
        }

        /* ── AGENT ACTIVE / DIAMOND ── */
        .diamond-wrap { position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
        .diamond {
            width: 14px; height: 14px;
            border: 2px solid rgba(196,97,10,.9);
            transform: rotate(45deg);
            box-shadow: 0 0 15px rgba(196,97,10,.5), 0 0 25px rgba(245,166,35,.3);
            animation: pb 2s infinite;
        }
        .diamond-pulse {
            position: absolute; top: 50%; left: 50%;
            width: 22px; height: 22px;
            border: 1.5px solid rgba(196,97,10,.5);
            transform: translate(-50%,-50%) rotate(45deg);
            animation: ef 2s infinite;
        }
        @keyframes pb {
            0%,100% { box-shadow: 0 0 15px rgba(196,97,10,.5), 0 0 25px rgba(245,166,35,.3); }
            50%      { box-shadow: 0 0 22px rgba(196,97,10,.8), 0 0 35px rgba(245,166,35,.5); }
        }
        @keyframes ef {
            0%   { width: 14px; height: 14px; opacity: 1; }
            100% { width: 30px; height: 30px; opacity: 0; }
        }

        /* ── DB SEARCH / DISKS ── */
        .db-wrap { position: relative; width: 18px; height: 20px; }
        .disk {
            position: absolute; left: 0;
            display: block;
            width: 100%; height: 6px;
            border-radius: 50%;
            border: 1.5px solid rgba(245,166,35,.7);
            animation: sl 2s infinite;
        }
        .disk-1 { bottom: 0;    animation-delay: 0s; }
        .disk-2 { bottom: 5px;  animation-delay: .3s; }
        .disk-3 { bottom: 10px; animation-delay: .6s; }
        @keyframes sl {
            0%,100% { border-color: rgba(245,166,35,.7); box-shadow: 0 0 6px rgba(245,166,35,.3); }
            50%      { border-color: rgba(245,166,35,1);  box-shadow: 0 0 14px rgba(245,166,35,.7); }
        }
        `}</style>
    </div>
);

/**
 * Thinking indicator + text label — simplified, no wave fill
 */
export const ThinkingWithText: React.FC<{
    text?: string;
    mode?: ThinkingMode;
    rotatingStatuses?: string[];
    statusInterval?: number;
    isActive?: boolean;
    agent?: keyof typeof DEFAULT_STATUS_SETS;
}> = ({
    text = 'Thinking',
    mode = 'thinking',
    rotatingStatuses,
    statusInterval = 1500,
    isActive = true,
    agent
}) => {
    // Use provided statuses, or fall back to agent-specific defaults, or use default set
    const statusSet = rotatingStatuses ?? DEFAULT_STATUS_SETS[agent ?? 'default'];
    const displayText = useRotatingStatus(statusSet, statusInterval, isActive);
    const finalText = displayText || text;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(196,97,10,0.25)',
            boxShadow: '0 0 18px rgba(196,97,10,0.08)',
            backdropFilter: 'blur(10px)',
        }}>
            <ThinkingIndicator mode={mode} />
            <span style={{
                fontSize: '13px',
                background: 'linear-gradient(135deg, #1C1007, #C4610A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'opacity 0.15s ease-out',
                opacity: isActive ? 1 : 0.6,
                minWidth: '80px' // Prevents layout shift during rotation
            }}>
                {finalText}
            </span>
        </div>
    );
};

/**
 * Hook for managing rotating status text independently
 * Useful for tying rotation to async operations/request lifecycle
 */
export const useStatusRotation = (
  agentType?: keyof typeof DEFAULT_STATUS_SETS,
  customStatuses?: string[],
  interval: number = 1500,
  isActive: boolean = true
) => {
  const statuses = customStatuses ?? DEFAULT_STATUS_SETS[agentType ?? 'default'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive || statuses.length <= 1) return;

    const timer = setInterval(() => {
      setIndex(i => (i + 1) % statuses.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, statuses.length, interval]);

  useEffect(() => {
    if (!isActive) setIndex(0);
  }, [isActive]);

  return {
    status: statuses[index],
    index,
    total: statuses.length,
    statuses
  };
};

/**
 * Configuration builder for agent-specific status rotation
 */
export const createAgentStatusConfig = (
  agentType: keyof typeof DEFAULT_STATUS_SETS,
  customStatuses?: string[]
) => ({
  agent: agentType,
  rotatingStatuses: customStatuses ?? DEFAULT_STATUS_SETS[agentType]
});

export default ThinkingIndicator;