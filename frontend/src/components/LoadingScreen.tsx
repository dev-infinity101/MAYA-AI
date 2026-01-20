import React, { useState, useEffect } from 'react';

export function LoadingScreen({ onLoadingComplete }: { onLoadingComplete: () => void }) {
  const [pixels, setPixels] = useState<Array<{ id: number; active: boolean }>>([]);
  const [phase, setPhase] = useState<'filling' | 'pulsing' | 'clearing'>('filling');

  useEffect(() => {
    // Generate a large grid of pixels
    const cols = 50;
    const rows = 30;
    const totalPixels = cols * rows;
    
    const pixelArray = Array.from({ length: totalPixels }, (_, i) => ({
      id: i,
      active: false,
    }));
    
    setPixels(pixelArray);

    // Phase 1: Randomly fill pixels (0-1s)
    const fillInterval = setInterval(() => {
      setPixels(prev => {
        const inactiveIndices = prev
          .map((p, i) => (!p.active ? i : -1))
          .filter(i => i !== -1);
        
        if (inactiveIndices.length === 0) {
          clearInterval(fillInterval);
          return prev;
        }

        // Activate 50-70 random pixels at once for faster filling
        const toActivate = Math.min(
          Math.floor(Math.random() * 20) + 50,
          inactiveIndices.length
        );
        
        const newPixels = [...prev];
        for (let i = 0; i < toActivate; i++) {
          const randomIndex = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
          newPixels[randomIndex] = { ...newPixels[randomIndex], active: true };
          inactiveIndices.splice(inactiveIndices.indexOf(randomIndex), 1);
        }
        
        return newPixels;
      });
    }, 30);

    // Phase 2: Start pulsing (after 1s)
    const pulseTimer = setTimeout(() => {
      clearInterval(fillInterval);
      setPhase('pulsing');
    }, 1000);

    // Phase 3: Start clearing (after 2s)
    const clearTimer = setTimeout(() => {
      setPhase('clearing');
    }, 2000);

    // Clear interval for clearing phase
    let clearingInterval: NodeJS.Timeout;
    if (phase === 'clearing') {
      clearingInterval = setInterval(() => {
        setPixels(prev => {
          const activeIndices = prev
            .map((p, i) => (p.active ? i : -1))
            .filter(i => i !== -1);
          
          if (activeIndices.length === 0) {
            clearInterval(clearingInterval);
            return prev;
          }

          // Deactivate 50-70 random pixels at once for faster clearing
          const toDeactivate = Math.min(
            Math.floor(Math.random() * 20) + 50,
            activeIndices.length
          );
          
          const newPixels = [...prev];
          for (let i = 0; i < toDeactivate; i++) {
            const randomIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)];
            newPixels[randomIndex] = { ...newPixels[randomIndex], active: false };
            activeIndices.splice(activeIndices.indexOf(randomIndex), 1);
          }
          
          return newPixels;
        });
      }, 30);
    }

    // Complete loading (after 3s)
    const completeTimer = setTimeout(() => {
      onLoadingComplete();
    }, 1000);

    return () => {
      clearInterval(fillInterval);
      clearTimeout(pulseTimer);
      clearTimeout(clearTimer);
      clearTimeout(completeTimer);
      if (clearingInterval) clearInterval(clearingInterval);
    };
  }, [onLoadingComplete, phase]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {/* Central Pulsing Glow - grows during filling, pulses during middle, fades during clearing */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
          phase === 'filling' ? 'opacity-100 scale-100' : 
          phase === 'pulsing' ? 'opacity-100 scale-110' : 
          'opacity-0 scale-50'
        }`}
      >
        <div 
          className={`w-[800px] h-[800px] bg-emerald-500/30 full blur-[150px] ${
            phase === 'pulsing' ? 'animate-pulse' : ''
          }`} 
          style={{ animationDuration: '1s' }} 
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/40 full blur-[120px] ${
            phase === 'pulsing' ? 'animate-pulse' : ''
          }`} 
          style={{ animationDuration: '1s' }} 
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-300/50 full blur-[100px] ${
            phase === 'pulsing' ? 'animate-pulse' : ''
          }`} 
          style={{ animationDuration: '1s' }} 
        />
      </div>

      {/* Pixel Grid - Matrix Rain Style */}
      <div 
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(50, 1fr)',
          gridTemplateRows: 'repeat(30, 1fr)',
          gap: '2px',
          padding: '10px',
        }}
      >
        {pixels.map((pixel) => (
          <div
            key={pixel.id}
            className={`rounded-none transition-all duration-300 ${
              pixel.active 
                ? phase === 'pulsing'
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' 
                  : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                : 'bg-transparent'
            }`}
            style={{
              animationDuration: phase === 'pulsing' ? `${0.8 + Math.random() * 0.4}s` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
