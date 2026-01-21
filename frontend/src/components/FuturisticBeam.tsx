import { useMemo } from 'react';

export function FuturisticBeam({ className = '' }: { className?: string }) {
  // Generate random properties for the light streaks to ensure they feel organic
  const streaks = useMemo(() => {
    return Array.from({ length: 8 }).map((_) => ({
      left: `${15 + Math.random() * 70}%`, // Keep within central 70% width
      width: Math.random() > 0.7 ? '2px' : '1px', // Varied thickness
      height: `${40 + Math.random() * 40}%`, // Varied length
      delay: `-${Math.random() * 5}s`, // Random start times
      duration: `${3 + Math.random() * 4}s`, // Random speeds
      opacity: 0.3 + Math.random() * 0.5, // Random intensities
    }));
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      <style>{`
        @keyframes beam-flow {
          0% { transform: translateY(-150%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(150%); opacity: 0; }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes impact-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
      `}</style>

      {/* 1. MAIN BEAM CONTAINER */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-full">
        
        {/* Central Solid Core - The "Power Source" */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-[#14ff8a] opacity-60 blur-[1px] shadow-[0_0_20px_#14ff8a]" />
        
        {/* Main Glow Column */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-full bg-gradient-to-b from-[#14ff8a]/0 via-[#14ff8a]/20 to-[#14ff8a]/0 blur-[30px]" />

        {/* Data Stream Streaks */}
        {streaks.map((streak, i) => (
          <div
            key={i}
            className="absolute top-0 bg-gradient-to-b from-transparent via-[#14ff8a] to-transparent"
            style={{
              left: streak.left,
              width: streak.width,
              height: streak.height,
              opacity: streak.opacity,
              animation: `beam-flow ${streak.duration} linear infinite`,
              animationDelay: streak.delay,
            }}
          />
        ))}
      </div>

      {/* 2. FLOOR / IMPACT ZONE */}
      <div className="absolute bottom-0 left-0 w-full h-[400px] flex items-end justify-center perspective-[1000px] overflow-hidden">
        
        {/* 3D Grid Floor */}
        <div 
            className="w-[1000px] h-[600px] origin-bottom transform rotate-x-[80deg] translate-y-[200px]"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(20, 255, 138, 0.4) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(20, 255, 138, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at center bottom, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle at center bottom, black 0%, transparent 70%)',
                animation: 'grid-pulse 4s ease-in-out infinite'
            }}
        />

      </div>
    </div>
  );
}
