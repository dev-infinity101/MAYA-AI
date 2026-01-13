import { useState, useEffect, useMemo } from 'react';

interface LogoProps {
    size?: number;
    showGlow?: boolean;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({
    size = 30,
    showGlow = true,
    className = ''
}) => {
    const [time, setTime] = useState(0);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        console.log(`[Logo] Initializing with size: ${size}, glow: ${showGlow}`);
        const interval = setInterval(() => {
            setTime(prev => prev + 1);
        }, 50);
        return () => {
            console.log('[Logo] Cleaning up');
            clearInterval(interval);
        };
    }, [size, showGlow]);

    // Glitch Matrix - 12x12 grid
    const logo = useMemo(() => [
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
    ], []);

    // Glitch animation effects
    const getPixelState = (value: number, rowIndex: number, colIndex: number) => {
        try {
            if (value === 0) return { opacity: 0, glitch: false, scanLine: false };

            const seed = rowIndex * 12 + colIndex;
            const t = time / 20;

            // Main glitch waves
            const wave1 = Math.sin(t + seed * 0.3) * 0.5 + 0.5;
            const wave2 = Math.sin(t * 1.5 - rowIndex * 0.5) * 0.5 + 0.5;

            // Random glitch spikes
            const glitchChance = Math.sin(t * 3 + seed * 2) > 0.85;

            // Scan line effect
            const scanLine = Math.abs(((t * 2) % 24) - rowIndex) < 2;

            let opacity = 0.6 + wave1 * 0.3 + wave2 * 0.1;
            if (scanLine) opacity = 1;
            if (glitchChance) opacity = Math.random() > 0.3 ? 1 : 0.2;

            return {
                opacity: Math.min(Math.max(opacity, 0.3), 1),
                glitch: glitchChance,
                scanLine
            };
        } catch (error) {
            if (!hasError) {
                console.error('[Logo] Error calculating pixel state:', error);
                setHasError(true);
            }
            return { opacity: 0.5, glitch: false, scanLine: false };
        }
    };

    if (hasError) {
        return (
            <div 
                className={`bg-primary/20 rounded-lg flex items-center justify-center ${className}`}
                style={{ width: size, height: size }}
            >
                <div className="w-2/3 h-2/3 bg-primary rounded-sm animate-pulse" />
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Glow effect */}
            {showGlow && (
                <div
                    className="absolute inset-0 blur-xl opacity-50 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                        transform: 'scale(1.5)'
                    }}
                />
            )}

            {/* Logo Grid */}
            <div
                className="grid grid-cols-12 relative z-10"
                style={{
                    width: '100%',
                    height: '100%',
                    gap: '1px'
                }}
            >
                {logo.map((row, rowIndex) =>
                    row.map((pixel, colIndex) => {
                        const state = getPixelState(pixel, rowIndex, colIndex);
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="transition-opacity duration-75"
                                style={{
                                    backgroundColor: pixel ? '#10b981' : 'transparent',
                                    opacity: state.opacity,
                                    boxShadow: state.scanLine
                                        ? '0 0 4px rgba(16, 185, 129, 0.8)'
                                        : state.glitch
                                            ? '0 0 2px rgba(16, 185, 129, 1)'
                                            : 'none'
                                }}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Full showcase component (for demo/testing purposes)
export const MayaLogo = () => {
    const [time, setTime] = useState(0);

    // Glitch Matrix - 12x12 grid
    const logo = [
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

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => prev + 1);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Glitch animation effects
    const getPixelState = (value: number, rowIndex: number, colIndex: number) => {
        if (value === 0) return { opacity: 0, glitch: false, scanLine: false };

        const seed = rowIndex * 12 + colIndex;
        const t = time / 20;

        // Main glitch waves
        const wave1 = Math.sin(t + seed * 0.3) * 0.5 + 0.5;
        const wave2 = Math.sin(t * 1.5 - rowIndex * 0.5) * 0.5 + 0.5;

        // Random glitch spikes
        const glitchChance = Math.sin(t * 3 + seed * 2) > 0.85;

        // Scan line effect
        const scanLine = Math.abs(((t * 2) % 24) - rowIndex) < 2;

        let opacity = 0.6 + wave1 * 0.3 + wave2 * 0.1;
        if (scanLine) opacity = 1;
        if (glitchChance) opacity = Math.random() > 0.3 ? 1 : 0.2;

        return {
            opacity: Math.min(Math.max(opacity, 0.3), 1),
            glitch: glitchChance,
            scanLine
        };
    };

    const sizes = [30];

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
            <div className="max-w-6xl w-full space-y-16">

                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-6xl font-light text-emerald-400 tracking-widest">MAYA</h1>
                    <p className="text-emerald-600 text-sm tracking-widest font-mono">GLITCH MATRIX • EMERALD</p>
                </div>

                {/* Size Comparisons */}
                <div className="flex items-center justify-center">
                    {sizes.map(size => (
                        <div key={size} className="flex flex-col items-center gap-8">
                            <div className="relative">
                                {/* Glow effect */}
                                <div
                                    className="absolute inset-0 blur-xl opacity-50"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                                        transform: 'scale(1.5)'
                                    }}
                                />

                                {/* Logo */}
                                <div
                                    className="grid grid-cols-12 relative z-10"
                                    style={{
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        gap: '1px'
                                    }}
                                >
                                    {logo.map((row, rowIndex) =>
                                        row.map((pixel, colIndex) => {
                                            const state = getPixelState(pixel, rowIndex, colIndex);
                                            return (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className="transition-opacity duration-75"
                                                    style={{
                                                        backgroundColor: pixel ? '#10b981' : 'transparent',
                                                        opacity: state.opacity,
                                                        boxShadow: state.scanLine
                                                            ? '0 0 4px rgba(16, 185, 129, 0.8)'
                                                            : state.glitch
                                                                ? '0 0 2px rgba(16, 185, 129, 1)'
                                                                : 'none'
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-emerald-400 text-4xl font-mono font-bold">{size}px</p>
                                <p className="text-emerald-600 text-sm font-mono uppercase tracking-widest">
                                    Spacious • Optimal Clarity
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Context Examples */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Dark Theme */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="grid grid-cols-12 gap-px"
                                style={{ width: '30px', height: '30px' }}
                            >
                                {logo.map((row, rowIndex) =>
                                    row.map((pixel, colIndex) => {
                                        const state = getPixelState(pixel, rowIndex, colIndex);
                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                style={{
                                                    backgroundColor: pixel ? '#10b981' : 'transparent',
                                                    opacity: state.opacity
                                                }}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <span className="text-white font-medium">MAYA</span>
                        </div>
                        <p className="text-slate-500 text-xs font-mono">Dark Interface</p>
                    </div>

                    {/* Light Theme */}
                    <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="grid grid-cols-12 gap-px"
                                style={{ width: '28px', height: '28px' }}
                            >
                                {logo.map((row, rowIndex) =>
                                    row.map((pixel, colIndex) => {
                                        const state = getPixelState(pixel, rowIndex, colIndex);
                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                style={{
                                                    backgroundColor: pixel ? '#059669' : 'transparent',
                                                    opacity: state.opacity
                                                }}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <span className="text-slate-900 font-medium">MAYA</span>
                        </div>
                        <p className="text-slate-400 text-xs font-mono">Light Interface</p>
                    </div>

                    {/* Favicon */}
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="grid grid-cols-12"
                                style={{ width: '24px', height: '24px' }}
                            >
                                {logo.map((row, rowIndex) =>
                                    row.map((pixel, colIndex) => {
                                        const state = getPixelState(pixel, rowIndex, colIndex);
                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                style={{
                                                    backgroundColor: pixel ? '#10b981' : 'transparent',
                                                    opacity: state.opacity
                                                }}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <span className="text-slate-400 font-medium text-sm">Favicon</span>
                        </div>
                        <p className="text-slate-600 text-xs font-mono">Browser Tab</p>
                    </div>
                </div>

                {/* Large Display with Technical Info */}
                <div className="bg-gradient-to-br from-slate-950 to-black border border-emerald-900/30 rounded-lg p-12">
                    <div className="grid grid-cols-2 gap-12 items-center">

                        {/* Large Logo */}
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                {/* Outer glow */}
                                <div
                                    className="absolute inset-0 blur-2xl opacity-60"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
                                        transform: 'scale(1.8)'
                                    }}
                                />

                                {/* Logo at 192px for detail view */}
                                <div
                                    className="grid grid-cols-12 gap-1 relative z-10"
                                    style={{ width: '192px', height: '192px' }}
                                >
                                    {logo.map((row, rowIndex) =>
                                        row.map((pixel, colIndex) => {
                                            const state = getPixelState(pixel, rowIndex, colIndex);
                                            return (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className="transition-all duration-75"
                                                    style={{
                                                        backgroundColor: pixel ? '#10b981' : 'transparent',
                                                        opacity: state.opacity,
                                                        boxShadow: state.scanLine
                                                            ? '0 0 8px rgba(16, 185, 129, 0.8), inset 0 0 4px rgba(16, 185, 129, 0.5)'
                                                            : state.glitch
                                                                ? '0 0 4px rgba(16, 185, 129, 1)'
                                                                : 'none',
                                                        border: pixel && state.glitch ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs */}
                        <div className="space-y-6">
                            <h3 className="text-emerald-400 text-2xl font-light tracking-wide mb-8">GLITCH MATRIX</h3>

                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Grid</span>
                                    <span className="text-emerald-400">12×12 pixels</span>
                                </div>

                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Color</span>
                                    <span className="text-emerald-400">#10b981</span>
                                </div>

                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Size</span>
                                    <span className="text-emerald-400">30px</span>
                                </div>

                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Animation</span>
                                    <span className="text-emerald-400">Glitch/Scan</span>
                                </div>

                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Style</span>
                                    <span className="text-emerald-400">Asymmetric</span>
                                </div>

                                <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                                    <span className="text-emerald-700">Format</span>
                                    <span className="text-emerald-400">SVG/Pixel</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-emerald-950/30 border border-emerald-900/30 rounded">
                                <p className="text-emerald-600 text-xs leading-relaxed">
                                    Dynamic glitch animation with scan lines and random pixel fluctuations.
                                    Creates a living, breathing digital presence that suggests active processing and transformation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animation States */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-8">
                    <h3 className="text-emerald-400 text-lg mb-6 tracking-wide">ANIMATION STATES</h3>
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <div className="text-emerald-600 text-xs font-mono uppercase">Scan Lines</div>
                            <p className="text-slate-500 text-xs">Vertical sweep effect highlighting pixel rows sequentially</p>
                        </div>
                        <div className="space-y-3">
                            <div className="text-emerald-600 text-xs font-mono uppercase">Wave Pulse</div>
                            <p className="text-slate-500 text-xs">Organic opacity waves creating depth and movement</p>
                        </div>
                        <div className="space-y-3">
                            <div className="text-emerald-600 text-xs font-mono uppercase">Glitch Spikes</div>
                            <p className="text-slate-500 text-xs">Random pixel flares suggesting digital disruption</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MayaLogo;
