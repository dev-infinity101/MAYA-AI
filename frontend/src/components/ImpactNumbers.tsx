import { ArrowUpRight, CheckCircle } from 'lucide-react';

export interface ImpactStats {
    drafts: number;
    submitted: number;
    schemes: number;
    funding_lakhs: number;
}

export const ImpactNumbers = ({ stats }: { stats: ImpactStats }) => {
    if (!stats) return null;

    const data = [
        { label: "Drafts Generated",    value: stats.drafts,   color: "text-emerald-400" },
        { label: "Apps Submitted",      value: stats.submitted, color: "text-blue-400" },
        { label: "Schemes Accessed",    value: stats.schemes,  color: "text-purple-400" },
        { label: "Est. Funding",        value: `₹${stats.funding_lakhs}L`, color: "text-amber-400" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.map(stat => (
                <div key={stat.label}
                     className="bg-white/[0.02] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between group hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[#A0A0A0] font-medium text-[12px] leading-snug pr-2">{stat.label}</span>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex shrink-0 items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors">
                            <ArrowUpRight size={14} className="text-white/40 group-hover:text-white/80 transition-colors" />
                        </div>
                    </div>
                    <div>
                        <p className={`text-3xl font-bold text-white mb-2 whitespace-nowrap tracking-tight`}>
                            {stat.value}
                        </p>
                        <p className="text-[11px] text-[#A0A0A0] flex items-center gap-1.5 font-medium mt-1">
                            <CheckCircle size={12} className={stat.color} /> Recorded
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
