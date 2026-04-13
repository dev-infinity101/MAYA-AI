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
        { label: "Applications Submitted", value: stats.submitted, color: "text-blue-400" },
        { label: "Schemes Accessed",    value: stats.schemes,  color: "text-purple-400" },
        { label: "Est. Funding Unlocked", value: `₹${stats.funding_lakhs}L`, color: "text-amber-400" },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {data.map(stat => (
                <div key={stat.label}
                     className="bg-black/40 border border-white/10 
                               rounded-xl p-4 text-center transition-all hover:bg-white/5 
                               hover:border-white/20">
                    <p className={`text-2xl font-bold ${stat.color} mb-1 drop-shadow-md`}>
                        {stat.value}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
    );
};
