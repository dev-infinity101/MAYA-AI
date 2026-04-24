import React, { useState, useEffect } from 'react';
import { Megaphone, Search, Shield, Zap } from 'lucide-react';

const agents = [
  { id: 'marketing', name: 'Marketing Strategist', desc: 'Campaigns & ROI' },
  { id: 'finance', name: 'Financial', desc: 'Pricing & Planning' },
  { id: 'compliance', name: 'Compliance', desc: 'Regulatory & Audit' },
  { id: 'scheme', name: 'Scheme Navigator', desc: 'Government Grants' }
];

export function AgentMonitor() {
  const [activeAgent, setActiveAgent] = useState('marketing');

  // Monitor HUD stats based on active agent
  const stats = {
    marketing: { cpu: '78%', mem: '2.4G', yld: '40%', vel: '2.4x' },
    finance: { cpu: '64%', mem: '1.8G', yld: '91%', vel: '1.8x' },
    compliance: { cpu: '92%', mem: '4.1G', yld: '100%', vel: '3.1x' },
    scheme: { cpu: '45%', mem: '1.2G', yld: '63%', vel: '1.2x' }
  };

  const activeStats = stats[activeAgent as keyof typeof stats];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Sidebar for Agents */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.id)}
            className={`group flex flex-col text-left p-6 rounded-2xl border transition-all duration-500 ${
              activeAgent === agent.id 
                ? 'bg-[#FEF8EE] border-[rgba(196,97,10,0.3)] shadow-[0_8px_32px_rgba(196,97,10,0.1)]' 
                : 'bg-white border-[rgba(196,97,10,0.1)] hover:border-[rgba(196,97,10,0.2)] hover:bg-[#FFFCF5]'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${activeAgent === agent.id ? 'bg-[#C4610A] animate-pulse' : 'bg-[#C4610A]/30'}`} />
              <span className={`font-display font-bold text-lg ${activeAgent === agent.id ? 'text-[#C4610A]' : 'text-text-primary'}`}>
                {agent.name}
              </span>
            </div>
            <p className="text-text-secondary text-sm pl-5">{agent.desc}</p>
          </button>
        ))}
      </div>

      {/* Right Monitor Panel */}
      <div className="w-full md:w-2/3 relative rounded-3xl overflow-hidden border border-[rgba(196,97,10,0.15)] bg-[#FFFCF5] shadow-[0_12px_48px_rgba(196,97,10,0.08)]">
        <style dangerouslySetInnerHTML={{__html: `
          .monitor-grid-bg {
            position: absolute; inset: 0; z-index: 0;
            background-image:
              linear-gradient(rgba(196,97,10,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(196,97,10,.05) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          .monitor-scanline {
            position: absolute; left: 0; right: 0; height: 2px; z-index: 9; pointer-events: none;
            background: linear-gradient(90deg, transparent, rgba(196,97,10,.15), transparent);
            animation: scan 4s linear infinite;
          }
          @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
          
          .hud-side-val { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #C4610A; font-weight: 600; }
          .hud-side-label { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: #8F4A48; letter-spacing: 0.1em; }
          
          .crystal-float { animation: float 6s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }
          
          .data-wave { stroke: #C4610A; stroke-width: 1.5; fill: none; stroke-dasharray: 600; stroke-dashoffset: 600; animation: dash 3s ease-out forwards; }
          @keyframes dash { to { stroke-dashoffset: 0; } }

          .data-ring { fill: none; stroke: rgba(196,97,10,0.2); animation: pulse-ring 2s infinite; }
          @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
          
          .data-dot { fill: #C4610A; opacity: 0; animation: fade-dot 1s forwards; }
          @keyframes fade-dot { to { opacity: 0.8; } }
        `}} />

        <div className="monitor-grid-bg" />
        <div className="monitor-scanline" />

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 border-b border-[rgba(196,97,10,0.1)] bg-gradient-to-b from-[#FEF8EE] to-transparent z-10">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4610A] animate-pulse" />
            <span className="font-mono text-[0.6rem] tracking-[0.15em] text-[#8F4A48] uppercase">SYS_ACTIVE • {activeAgent}</span>
          </div>
          <div className="font-mono text-[0.6rem] tracking-[0.15em] text-[#C4610A]">COORD: X:1094 Y:8832</div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-6 border-t border-[rgba(196,97,10,0.1)] bg-gradient-to-t from-[#FEF8EE] to-transparent z-10">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[#C4610A]" />
            <span className="font-mono text-[0.55rem] tracking-[0.15em] text-[#C4610A]">REAL-TIME STREAM</span>
          </div>
          <div className="font-mono text-[0.55rem] tracking-[0.15em] text-[#8F4A48]">LATENCY: 12ms | STATUS: OK</div>
        </div>

        {/* Left Data Strip */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-6 z-10">
          <div className="flex flex-col items-center"><span className="hud-side-label">CPU</span><span className="hud-side-val">{activeStats.cpu}</span></div>
          <div className="flex flex-col items-center"><span className="hud-side-label">MEM</span><span className="hud-side-val">{activeStats.mem}</span></div>
        </div>

        {/* Right Data Strip */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-6 z-10">
          <div className="flex flex-col items-center"><span className="hud-side-label">YLD</span><span className="hud-side-val">{activeStats.yld}</span></div>
          <div className="flex flex-col items-center"><span className="hud-side-label">VEL</span><span className="hud-side-val">{activeStats.vel}</span></div>
        </div>

        {/* Central Visualization Area */}
        <div className="absolute inset-0 flex items-center justify-center pt-8 pb-4 z-0 pointer-events-none">
          {activeAgent === 'marketing' && (
            <div className="crystal-float w-[280px] h-[280px]">
              <svg viewBox="0 0 400 360" width="100%" height="100%">
                <defs>
                  <linearGradient id="f1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C4610A" stopOpacity="0.8"/><stop offset="100%" stopColor="#8F4A48" stopOpacity="0.6"/></linearGradient>
                  <linearGradient id="f2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#C4610A" stopOpacity="0.6"/><stop offset="100%" stopColor="#FFFCF5" stopOpacity="0.4"/></linearGradient>
                  <linearGradient id="f3" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#FFFCF5" stopOpacity="0.9"/><stop offset="100%" stopColor="#C4610A" stopOpacity="0.5"/></linearGradient>
                  <radialGradient id="cg2" cx="50%" cy="80%" r="50%"><stop offset="0%" stopColor="#C4610A" stopOpacity="0.15"/><stop offset="100%" stopColor="transparent"/></radialGradient>
                </defs>
                <ellipse cx="200" cy="342" rx="88" ry="10" fill="#C4610A" opacity="0.1"/>
                <polygon points="200,18 220,192 200,214 180,192" fill="url(#f3)" opacity="0.9"/>
                <polygon points="200,18 220,192 244,206" fill="url(#f1)" opacity="0.8"/>
                <polygon points="200,18 180,192 156,206" fill="url(#f2)" opacity="0.7"/>
                <polygon points="128,52 146,224 128,242 108,218" fill="url(#f3)" opacity="0.8"/>
                <polygon points="128,52 146,224 170,234" fill="url(#f1)" opacity="0.7"/>
                <polygon points="272,62 252,228 272,246 294,222" fill="url(#f3)" opacity="0.8"/>
                <polygon points="272,62 294,222 314,234" fill="url(#f1)" opacity="0.7"/>
                <circle cx="200" cy="280" r="80" fill="url(#cg2)"/>
              </svg>
            </div>
          )}
          {activeAgent === 'finance' && (
            <svg viewBox="0 0 500 200" width="80%" height="100%" className="opacity-80">
              <path key={activeAgent} className="data-wave" d="M0,100 C100,50 150,150 250,100 C350,50 400,150 500,100" />
              <path key={activeAgent+"2"} className="data-wave" style={{animationDelay: '0.2s', strokeDasharray: 500, strokeOpacity: 0.5}} d="M0,120 C100,70 150,170 250,120 C350,70 400,170 500,120" />
              <path key={activeAgent+"3"} className="data-wave" style={{animationDelay: '0.4s', strokeDasharray: 500, strokeOpacity: 0.3}} d="M0,140 C100,90 150,190 250,140 C350,90 400,190 500,140" />
            </svg>
          )}
          {activeAgent === 'compliance' && (
            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
               <svg viewBox="0 0 200 200" width="100%" height="100%">
                 <circle cx="100" cy="100" r="40" className="data-ring" />
                 <circle cx="100" cy="100" r="60" className="data-ring" style={{animationDelay: '0.5s'}} />
                 <circle cx="100" cy="100" r="80" className="data-ring" style={{animationDelay: '1s'}} />
                 <circle cx="100" cy="100" r="20" fill="rgba(196,97,10,0.1)" />
                 <circle cx="100" cy="100" r="4" fill="#C4610A" />
               </svg>
            </div>
          )}
          {activeAgent === 'scheme' && (
            <div className="relative w-full h-full p-16">
              <svg width="100%" height="100%">
                {Array.from({length: 40}).map((_, i) => (
                  <circle 
                    key={`${activeAgent}-${i}`}
                    cx={`${Math.random() * 100}%`} 
                    cy={`${Math.random() * 100}%`} 
                    r={Math.random() * 3 + 1} 
                    className="data-dot" 
                    style={{animationDelay: `${Math.random() * 2}s`}} 
                  />
                ))}
                {Array.from({length: 15}).map((_, i) => (
                  <line 
                    key={`line-${activeAgent}-${i}`}
                    x1={`${Math.random() * 100}%`} y1={`${Math.random() * 100}%`}
                    x2={`${Math.random() * 100}%`} y2={`${Math.random() * 100}%`}
                    stroke="rgba(196,97,10,0.2)" strokeWidth="1"
                    className="data-dot"
                    style={{animationDelay: `${Math.random() * 2}s`}}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
