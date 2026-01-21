export function LightLeak({ color = 'cyan' }: { color?: 'cyan' | 'blue' | 'purple' | 'orange' | 'green' }) {
    const colors = {
        cyan: 'bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent',
        blue: 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent',
        purple: 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent',
        orange: 'bg-gradient-to-r from-transparent via-teal-500/30 to-transparent',
        green: 'bg-gradient-to-r from-transparent via-green-500/30 to-transparent',
    };
    const glows = {
        cyan: 'bg-cyan-500',
        blue: 'bg-blue-500',
        purple: 'bg-emerald-500',
        orange: 'bg-teal-500',
        green: 'bg-green-500',
    };
    return (
        <div className="relative z-20 h-px w-full overflow-visible">
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[2px] ${colors[color]} blur-sm`} />
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[30px] ${glows[color]}/10 blur-[40px] rounded-full`} />
        </div>
    );
}
