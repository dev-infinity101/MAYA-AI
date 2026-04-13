interface HealthScore {
    total_score: number;
    max_score: number;
    grade: { label: string; color: string };
    dimensions: Record<string, number>;
    recommendations: Record<string, string>;
    eligible_scheme_count: number;
}

export const HealthScoreCard = ({ score }: { score: HealthScore }) => {
    const dimensions = [
        { key: "scheme_utilization", label: "Scheme Access" },
        { key: "registration",       label: "Compliance" },
        { key: "financial",          label: "Financial Health" },
        { key: "market_presence",    label: "Market Presence" },
        { key: "growth_readiness",   label: "Growth Readiness" },
    ];

    if (!score) return null;

    // Helper to map backend colors to Tailwind classes safely
    const getGradeColorClasses = (color: string) => {
        switch (color) {
            case 'emerald': return 'text-emerald-400';
            case 'blue': return 'text-blue-400';
            case 'yellow': return 'text-yellow-400';
            case 'orange': return 'text-orange-400';
            default: return 'text-white';
        }
    };
    
    const getStrokeColor = (color: string) => {
        switch (color) {
            case 'emerald': return '#10b981';
            case 'blue': return '#3b82f6';
            case 'yellow': return '#facc15';
            case 'orange': return '#f97316';
            default: return '#ffffff';
        }
    };

    return (
        <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-6 space-y-6">
            {/* Score circle */}
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8" />
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke={getStrokeColor(score.grade.color)}
                            strokeWidth="8"
                            strokeDasharray={`${score.total_score * 2.51} 251`}
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {score.total_score}
                        </span>
                        <span className="text-[10px] text-gray-400">/ 100</span>
                    </div>
                </div>
                <div>
                    <p className={`font-semibold text-lg ${getGradeColorClasses(score.grade.color)}`}>
                        {score.grade.label}
                    </p>
                    <p className="text-gray-400 text-sm mt-1 leading-snug">
                        Based on your profile, you are eligible for <strong className="text-white">{score.eligible_scheme_count} schemes</strong>.
                    </p>
                </div>
            </div>

            {/* Dimension bars */}
            <div className="space-y-4">
                {dimensions.map(dim => {
                    const val = score.dimensions[dim.key] || 0;
                    return (
                        <div key={dim.key}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-400">{dim.label}</span>
                                <span className="text-white font-medium">
                                    {val}/20
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(val / 20) * 100}%`
                                    }}
                                />
                            </div>
                            {score.recommendations[dim.key] && (
                                <p className="text-[11px] text-amber-500/80 mt-1.5 leading-snug flex gap-1 items-start">
                                    <span className="mt-0.5">↗</span>
                                    <span>{score.recommendations[dim.key]}</span>
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
