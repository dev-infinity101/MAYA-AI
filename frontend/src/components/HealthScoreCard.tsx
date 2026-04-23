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
        <div className="space-y-10">
            {/* Score Overview */}
            <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/[0.02] border border-white/5 rounded-[24px] p-6">
                <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke="rgba(255,255,255,0.05)"
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
                        <span className="text-4xl font-bold text-white tracking-tight">
                            {score.total_score}
                        </span>
                        <span className="text-[11px] text-[#A0A0A0] uppercase font-semibold tracking-wider mt-1">Score</span>
                    </div>
                </div>
                <div className="text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white text-[12px] font-medium mb-3 border border-white/10">
                        <Activity size={14} className={getGradeColorClasses(score.grade.color)} />
                        Status: <span className={getGradeColorClasses(score.grade.color)}>{score.grade.label}</span>
                    </div>
                    <p className="text-[#A0A0A0] text-[15px] leading-relaxed">
                        Based on your profile, you are currently eligible for <strong className="text-white text-lg">{score.eligible_scheme_count} schemes</strong>.
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
                                <span className="text-[15px] text-white font-medium">{dim.label}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{val}</span>
                                    <span className="text-sm text-[#A0A0A0] font-medium">/ 20</span>
                                </div>
                            </div>
                            
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${(val / 20) * 100}%` }}
                                >
                                    {/* Subtle gloss effect inside the bar */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 w-full rounded-full"></div>
                                </div>
                            </div>

                            {score.recommendations[dim.key] && (
                                <div className="flex gap-4 items-start bg-primary/5 border border-primary/10 rounded-2xl p-4 transition-colors group-hover:bg-primary/10">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-0.5">
                                        <ArrowUpRight size={16} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[13.5px] text-white/90 leading-relaxed font-medium">
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
