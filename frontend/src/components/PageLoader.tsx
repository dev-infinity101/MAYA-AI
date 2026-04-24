import React, { useState, useEffect } from 'react';

export function PageLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStage(1);
    }, 800);
    const timer2 = setTimeout(() => {
      setStage(2);
    }, 1800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        #page-loader {
          position: fixed; inset: 0; z-index: 99997;
          background: #FFFCF5; 
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 24px;
          transition: clip-path 0.9s cubic-bezier(0.76,0,0.24,1);
          clip-path: inset(0 0 0 0);
        }
        #page-loader.loaded {
          clip-path: inset(0 0 100% 0);
          pointer-events: none;
        }
        .loader-word {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: clamp(3rem, 8vw, 7rem);
          font-weight: 700;
          color: #C4610A;
          overflow: hidden;
          height: 1.5em;
          padding: 0 1em;
          white-space: nowrap;
        }
        .loader-word-track {
          display: flex;
          flex-direction: column;
          transition-property: transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 400ms;
        }
        .loader-word span {
          height: 1.5em;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loader-bar {
          width: 200px; height: 2px; background: rgba(196,97,10,0.15);
          position: relative; overflow: hidden;
        }
        .loader-bar-fill {
          position: absolute; left: 0; top: 0; height: 100%;
          background: #C4610A; width: 0%;
          animation: bar-fill 1.8s cubic-bezier(0.76,0,0.24,1) forwards;
        }
        @keyframes bar-fill {
          to { width: 100%; }
        }
      `}} />
      <div id="page-loader" className={stage === 2 ? 'loaded' : ''}>
        <div className="loader-word">
          <div className={`loader-word-track ${stage >= 1 ? '-translate-y-1/2' : 'translate-y-0'}`}>
            <span>नमस्ते</span>
            <span>MAYA</span>
          </div>
        </div>
        <div className="loader-bar"><div className="loader-bar-fill"></div></div>
      </div>
    </>
  );
}
