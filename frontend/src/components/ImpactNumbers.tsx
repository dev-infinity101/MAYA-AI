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
        { label: "Drafts Generated",  value: stats.drafts,               color: "text-secondary" },
        { label: "Apps Submitted",     value: stats.submitted,            color: "text-blue-600" },
        { label: "Schemes Accessed",   value: stats.schemes,              color: "text-purple-600" },
        { label: "Est. Funding",       value: `₹${stats.funding_lakhs}L`, color: "text-primary" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.map(stat => (
                <div
                    key={stat.label}
                    className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[22px] p-5 flex flex-col justify-between group hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(150,80,0,0.06)] transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-text-secondary font-medium text-[12px] leading-snug pr-2">{stat.label}</span>
                        <div className="w-8 h-8 rounded-full border border-[rgba(196,97,10,0.10)] flex shrink-0 items-center justify-center bg-surface-warm group-hover:bg-[#FDE8C0] transition-colors">
                            <ArrowUpRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                    <div>
                        <p className={`text-3xl font-bold text-text-primary mb-1.5 whitespace-nowrap tracking-tight`}>
                            {stat.value}
                        </p>
                        <p className="text-[11px] text-text-secondary flex items-center gap-1.5 font-medium">
                            <CheckCircle size={12} className={stat.color} /> Recorded
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
