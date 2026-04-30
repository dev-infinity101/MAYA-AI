

export function DocumentsAnimation() {
  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden rounded-3xl bg-[#FEF8EE] border border-[rgba(196,97,10,0.10)]">
      <style>{`
        @keyframes doc-collect-1 {
          0%,15%   { transform: translate(-110px, -70px) rotate(-22deg) scale(0.82); opacity: 0.55; }
          55%,75%  { transform: translate(0px, 0px) rotate(-2deg) scale(1); opacity: 1; }
          90%,100% { transform: translate(-110px, -70px) rotate(-22deg) scale(0.82); opacity: 0.55; }
        }
        @keyframes doc-collect-2 {
          0%,15%   { transform: translate(100px, -80px) rotate(18deg) scale(0.78); opacity: 0.5; }
          55%,75%  { transform: translate(0px, 0px) rotate(3deg) scale(1); opacity: 1; }
          90%,100% { transform: translate(100px, -80px) rotate(18deg) scale(0.78); opacity: 0.5; }
        }
        @keyframes doc-collect-3 {
          0%,15%   { transform: translate(-80px, 90px) rotate(15deg) scale(0.75); opacity: 0.45; }
          55%,75%  { transform: translate(0px, 0px) rotate(-1deg) scale(1); opacity: 1; }
          90%,100% { transform: translate(-80px, 90px) rotate(15deg) scale(0.75); opacity: 0.45; }
        }
        @keyframes doc-collect-4 {
          0%,15%   { transform: translate(95px, 75px) rotate(-16deg) scale(0.7); opacity: 0.4; }
          55%,75%  { transform: translate(0px, 0px) rotate(2deg) scale(1); opacity: 1; }
          90%,100% { transform: translate(95px, 75px) rotate(-16deg) scale(0.7); opacity: 0.4; }
        }
        @keyframes doc-collect-5 {
          0%,15%   { transform: translate(10px, -130px) rotate(-8deg) scale(0.72); opacity: 0.4; }
          55%,75%  { transform: translate(0px, 0px) rotate(1deg) scale(1); opacity: 1; }
          90%,100% { transform: translate(10px, -130px) rotate(-8deg) scale(0.72); opacity: 0.4; }
        }
        @keyframes stack-glow-pulse {
          0%,15%   { opacity: 0; }
          55%,75%  { opacity: 1; }
          90%,100% { opacity: 0; }
        }
        .dc1 { animation: doc-collect-1 5s cubic-bezier(0.4,0,0.2,1) infinite; }
        .dc2 { animation: doc-collect-2 5s cubic-bezier(0.4,0,0.2,1) infinite; animation-delay: 0.08s; }
        .dc3 { animation: doc-collect-3 5s cubic-bezier(0.4,0,0.2,1) infinite; animation-delay: 0.16s; }
        .dc4 { animation: doc-collect-4 5s cubic-bezier(0.4,0,0.2,1) infinite; animation-delay: 0.24s; }
        .dc5 { animation: doc-collect-5 5s cubic-bezier(0.4,0,0.2,1) infinite; animation-delay: 0.04s; }
        .sg  { animation: stack-glow-pulse 5s ease-in-out infinite; }
      `}</style>

      <div className="relative" style={{ width: '220px', height: '220px' }}>
        {/* Stack glow when collected */}
        <div className="sg absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: '110px', height: '130px',
            background: 'radial-gradient(ellipse, rgba(196,97,10,0.18) 0%, transparent 70%)',
            borderRadius: '12px',
          }} />
        </div>

        {/* Doc 5 — topmost back */}
        <div className="dc5 absolute" style={{ top: '50%', left: '50%', marginTop: '-64px', marginLeft: '-44px' }}>
          <DocSvg shade={0.35} lines={2} />
        </div>

        {/* Doc 1 */}
        <div className="dc1 absolute" style={{ top: '50%', left: '50%', marginTop: '-64px', marginLeft: '-44px' }}>
          <DocSvg shade={0.55} lines={3} />
        </div>

        {/* Doc 2 */}
        <div className="dc2 absolute" style={{ top: '50%', left: '50%', marginTop: '-64px', marginLeft: '-44px' }}>
          <DocSvg shade={0.70} lines={4} />
        </div>

        {/* Doc 3 */}
        <div className="dc3 absolute" style={{ top: '50%', left: '50%', marginTop: '-64px', marginLeft: '-44px' }}>
          <DocSvg shade={0.80} lines={3} />
        </div>

        {/* Doc 4 — front */}
        <div className="dc4 absolute" style={{ top: '50%', left: '50%', marginTop: '-64px', marginLeft: '-44px' }}>
          <DocSvg shade={1} lines={5} accent />
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <span className="text-xs font-medium text-text-muted tracking-widest uppercase opacity-60">Organising your documents</span>
      </div>
    </div>
  );
}

function DocSvg({ shade, lines, accent }: { shade: number; lines: number; accent?: boolean }) {
  const fill = `rgba(196,97,10,${shade * 0.12})`;
  const stroke = `rgba(196,97,10,${shade * 0.4})`;
  const lineColor = `rgba(196,97,10,${shade * 0.28})`;
  const headerColor = accent ? 'rgba(196,97,10,0.55)' : `rgba(196,97,10,${shade * 0.3})`;

  return (
    <svg width="88" height="112" viewBox="0 0 88 112" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="86" height="110" rx="7" fill={fill} stroke={stroke} strokeWidth="1.2" />
      {/* Header bar */}
      <rect x="10" y="12" width="50" height="7" rx="3" fill={headerColor} />
      {/* Lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <rect key={i} x="10" y={28 + i * 13} width={accent ? 68 - i * 4 : 58 - i * 3} height="5" rx="2.5" fill={lineColor} />
      ))}
      {/* Bottom stamp */}
      {accent && (
        <rect x="10" y="90" width="30" height="10" rx="4" fill="rgba(196,97,10,0.35)" />
      )}
    </svg>
  );
}
