

export function SchemeScanAnimation() {
  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden rounded-3xl bg-[#FEF8EE] border border-[rgba(196,97,10,0.10)]">
      <style>{`
        @keyframes glass-scan {
          0%    { transform: translate(-14px, -60px); }
          40%   { transform: translate(-14px, 44px); }
          55%   { transform: translate(30px, 44px); }
          95%   { transform: translate(30px, -60px); }
          100%  { transform: translate(-14px, -60px); }
        }
        @keyframes scan-beam {
          0%    { opacity: 0; }
          10%   { opacity: 0.55; }
          85%   { opacity: 0.55; }
          100%  { opacity: 0; }
        }
        @keyframes highlight-row {
          0%,100% { opacity: 0; }
          20%,80% { opacity: 1; }
        }
        @keyframes found-ping {
          0%    { transform: scale(0.8); opacity: 0; }
          20%   { transform: scale(1); opacity: 1; }
          70%   { transform: scale(1); opacity: 1; }
          100%  { transform: scale(0.8); opacity: 0; }
        }
        .glass-move { animation: glass-scan 4.2s cubic-bezier(0.45,0,0.55,1) infinite; }
        .scan-beam  { animation: scan-beam 4.2s ease-in-out infinite; }
        .found-ping { animation: found-ping 4.2s ease-in-out infinite; animation-delay: 1.8s; }
        .hl-row     { animation: highlight-row 4.2s ease-in-out infinite; animation-delay: 1.2s; }
      `}</style>

      <div className="relative" style={{ width: '220px', height: '240px' }}>

        {/* Document */}
        <div className="absolute" style={{ top: '20px', left: '30px' }}>
          <svg width="140" height="180" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="138" height="178" rx="10" fill="white" stroke="rgba(196,97,10,0.22)" strokeWidth="1.4" />
            {/* Header */}
            <rect x="14" y="16" width="80" height="9" rx="4" fill="rgba(196,97,10,0.40)" />
            {/* Lines */}
            {[0,1,2,3,4,5,6,7].map(i => (
              <rect key={i} x="14" y={36 + i * 16} width={112 - i * 4} height="6" rx="3" fill="rgba(196,97,10,0.13)" />
            ))}
            {/* Highlighted row (row 3) */}
            <rect className="hl-row" x="10" y="82" width="120" height="14" rx="4" fill="rgba(196,97,10,0.14)" />
            {/* Scan beam horizontal line */}
            <rect className="scan-beam" x="0" y="0" width="138" height="2" rx="1" fill="rgba(196,97,10,0.65)" style={{ position: 'absolute' }} />
          </svg>
        </div>

        {/* Magnifying glass */}
        <div className="glass-move absolute" style={{ top: '20px', left: '30px' }}>
          <svg width="72" height="80" viewBox="0 0 72 80" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            {/* Lens glow */}
            <circle cx="30" cy="30" r="26" fill="rgba(196,97,10,0.08)" />
            {/* Lens ring */}
            <circle cx="30" cy="30" r="22" fill="rgba(253,248,238,0.55)" stroke="rgba(196,97,10,0.55)" strokeWidth="2.5" />
            {/* Inner glare */}
            <circle cx="22" cy="22" r="6" fill="white" opacity="0.45" />
            {/* Handle */}
            <line x1="47" y1="47" x2="68" y2="70" stroke="rgba(196,97,10,0.65)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Found indicator */}
        <div className="found-ping absolute" style={{ top: '108px', left: '145px' }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            background: 'rgba(196,97,10,0.15)',
            border: '1.5px solid rgba(196,97,10,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polyline points="2,7 6,11 12,3" stroke="#C4610A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <span className="text-xs font-medium text-text-muted tracking-widest uppercase opacity-60">Scanning government schemes</span>
      </div>
    </div>
  );
}
