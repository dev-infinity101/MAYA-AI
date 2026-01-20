import React, { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------
// 1. TYPES & CONSTANTS
// ----------------------------------------------------------------------

type Pixel = 0 | 1;
type PixelMatrix = Pixel[][];

const MATRIX_HEIGHT = 40;
const MATRIX_WIDTH = 32; 
const STROKE_WIDTH = 6;

// Matrix-style characters (0s and 1s for binary look)
const MATRIX_CHARS = ['0', '1'];

// ----------------------------------------------------------------------
// 2. RASTERIZATION ENGINE (Solid LED Generator)
// ----------------------------------------------------------------------

const createEmptyMatrix = (w: number, h: number): PixelMatrix => 
  Array(h).fill(0).map(() => Array(w).fill(0));

const drawRect = (matrix: PixelMatrix, x: number, y: number, w: number, h: number) => {
  const H = matrix.length;
  const W = matrix[0].length;
  const startX = Math.max(0, Math.floor(x));
  const endX = Math.min(W, Math.ceil(x + w));
  const startY = Math.max(0, Math.floor(y));
  const endY = Math.min(H, Math.ceil(y + h));
  for (let r = startY; r < endY; r++) {
    for (let c = startX; c < endX; c++) {
      matrix[r][c] = 1;
    }
  }
};

const drawLine = (
  matrix: PixelMatrix, 
  x0: number, y0: number, 
  x1: number, y1: number, 
  thickness: number
) => {
  const h = matrix.length;
  const w = matrix[0].length;
  const minX = Math.floor(Math.min(x0, x1) - thickness);
  const maxX = Math.ceil(Math.max(x0, x1) + thickness);
  const minY = Math.floor(Math.min(y0, y1) - thickness);
  const maxY = Math.ceil(Math.max(y0, y1) + thickness);
  for (let y = Math.max(0, minY); y < Math.min(h, maxY); y++) {
    for (let x = Math.max(0, minX); x < Math.min(w, maxX); x++) {
      const A = x - x0, B = y - y0, C = x1 - x0, D = y1 - y0;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;
      let xx, yy;
      if (param < 0) { xx = x0; yy = y0; }
      else if (param > 1) { xx = x1; yy = y1; }
      else { xx = x0 + param * C; yy = y0 + param * D; }
      const dx = x - xx, dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= (thickness / 2) + 0.5) matrix[y][x] = 1;
    }
  }
};

const generateM = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  drawRect(m, 0, 0, STROKE_WIDTH, MATRIX_HEIGHT);
  drawRect(m, MATRIX_WIDTH - STROKE_WIDTH, 0, STROKE_WIDTH, MATRIX_HEIGHT);
  const midX = MATRIX_WIDTH / 2, midY = MATRIX_HEIGHT * 0.65;
  drawLine(m, STROKE_WIDTH - 2, 0, midX, midY, STROKE_WIDTH * 0.9);
  drawLine(m, MATRIX_WIDTH - STROKE_WIDTH + 1, 0, midX, midY, STROKE_WIDTH * 0.9);
  return m;
};

const generateA = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  const topX = MATRIX_WIDTH / 2, topY = STROKE_WIDTH / 2, bottomY = MATRIX_HEIGHT, spread = 0;
  drawLine(m, topX, 0, spread, bottomY, STROKE_WIDTH + 1);
  drawLine(m, topX, 0, MATRIX_WIDTH - spread, bottomY, STROKE_WIDTH + 1);
  drawRect(m, topX - 4, 0, 8, STROKE_WIDTH);
  const barY = MATRIX_HEIGHT * 0.6;
  drawLine(m, MATRIX_WIDTH * 0.2, barY, MATRIX_WIDTH * 0.8, barY, STROKE_WIDTH);
  return m;
};

const generateY = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  const midX = MATRIX_WIDTH / 2, midY = MATRIX_HEIGHT * 0.5;
  drawLine(m, 0, 0, midX, midY + 2, STROKE_WIDTH);
  drawLine(m, MATRIX_WIDTH, 0, midX, midY + 2, STROKE_WIDTH);
  drawRect(m, midX - STROKE_WIDTH/2, midY, STROKE_WIDTH, MATRIX_HEIGHT - midY);
  return m;
};

// ----------------------------------------------------------------------
// 3. COMPONENT
// ----------------------------------------------------------------------

