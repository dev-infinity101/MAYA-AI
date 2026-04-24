export function LightLeak({ color = 'cyan' }: { color?: 'cyan' | 'blue' | 'purple' | 'orange' | 'green' }) {
    const lines = {
        cyan:   'bg-gradient-to-r from-transparent via-primary/20 to-transparent',
        blue:   'bg-gradient-to-r from-transparent via-primary/15 to-transparent',
        purple: 'bg-gradient-to-r from-transparent via-primary/20 to-transparent',
        orange: 'bg-gradient-to-r from-transparent via-primary-light/20 to-transparent',
        green:  'bg-gradient-to-r from-transparent via-secondary/15 to-transparent',
    };
    const glows = {
        cyan:   'bg-primary',
        blue:   'bg-primary',
        purple: 'bg-primary',
        orange: 'bg-primary-light',
        green:  'bg-secondary',
    };
    return (
        <div className="relative z-20 h-px w-full overflow-visible">
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[1.5px] ${lines[color]} blur-sm`} />
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[24px] ${glows[color]}/8 blur-[36px] rounded-full`} />
        </div>
    );
}
