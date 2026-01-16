import React, { useMemo } from 'react';

// ----------------------------------------------------------------------
// 1. TYPES & CONSTANTS
// ----------------------------------------------------------------------

type Pixel = 0 | 1;
type PixelMatrix = Pixel[][];

// Matrix Configuration
// Increased density slightly to ensure smooth diagonals
const MATRIX_HEIGHT = 40;
const MATRIX_WIDTH = 32; 
const STROKE_WIDTH = 6; // Thicker strokes for solid look

// ----------------------------------------------------------------------
// 2. RASTERIZATION ENGINE (Solid LED Generator)
// ----------------------------------------------------------------------

const createEmptyMatrix = (w: number, h: number): PixelMatrix => 
  Array(h).fill(0).map(() => Array(w).fill(0));

/**
 * Draw a filled rectangle
 */
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

/**
 * Draw a thick line (capsule shape) with overfill
 */
const drawLine = (
  matrix: PixelMatrix, 
  x0: number, y0: number, 
  x1: number, y1: number, 
  thickness: number
) => {
  const h = matrix.length;
  const w = matrix[0].length;
  
  // Bounding box
  const minX = Math.floor(Math.min(x0, x1) - thickness);
  const maxX = Math.ceil(Math.max(x0, x1) + thickness);
  const minY = Math.floor(Math.min(y0, y1) - thickness);
  const maxY = Math.ceil(Math.max(y0, y1) + thickness);

  for (let y = Math.max(0, minY); y < Math.min(h, maxY); y++) {
    for (let x = Math.max(0, minX); x < Math.min(w, maxX); x++) {
      const A = x - x0;
      const B = y - y0;
      const C = x1 - x0;
      const D = y1 - y0;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = x0;
        yy = y0;
      } else if (param > 1) {
        xx = x1;
        yy = y1;
      } else {
        xx = x0 + param * C;
        yy = y0 + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Using <= and slight thickness boost for "overfill"
      if (distance <= (thickness / 2) + 0.5) {
        matrix[y][x] = 1;
      }
    }
  }
};

/**
 * Generate Letter M (Solid Block)
 */
const generateM = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  // Solid Vertical Pillars
  drawRect(m, 0, 0, STROKE_WIDTH, MATRIX_HEIGHT); // Left
  drawRect(m, MATRIX_WIDTH - STROKE_WIDTH, 0, STROKE_WIDTH, MATRIX_HEIGHT); // Right
  
  // Thick Diagonals
  const midX = MATRIX_WIDTH / 2;
  const midY = MATRIX_HEIGHT * 0.65; // Lower center point
  
  // Draw diagonals from top inner corners to center
  drawLine(m, STROKE_WIDTH - 2, 0, midX, midY, STROKE_WIDTH * 0.9);
  drawLine(m, MATRIX_WIDTH - STROKE_WIDTH + 1, 0, midX, midY, STROKE_WIDTH * 0.9);
  
  return m;
};

/**
 * Generate Letter A (Solid Block)
 */
const generateA = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  const topX = MATRIX_WIDTH / 2;
  const topY = STROKE_WIDTH / 2; // slight padding top
  const bottomY = MATRIX_HEIGHT;
  const spread = 0; 
  
  // Thick Diagonals (Legs)
  drawLine(m, topX, 0, spread, bottomY, STROKE_WIDTH + 1);
  drawLine(m, topX, 0, MATRIX_WIDTH - spread, bottomY, STROKE_WIDTH + 1);
  
  // Solid Cap at top to fill the point
  drawRect(m, topX - 4, 0, 8, STROKE_WIDTH); 
  
  // Crossbar
  const barY = MATRIX_HEIGHT * 0.6;
  drawLine(m, MATRIX_WIDTH * 0.2, barY, MATRIX_WIDTH * 0.8, barY, STROKE_WIDTH);

  return m;
};

/**
 * Generate Letter Y (Solid Block)
 */