export function PixelMaya() {
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  const wordMatrices = useMemo(() => [generateM(), generateA(), generateY(), generateA()], []);

  // Pre-calculate random distortion offsets for each pixel (memoized for performance)
  const distortionOffsets = useMemo(() => {
    return wordMatrices.map(matrix => 
      matrix.map(row => 
        row.map(() => ({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          rotate: (Math.random() - 0.5) * 360,
          scale: 0.5 + Math.random() * 0.5
        }))
      )
    );
  }, [wordMatrices]);

  // Pre-calculate random characters for each pixel
  const pixelChars = useMemo(() => {
    return wordMatrices.map(matrix => 
      matrix.map(row => 
        row.map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)])
      )
    );
  }, [wordMatrices]);

  const handleLetterEnter = useCallback((index: number) => {
    setHoveredLetter(index);
  }, []);

  const handleLetterLeave = useCallback(() => {
    setHoveredLetter(null);
  }, []);

  return (
    <div className="pixel-maya-container">
      <div className="pixel-maya-wrapper">
        {wordMatrices.map((matrix, letterIndex) => (
          <div 
            key={letterIndex} 
            className="letter-grid"
            onMouseEnter={() => handleLetterEnter(letterIndex)}
            onMouseLeave={handleLetterLeave}
          >
            {matrix.map((row, y) => (
              <div key={y} className="pixel-row">
                {row.map((pixel, x) => {
                  if (pixel === 0) return <div key={x} className="pixel-off" />;
                  
                  const isHovered = hoveredLetter === letterIndex;
                  const distortion = distortionOffsets[letterIndex][y][x];
                  const char = pixelChars[letterIndex][y][x];
                  
                  return (
                    <div 
                      key={x} 
                      className={`pixel-on ${isHovered ? 'pixel-distorted' : ''}`}
                      style={{
                        '--distort-x': `${distortion.x}px`,
                        '--distort-y': `${distortion.y}px`,
                        '--distort-rotate': `${distortion.rotate}deg`,
                        '--distort-scale': distortion.scale,
                        animationDelay: `${Math.random() * 2}s`,
                      } as React.CSSProperties}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        /* ------------------------------------------------------------
           CONTAINER
           ------------------------------------------------------------ */
        .pixel-maya-container {
          width: 100%;
          background-color: #000000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 0;
          overflow: hidden;
          position: relative;
        }

        .pixel-maya-wrapper {
          display: flex;
          gap: var(--letter-gap);
        }

        .letter-grid {
          display: flex;
          flex-direction: column;
          gap: 0px;
          cursor: pointer;
          position: relative;
        }

        .pixel-row {
          display: flex;
          gap: 0px;
        }

        /* ------------------------------------------------------------
           VARIABLES
           ------------------------------------------------------------ */
        :root {
          --pixel-size: 8px;       
          --letter-gap: 40px;      
          --base-color: #11b973ff;
          --bright-color: #49ff9bff;
          --glow-inner: 0 0 6px var(--base-color);
          --glow-outer: 0 0 12px rgba(16, 185, 81, 0.6);
        }

        /* RESPONSIVE SCALING */
        @media (min-width: 1200px) {
          :root { --pixel-size: 10px; --letter-gap: 50px; }
          .pixel-maya-container { padding: 50px 0; }
        }
        @media (max-width: 768px) {
          :root { --pixel-size: 6px; --letter-gap: 25px; }
          .pixel-maya-container { padding: 30px 0; }
        }
        @media (max-width: 480px) {
          :root { --pixel-size: 4px; --letter-gap: 15px; }
          .pixel-maya-container { padding: 20px 0; }
        }

        /* ------------------------------------------------------------
           PIXEL STYLING
           ------------------------------------------------------------ */
        .pixel-off {
          width: var(--pixel-size);
          height: var(--pixel-size);
          background-color: transparent;
        }

        .pixel-on {
          width: var(--pixel-size);
          height: var(--pixel-size);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', monospace;
          font-size: calc(var(--pixel-size) * 0.7);
          font-weight: bold;
          color: var(--base-color);
          text-shadow: var(--glow-inner), var(--glow-outer);
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                      opacity 0.6s ease,
                      color 0.6s ease,
                      text-shadow 0.6s ease;
          will-change: transform;
          transform-origin: center;
          animation: matrixShine 2s infinite;
        }

        /* ------------------------------------------------------------
           MATRIX SHINE ANIMATION (Every 2 seconds)
           ------------------------------------------------------------ */
        @keyframes matrixShine {
          0%, 90% {
            color: var(--base-color);
            text-shadow: var(--glow-inner), var(--glow-outer);
          }
          95% {
            color: var(--bright-color);
            text-shadow: 
              0 0 10px var(--bright-color),
              0 0 20px var(--bright-color),
              0 0 30px rgba(9, 248, 57, 0.5);
          }
          100% {
            color: var(--base-color);
            text-shadow: var(--glow-inner), var(--glow-outer);
          }
        }

        /* ------------------------------------------------------------
           HOVER DISTORTION EFFECT
           ------------------------------------------------------------ */
        .pixel-distorted {
          transform: translate(var(--distort-x), var(--distort-y)) 
                     rotate(var(--distort-rotate)) 
                     scale(var(--distort-scale));
          opacity: 0.6;
          color: var(--bright-color);
          text-shadow: 
            0 0 15px var(--bright-color),
            0 0 30px rgba(94, 252, 130, 0.4);
          animation: none; /* Disable shine animation on hover */
        }

        /* Stagger effect for smoother distortion wave */
        .pixel-row:nth-child(1) .pixel-distorted { transition-delay: 0ms; }
        .pixel-row:nth-child(2) .pixel-distorted { transition-delay: 10ms; }
        .pixel-row:nth-child(3) .pixel-distorted { transition-delay: 20ms; }
        .pixel-row:nth-child(4) .pixel-distorted { transition-delay: 30ms; }
        .pixel-row:nth-child(5) .pixel-distorted { transition-delay: 40ms; }
        .pixel-row:nth-child(6) .pixel-distorted { transition-delay: 50ms; }
        .pixel-row:nth-child(7) .pixel-distorted { transition-delay: 60ms; }
        .pixel-row:nth-child(8) .pixel-distorted { transition-delay: 70ms; }
        .pixel-row:nth-child(9) .pixel-distorted { transition-delay: 80ms; }
        .pixel-row:nth-child(10) .pixel-distorted { transition-delay: 90ms; }
      `}</style>
    </div>
  );
}