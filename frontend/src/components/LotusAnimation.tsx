import React from 'react';

export function LotusAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <style>{`
        @keyframes petal-open {
          0%, 100% { transform-origin: bottom center; transform: rotate(var(--r-closed)) scaleY(0.72); opacity: 0.72; }
          45%, 60% { transform-origin: bottom center; transform: rotate(var(--r-open)) scaleY(1); opacity: 1; }
        }
        @keyframes center-glow-pulse {
          0%, 100% { opacity: 0.18; r: 22; }
          45%, 60% { opacity: 0.72; r: 34; }
        }
        @keyframes outer-glow-pulse {
          0%, 100% { opacity: 0; r: 60; }
          45%, 60% { opacity: 0.22; r: 90; }
        }
        @keyframes lotus-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .lotus-wrap {
          animation: lotus-float 5s ease-in-out infinite;
        }
        .petal { animation: petal-open 5s ease-in-out infinite; }
        .p1 { --r-closed: -38deg; --r-open: -20deg; animation-delay: 0s; }
        .p2 { --r-closed: -14deg; --r-open: -5deg;  animation-delay: 0s; }
        .p3 { --r-closed: 14deg;  --r-open: 5deg;   animation-delay: 0s; }
        .p4 { --r-closed: 38deg;  --r-open: 20deg;  animation-delay: 0s; }
        .pb1 { --r-closed: -60deg; --r-open: -38deg; animation-delay: 0s; }
        .pb2 { --r-closed: 60deg;  --r-open: 38deg;  animation-delay: 0s; }
        .cg { animation: center-glow-pulse 5s ease-in-out infinite; }
        .og { animation: outer-glow-pulse 5s ease-in-out infinite; }
      `}</style>

      {/* Ambient background glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '340px', height: '340px',
          background: 'radial-gradient(circle, rgba(196,97,10,0.13) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="lotus-wrap" style={{ width: '260px', height: '260px', position: 'relative' }}>
        <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" width="260" height="260" overflow="visible">
          <defs>
            <radialGradient id="lp-petal-grad" cx="50%" cy="90%" r="80%">
              <stop offset="0%" stopColor="#f7a855" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#C4610A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7a3300" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="lp-petal-back" cx="50%" cy="90%" r="80%">
              <stop offset="0%" stopColor="#e8834a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#5a2500" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="lp-center-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe0b2" stopOpacity="1" />
              <stop offset="60%" stopColor="#f7a855" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C4610A" stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id="lp-glow-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f7a855" stopOpacity="1" />
              <stop offset="100%" stopColor="#C4610A" stopOpacity="0" />
            </radialGradient>
            <filter id="lp-blur-sm">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <filter id="lp-blur-lg">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Outer ambient glow — pulses when open */}
          <circle className="og" cx="130" cy="148" r="60" fill="url(#lp-glow-grad)" filter="url(#lp-blur-lg)" />

          {/* Back petals (wider, darker) */}
          <g transform="translate(130, 176)">
            <path className="petal pb1"
              d="M0,0 C-10,-30 -18,-70 -6,-105 C-2,-115 2,-115 6,-105 C18,-70 10,-30 0,0Z"
              fill="url(#lp-petal-back)" />
          </g>
          <g transform="translate(130, 176)">
            <path className="petal pb2"
              d="M0,0 C-10,-30 -18,-70 -6,-105 C-2,-115 2,-115 6,-105 C18,-70 10,-30 0,0Z"
              fill="url(#lp-petal-back)" />
          </g>

          {/* Main 4 petals */}
          <g transform="translate(130, 176)">
            <path className="petal p1"
              d="M0,0 C-8,-28 -14,-65 -4,-100 C-1,-110 3,-110 6,-100 C16,-65 8,-28 0,0Z"
              fill="url(#lp-petal-grad)" />
          </g>
          <g transform="translate(130, 176)">
            <path className="petal p2"
              d="M0,0 C-8,-28 -14,-65 -4,-100 C-1,-110 3,-110 6,-100 C16,-65 8,-28 0,0Z"
              fill="url(#lp-petal-grad)" />
          </g>
          <g transform="translate(130, 176)">
            <path className="petal p3"
              d="M0,0 C-8,-28 -14,-65 -4,-100 C-1,-110 3,-110 6,-100 C16,-65 8,-28 0,0Z"
              fill="url(#lp-petal-grad)" />
          </g>
          <g transform="translate(130, 176)">
            <path className="petal p4"
              d="M0,0 C-8,-28 -14,-65 -4,-100 C-1,-110 3,-110 6,-100 C16,-65 8,-28 0,0Z"
              fill="url(#lp-petal-grad)" />
          </g>

          {/* Center glow halo */}
          <circle className="cg" cx="130" cy="148" r="22" fill="url(#lp-glow-grad)" filter="url(#lp-blur-sm)" />

          {/* Center stamens */}
          <circle cx="130" cy="152" r="13" fill="url(#lp-center-grad)" />
          <circle cx="130" cy="152" r="7" fill="#ffe0b2" opacity="0.95" />
          <circle cx="130" cy="152" r="3" fill="#fff" opacity="0.8" />

          {/* Water lily pad */}
          <ellipse cx="130" cy="185" rx="46" ry="9" fill="#C4610A" opacity="0.18" />
          <ellipse cx="130" cy="185" rx="38" ry="6" fill="#f7a855" opacity="0.12" />
        </svg>
      </div>
    </div>
  );
}
