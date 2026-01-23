import React from 'react';

export type ThinkingMode = 'thinking' | 'web-search' | 'db-search' | 'agent-active';

interface ThinkingIndicatorProps {
    className?: string;
    mode?: ThinkingMode;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
    className = '',
    mode = 'thinking'
}) => {
    
    // Default Wave Animation with enhanced glow
    const renderWave = () => (
        <div className="ag-wave">
            <span className="wave-line wave-line-1"></span>
            <span className="wave-line wave-line-2"></span>
            <span className="wave-line wave-line-3"></span>
        </div>
    );

    // Web Search Animation (Globe/Radar) with emerald glow
    const renderWebSearch = () => (
        <div className="web-search-anim">
            <div className="globe">
                <div className="orbit"></div>
                <div className="orbit orbit-2"></div>
                <div className="center-dot"></div>
            </div>
        </div>
    );

    // Agent Activated Animation (Diamond Pulse) with enhanced effects
    const renderAgentActive = () => (
        <div className="agent-active-anim">
            <div className="diamond-container">
                <div className="diamond"></div>
                <div className="diamond-pulse"></div>
            </div>
        </div>
    );

    // DB Search Animation (Stacked Disks) with cyan glow
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

        /* --- MODE: THINKING (WAVE) - Enhanced with Emerald/Cyan Gradients --- */
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
          height: 2.5px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(16, 185, 129, 0.95),
            rgba(6, 182, 212, 0.9),
            rgba(20, 184, 166, 0.85),
            rgba(52, 211, 153, 0.7),
            transparent
          );
          opacity: 0.7;
          filter: blur(0.5px);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4), 0 0 12px rgba(6, 182, 212, 0.2);
        }

        .wave-line-1 { 
          transform: translateY(-4px); 
          animation: drift-1 4s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        .wave-line-2 { 
          transform: translateY(0); 
          animation: drift-2 5.5s ease-in-out infinite; 
          opacity: 0.9;
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.6);
        }
        .wave-line-3 { 
          transform: translateY(4px); 
          animation: drift-3 6.5s ease-in-out infinite; 
          opacity: 0.6;
          box-shadow: 0 0 8px rgba(20, 184, 166, 0.4);
        }

        @keyframes drift-1 { 
          0% { transform: translateX(-30%) translateY(-4px); } 
          50% { transform: translateX(0%) translateY(-4px); } 
          100% { transform: translateX(-30%) translateY(-4px); } 
        }
        @keyframes drift-2 { 
          0% { transform: translateX(-30%) translateY(0px); } 
          50% { transform: translateX(0%) translateY(0px); } 
          100% { transform: translateX(-30%) translateY(0px); } 
        }
        @keyframes drift-3 { 
          0% { transform: translateX(-30%) translateY(4px); } 
          50% { transform: translateX(0%) translateY(4px); } 
          100% { transform: translateX(-30%) translateY(4px); } 
        }

        /* --- MODE: WEB SEARCH (Globe) - Enhanced with Emerald/Cyan --- */
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
            border: 2px solid rgba(16, 185, 129, 0.5);
            box-shadow: 0 0 12px rgba(16, 185, 148, 0.4), 0 0 20px rgba(6, 181, 212, 0.32);
            background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.1), transparent);
        }
        .orbit {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1.5px solid transparent;
            border-top-color: rgba(16, 185, 129, 0.9);
            border-bottom-color: rgba(6, 182, 212, 0.9);
            transform: translate(-50%, -50%) rotate(45deg);
            animation: spin 1.5s linear infinite;
            filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6));
        }
        .orbit-2 {
            width: 70%;
            height: 70%;
            border-top-color: rgba(6, 182, 212, 0.9);
            border-bottom-color: rgba(20, 184, 166, 0.8);
            animation: spin-reverse 2s linear infinite;
            filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.6));
        }
        .center-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.8), 0 0 12px rgba(6, 182, 212, 0.6);
            animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.8), 0 0 12px rgba(6, 182, 212, 0.6); }
          50% { box-shadow: 0 0 15px rgba(16, 185, 129, 1), 0 0 20px rgba(6, 182, 212, 0.8); }
        }
        @keyframes spin { 
          0% { transform: translate(-50%, -50%) rotate(0deg); } 
          100% { transform: translate(-50%, -50%) rotate(360deg); } 
        }
        @keyframes spin-reverse { 
          0% { transform: translate(-50%, -50%) rotate(0deg); } 
          100% { transform: translate(-50%, -50%) rotate(-360deg); } 
        }

        /* --- MODE: AGENT ACTIVE (Diamond) - Enhanced Emerald Glow --- */
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
            background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1));
            border: 2px solid rgba(16, 185, 129, 0.9);
            transform: rotate(45deg);
            box-shadow: 
              0 0 15px rgba(16, 185, 129, 0.5),
              0 0 25px rgba(6, 182, 212, 0.3),
              inset 0 0 10px rgba(16, 185, 129, 0.2);
            animation: pulse-border 2s infinite;
        }
        .diamond-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 140%;
            height: 140%;
            border: 1.5px solid rgba(16, 185, 129, 0.5);
            transform: translate(-50%, -50%) rotate(45deg);
            animation: expand-fade 2s infinite;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }
        @keyframes pulse-border { 
          0%, 100% { 
            border-color: rgba(16, 185, 129, 0.9); 
            box-shadow: 
              0 0 15px rgba(16, 185, 129, 0.5),
              0 0 25px rgba(6, 182, 212, 0.3),
              inset 0 0 10px rgba(16, 185, 129, 0.2);
          } 
          50% { 
            border-color: rgba(16, 185, 129, 1); 
            box-shadow: 
              0 0 20px rgba(16, 185, 129, 0.7),
              0 0 35px rgba(6, 182, 212, 0.5),
              inset 0 0 15px rgba(16, 185, 129, 0.3);
          } 
        }
        @keyframes expand-fade { 
          0% { 
            width: 100%; 
            height: 100%; 
            opacity: 1;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
          } 
          100% { 
            width: 200%; 
            height: 200%; 
            opacity: 0;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          } 
        }

        /* --- MODE: DB SEARCH (Stack) - Enhanced Cyan/Emerald --- */
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
            border: 1.5px solid rgba(6, 182, 212, 0.7);
            background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1));
            box-shadow: 
              0 0 8px rgba(6, 182, 212, 0.3),
              0 0 12px rgba(16, 185, 129, 0.2);
        }
        .disk-1 { 
          bottom: 0; 
          animation: stack-light 2s infinite 0s;
        }
        .disk-2 { 
          bottom: 5px; 
          animation: stack-light 2s infinite 0.3s;
        }
        .disk-3 { 
          bottom: 10px; 
          animation: stack-light 2s infinite 0.6s;
        }
        
        @keyframes stack-light {
            0%, 100% { 
              background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.1)); 
              border-color: rgba(6, 182, 212, 0.7);
              box-shadow: 
                0 0 8px rgba(6, 182, 212, 0.3),
                0 0 12px rgba(16, 185, 129, 0.2);
            }
            50% { 
              background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.5), rgba(6, 182, 212, 0.3)); 
              border-color: rgba(6, 182, 212, 1);
              box-shadow: 
                0 0 15px rgba(6, 182, 212, 0.6),
                0 0 20px rgba(16, 185, 129, 0.4);
            }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

/**
 * Enhanced Text version with futuristic styling
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
            padding: '10px 18px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(16, 185, 129, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background glow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1), transparent 70%)',
                animation: 'glow-move 4s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            
            <ThinkingIndicator mode={mode} />
            <span style={{
                position: 'relative',
                fontSize: '13px',
                background: 'linear-gradient(135deg, #e2e8f0, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                letterSpacing: '0.02em'
            }}>
                {text}
            </span>

            <style>{`
              @keyframes glow-move {
                0%, 100% { transform: translateX(-20%); }
                50% { transform: translateX(20%); }
              }
            `}</style>
        </div>
    );
};

export default ThinkingIndicator;