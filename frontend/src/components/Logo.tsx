interface LogoProps {
  size?: number;
  showGlow?: boolean;
  className?: string;
}

const logoGrid = [
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
  [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1],
  [0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const Logo: React.FC<LogoProps> = ({
  size = 30,
  showGlow = true,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {showGlow && (
        <div
          className="absolute inset-0 opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 70%)',
            transform: 'scale(1.3)',
          }}
        />
      )}

      <div
        className="grid grid-cols-12 relative z-10"
        style={{
          width: '100%',
          height: '100%',
          gap: '1px',
        }}
      >
        {logoGrid.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={pixel ? 'bg-emerald-500/90' : 'bg-transparent'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const MayaLogo = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Logo size={96} showGlow />
  </div>
);

export default MayaLogo;
