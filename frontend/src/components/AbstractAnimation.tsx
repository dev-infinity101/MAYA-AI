import React from 'react';

export function AbstractAnimation() {
  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center rounded-3xl overflow-hidden bg-[#0f0f0f] border border-[#3a3a3a] shadow-2xl">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
             style={{
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>
        </div>
        
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[rgba(74,222,128,0.3)] to-transparent absolute left-0 right-0 animate-[scan_4s_linear_infinite]" />
        </div>

        <style>
            {`
            @keyframes scan {
                0% { top: 0%; }
                100% { top: 100%; }
            }
            @keyframes float-crystal {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
            }
            `}
        </style>

        {/* Corner marks */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#3a3a3a] z-10"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#3a3a3a] z-10"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#3a3a3a] z-10"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#3a3a3a] z-10"></div>

        {/* Top label */}
        <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[#6b7a6b]">SPATIAL ANALYSIS GRID VA.0</span>
        </div>

        {/* Crystal 3D SVG visualization */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="animate-[float-crystal_6s_ease-in-out_infinite]" style={{ width: '65%', height: '65%', maxWidth: '400px' }}>
            <svg viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C4610A" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="transparent"/>
                </radialGradient>
                <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8cfba" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#c48a5c" stopOpacity="0.7"/>
                </linearGradient>
                <linearGradient id="facet2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d4a37b" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#8c4e20" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="facet3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ba8054" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="#ebcdb5" stopOpacity="0.5"/>
                </linearGradient>
                <linearGradient id="facet4" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#fdf6f0" stopOpacity="0.95"/>
                  <stop offset="100%" stopColor="#ab6d3d" stopOpacity="0.6"/>
                </linearGradient>
              </defs>

              {/* Ground plane */}
              <ellipse cx="200" cy="345" rx="90" ry="12" fill="#000" opacity="0.5"/>

              {/* Ambient glow */}
              <circle cx="200" cy="180" r="140" fill="url(#glow)"/>

              {/* Tall center crystal */}
              <polygon points="200,20 220,200 200,220 180,200" fill="url(#facet4)" opacity="0.95"/>
              <polygon points="200,20 220,200 240,210" fill="url(#facet1)" opacity="0.85"/>
              <polygon points="200,20 180,200 160,210" fill="url(#facet2)" opacity="0.75"/>
              <polygon points="200,20 200,220 240,210" fill="url(#facet3)" opacity="0.6"/>

              {/* Left tall crystal */}
              <polygon points="130,55 148,230 128,250 110,225" fill="url(#facet4)" opacity="0.8"/>
              <polygon points="130,55 148,230 165,240" fill="url(#facet1)" opacity="0.7"/>
              <polygon points="130,55 110,225 95,238" fill="url(#facet2)" opacity="0.65"/>

              {/* Right tall crystal */}
              <polygon points="270,65 250,240 270,255 290,230" fill="url(#facet4)" opacity="0.8"/>
              <polygon points="270,65 290,230 308,242" fill="url(#facet1)" opacity="0.7"/>
              <polygon points="270,65 250,240 235,248" fill="url(#facet2)" opacity="0.65"/>

              {/* Far left short crystal */}
              <polygon points="72,120 88,270 72,285 56,268" fill="url(#facet3)" opacity="0.6"/>
              <polygon points="72,120 88,270 104,278" fill="url(#facet1)" opacity="0.55"/>

              {/* Far right short crystal */}
              <polygon points="328,130 312,275 328,288 344,272" fill="url(#facet3)" opacity="0.6"/>
              <polygon points="328,130 344,272 358,280" fill="url(#facet1)" opacity="0.55"/>

              {/* Small accent crystals */}
              <polygon points="175,130 182,250 172,258 163,246" fill="url(#facet2)" opacity="0.5"/>
              <polygon points="225,140 232,255 225,262 218,252" fill="url(#facet2)" opacity="0.5"/>

              {/* Base reflection surface */}
              <polygon points="56,268 165,240 200,220 235,248 358,280 328,320 72,320" fill="#1a1a1a" opacity="0.6"/>
              <polygon points="56,268 165,240 200,220 235,248 358,280 328,295 72,295" fill="#222" opacity="0.4"/>

              {/* Subtle edge highlights */}
              <line x1="200" y1="20" x2="220" y2="200" stroke="#ffffff" strokeWidth="0.8" opacity="0.5"/>
              <line x1="200" y1="20" x2="180" y2="200" stroke="#ffffff" strokeWidth="0.8" opacity="0.4"/>
              <line x1="130" y1="55" x2="148" y2="230" stroke="#ffffff" strokeWidth="0.6" opacity="0.4"/>
              <line x1="270" y1="65" x2="250" y2="240" stroke="#ffffff" strokeWidth="0.6" opacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Bottom-right stream indicator */}
        <div className="absolute bottom-6 right-8 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
          <span className="font-mono text-[10px] tracking-widest text-[#6b7a6b]">REAL-TIME STREAM</span>
        </div>

        {/* Small data points */}
        <div className="absolute top-16 right-8 z-10 text-right">
          <p className="font-mono text-[10px] tracking-widest mb-1 text-[#404940]">SYS.STATUS</p>
          <p className="font-mono text-[9px] tracking-widest text-[#4ade80]">ACTIVE</p>
        </div>
        <div className="absolute bottom-16 left-8 z-10">
          <p className="font-mono text-[10px] tracking-widest mb-1 text-[#404940]">NODE.COUNT</p>
          <p className="font-mono text-[9px] tracking-widest text-[#888]">4 / 4</p>
        </div>
    </div>
  );
}
