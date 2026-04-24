import { ArrowUpRight, Activity } from 'lucide-react';

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

    const getGradeColorClass = (color: string) => {
        switch (color) {
            case 'emerald': return 'text-emerald-600';
            case 'blue':    return 'text-blue-600';
            case 'yellow':  return 'text-yellow-600';
            case 'orange':  return 'text-primary';
            default:        return 'text-text-primary';
        }
    };

    const getStrokeColor = (color: string) => {
        switch (color) {
            case 'emerald': return '#10b981';
            case 'blue':    return '#3b82f6';
            case 'yellow':  return '#d97706';
            case 'orange':  return '#C4610A';
            default:        return '#C4610A';
        }
    };

    return (
        <div className="space-y-10">
            {/* Score Overview */}
            <div className="flex flex-col sm:flex-row items-center gap-8 bg-white border border-[rgba(196,97,10,0.08)] rounded-[24px] p-6 shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
                <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke="rgba(196,97,10,0.08)"
                            strokeWidth="10" />
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke={getStrokeColor(score.grade.color)}
                            strokeWidth="10"
                            strokeDasharray={`${score.total_score * 2.51} 251`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-text-primary tracking-tight">
                            {score.total_score}
                        </span>
                        <span className="text-[11px] text-text-muted uppercase font-semibold tracking-wider mt-0.5">Score</span>
                    </div>
                </div>
                <div className="text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-warm text-text-primary text-[12px] font-medium mb-3 border border-[rgba(196,97,10,0.10)]">
                        <Activity size={13} className={getGradeColorClass(score.grade.color)} />
                        Status: <span className={getGradeColorClass(score.grade.color)}>{score.grade.label}</span>
                    </div>
                    <p className="text-text-secondary text-[15px] leading-relaxed">
                        Based on your profile, you are currently eligible for{' '}
                        <strong className="text-text-primary text-lg">{score.eligible_scheme_count} schemes</strong>.
                    </p>
                </div>
            </div>

            {/* Dimension bars */}
            <div className="space-y-8">
                {dimensions.map(dim => {
                    const val = score.dimensions[dim.key] || 0;
                    return (
                        <div key={dim.key} className="group">
                            <div className="flex items-end justify-between mb-3">
                                <span className="text-[15px] text-text-primary font-medium">{dim.label}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-text-primary">{val}</span>
                                    <span className="text-sm text-text-muted font-medium">/ 20</span>
                                </div>
                            </div>
                            <div className="h-2.5 bg-[rgba(196,97,10,0.07)] rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${(val / 20) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                                </div>
                            </div>
                            {score.recommendations[dim.key] && (
                                <div className="flex gap-3 items-start bg-primary/5 border border-primary/10 rounded-2xl p-4 transition-colors group-hover:bg-primary/8">
                                    <div className="w-7 h-7 shrink-0 rounded-full bg-primary/15 flex items-center justify-center text-primary mt-0.5">
                                        <ArrowUpRight size={14} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[13.5px] text-text-primary leading-relaxed">
                                        {score.recommendations[dim.key]}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