const generateY = (): PixelMatrix => {
  const m = createEmptyMatrix(MATRIX_WIDTH, MATRIX_HEIGHT);
  const midX = MATRIX_WIDTH / 2;
  const midY = MATRIX_HEIGHT * 0.5;
  
  // V shape
  drawLine(m, 0, 0, midX, midY + 2, STROKE_WIDTH); // +2 to overfill join
  drawLine(m, MATRIX_WIDTH, 0, midX, midY + 2, STROKE_WIDTH);
  
  // Stem
  drawRect(m, midX - STROKE_WIDTH/2, midY, STROKE_WIDTH, MATRIX_HEIGHT - midY);
  
  return m;
};

// ----------------------------------------------------------------------
// 3. COMPONENT
// ----------------------------------------------------------------------

export function PixelMaya() {
  const wordMatrices = useMemo(() => {
    return [
      generateM(),
      generateA(),
      generateY(),
      generateA()
    ];
  }, []);

  // Static random offsets for shimmer to prevent hydration mismatch or re-renders
  // Using a deterministic-ish seeded random based on index would be better, 
  // but simple memo is fine for client-side only.
  const shimmerOffsets = useMemo(() => {
    return wordMatrices.map(matrix => 
      matrix.map(row => 
        row.map(() => Math.random() * -5) // Negative delay
      )
    );
  }, [wordMatrices]);

  return (
    <div className="pixel-maya-container">
      <div className="pixel-maya-wrapper">
        {wordMatrices.map((matrix, letterIndex) => (
          <div key={letterIndex} className="letter-grid">
            {matrix.map((row, y) => (
              <div key={y} className="pixel-row">
                {row.map((pixel, x) => {
                  if (pixel === 0) return <div key={x} className="pixel-off" />;
                  
                  return (
                    <div 
                      key={x} 
                      className="pixel-on"
                      style={{
                        animationDelay: `${shimmerOffsets[letterIndex][y][x]}s`
                      }}
                    />
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
          padding: 40px 0; /* Reduced from 100px for tighter footer integration */
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
          /* Gap 0 to merge vertical pixels */
          gap: 0px; 
        }

        .pixel-row {
          display: flex;
          /* Gap 0 to merge horizontal pixels */
          gap: 0px;
        }

        /* ------------------------------------------------------------
           VARIABLES
           ------------------------------------------------------------ */
        :root {
          /* Smaller pixels, higher density, no gaps */
          --pixel-size: 5px;       
          --letter-gap: 40px;      
          
          --base-color: #05ff97ff;   /* Emerald */
          --shine-color: #020c07ff;  /* Pure White for sparkle */
          
          /* Intense Glow */
          --glow-inner: 0 0 4px var(--base-color);
          --glow-outer: 0 0 8px rgba(3, 15, 10, 0.78);
        }

        /* RESPONSIVE SCALING */
        @media (min-width: 1200px) {
          :root { --pixel-size: 7px; --letter-gap: 50px; }
          .pixel-maya-container { padding: 50px 0; }
        }
        @media (max-width: 768px) {
          :root { --pixel-size: 3.5px; --letter-gap: 25px; }
          .pixel-maya-container { padding: 30px 0; }
        }
        @media (max-width: 480px) {
          :root { --pixel-size: 2px; --letter-gap: 15px; }
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
          background-color: var(--base-color);
          
          /* No border radius = solid block look */
          border-radius: 0px; 
          
          /* Box shadow helps merge them visually */
          box-shadow: var(--glow-inner), var(--glow-outer);
          
          /* SHIMMER ANIMATION */
          animation: pixel-shimmer 2s infinite linear;
          will-change: opacity, background-color;
        }

        /* ------------------------------------------------------------
           ANIMATIONS
           ------------------------------------------------------------ */
        @keyframes pixel-shimmer {
          0% {
            background-color: var(--base-color);
            opacity: 1;
          }
          45% {
            background-color: var(--base-color);
            opacity: 1;
          }
          50% {
            /* Quick flash to white */
            background-color: var(--shine-color);
            box-shadow: 0 0 10px var(--shine-color), 0 0 20px var(--shine-color);
            opacity: 1;
          }
          55% {
            background-color: var(--base-color);
            opacity: 1;
          }
          100% {
            background-color: var(--base-color);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
