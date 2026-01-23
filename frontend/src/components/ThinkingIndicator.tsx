import React from 'react';

export type ThinkingMode = 'thinking' | 'web-search' | 'db-search' | 'agent-active';

interface ThinkingIndicatorProps {
    className?: string;
    mode?: ThinkingMode;
}

/**
 * Enhanced Thinking Indicator
 * Supports multiple modes:
 * - thinking: Standard wave
 * - web-search: Rotating globe/radar
 * - db-search: Database scanning
 * - agent-active: Pulsing activation badge
 */
export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
    className = '',
    mode = 'thinking'
}) => {
    
    // Default Wave Animation
    const renderWave = () => (
        <div className="ag-wave">
            <span className="wave-line wave-line-1"></span>
            <span className="wave-line wave-line-2"></span>
            <span className="wave-line wave-line-3"></span>
        </div>
    );

    // Web Search Animation (Globe/Radar)
    const renderWebSearch = () => (
        <div className="web-search-anim">
            <div className="globe">
                <div className="orbit"></div>
                <div className="orbit orbit-2"></div>
                <div className="center-dot"></div>
            </div>
        </div>
    );

    // Agent Activated Animation (Diamond Pulse)
    const renderAgentActive = () => (
        <div className="agent-active-anim">
            <div className="diamond-container">
                <div className="diamond"></div>
                <div className="diamond-pulse"></div>
            </div>
        </div>
    );

    // DB Search Animation (Stacked Disks)
    const renderDbSearch = () => (
        <div className="db-search-anim">
             <div className="db-stack">
                <span className="disk disk-1"></span>
                <span className="disk disk-2"></span>
                <span className="disk disk-3"></span>
             </div>
        </div>
    );

    return (
        <div className={`thinking-indicator ${mode} ${className}`}>
            {mode === 'thinking' && renderWave()}
            {mode === 'web-search' && renderWebSearch()}
            {mode === 'agent-active' && renderAgentActive()}
            {mode === 'db-search' && renderDbSearch()}

            <style>{`
        .thinking-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* --- MODE: THINKING (WAVE) --- */
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
            rgba(6, 181, 212, 0.95),
            rgba(103, 232, 249, 0.9),
            rgba(168, 85, 247, 0.7),
            rgba(236, 72, 153, 0.6),
            transparent
          );
          opacity: 0.6;
          filter: blur(0.5px);
        }

        .wave-line-1 { transform: translateY(-4px); animation: drift-1 4s ease-in-out infinite; }
        .wave-line-2 { transform: translateY(0); animation: drift-2 5.5s ease-in-out infinite; opacity: 0.8; }
        .wave-line-3 { transform: translateY(4px); animation: drift-3 6.5s ease-in-out infinite; opacity: 0.5; }

        @keyframes drift-1 { 0% { transform: translateX(-30%) translateY(-4px); } 50% { transform: translateX(0%) translateY(-4px); } 100% { transform: translateX(-30%) translateY(-4px); } }
        @keyframes drift-2 { 0% { transform: translateX(-30%) translateY(0px); } 50% { transform: translateX(0%) translateY(0px); } 100% { transform: translateX(-30%) translateY(0px); } }
        @keyframes drift-3 { 0% { transform: translateX(-30%) translateY(4px); } 50% { transform: translateX(0%) translateY(4px); } 100% { transform: translateX(-30%) translateY(4px); } }

        /* --- MODE: WEB SEARCH (Globe) --- */
        .web-search-anim {
            width: 24px;
            height: 24px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .globe {
            position: relative;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1.5px solid rgba(6, 182, 212, 0.4);
            box-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
        }
        .orbit {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1px solid transparent;
            border-top-color: rgba(6, 182, 212, 0.9);
            border-bottom-color: rgba(6, 182, 212, 0.9);
            transform: translate(-50%, -50%) rotate(45deg);
            animation: spin 1.5s linear infinite;
        }
        .orbit-2 {
            width: 70%;
            height: 70%;
            border-top-color: rgba(168, 85, 247, 0.8);
            border-bottom-color: rgba(168, 85, 247, 0.8);
            animation: spin-reverse 2s linear infinite;
        }
        .center-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 5px white;
        }
        @keyframes spin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spin-reverse { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(-360deg); } }

        /* --- MODE: AGENT ACTIVE (Diamond) --- */
        .agent-active-anim {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .diamond-container {
            position: relative;
            width: 16px;
            height: 16px;
        }
        .diamond {
            width: 100%;
            height: 100%;
            background: rgba(16, 185, 129, 0.2);
            border: 1.5px solid rgba(16, 185, 129, 0.8);
            transform: rotate(45deg);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
            animation: pulse-border 2s infinite;
        }
        .diamond-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 140%;
            height: 140%;
            border: 1px solid rgba(16, 185, 129, 0.4);
            transform: translate(-50%, -50%) rotate(45deg);
            animation: expand-fade 2s infinite;
        }
        @keyframes pulse-border { 0%, 100% { border-color: rgba(16, 185, 129, 0.8); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); } 50% { border-color: rgba(16, 185, 129, 1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); } }
        @keyframes expand-fade { 0% { width: 100%; height: 100%; opacity: 1; } 100% { width: 200%; height: 200%; opacity: 0; } }

        /* --- MODE: DB SEARCH (Stack) --- */
        .db-search-anim {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .db-stack {
            position: relative;
            width: 18px;
            height: 20px;
        }
        .disk {
            position: absolute;
            left: 0;
            width: 100%;
            height: 6px;
            border-radius: 50%;
            border: 1px solid rgba(196, 181, 253, 0.6);
            background: rgba(196, 181, 253, 0.1);
            box-shadow: 0 0 5px rgba(196, 181, 253, 0.1);
        }
        .disk-1 { bottom: 0; animation: stack-light 2s infinite 0s; }
        .disk-2 { bottom: 5px; animation: stack-light 2s infinite 0.3s; }
        .disk-3 { bottom: 10px; animation: stack-light 2s infinite 0.6s; }
        
        @keyframes stack-light {
            0%, 100% { background: rgba(196, 181, 253, 0.1); border-color: rgba(196, 181, 253, 0.6); }
            50% { background: rgba(196, 181, 253, 0.4); border-color: rgba(196, 181, 253, 1); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

/**
 * Alternative: Text version with indicator
 * Use this for inline "Thinking..." text with the wave
 */
export const ThinkingWithText: React.FC<{ 
    text?: string;
    mode?: ThinkingMode;
}> = ({
    text = 'Thinking',
    mode = 'thinking'
}) => {
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '12px',
            background: 'rgba(33, 33, 33, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)'
        }}>
            <ThinkingIndicator mode={mode} />
            <span style={{
                fontSize: '13px',
                color: 'rgba(226, 232, 240, 0.9)',
                fontWeight: 500,
                letterSpacing: '0.01em'
            }}>
                {text}
            </span>
        </div>
    );
};

export default ThinkingIndicator;
