import React from 'react';

export function AgentOverviewCard({ index, icon, title, desc, color, borderColor, bgGlow, onHover }: {
  index: number,
  icon: React.ReactNode,
  title: string,
  desc: string,
  color: string,
  borderColor: string,
  bgGlow: string,
  onHover: (index: number | null) => void
}) {
    return (
        <div
            className={`group relative p-8 rounded-2xl border ${borderColor} bg-white shadow-[0_2px_12px_rgba(150,80,0,0.06)] transition-all duration-500 hover:-translate-y-3 text-center overflow-hidden z-10 hover:border-primary/35 hover:shadow-[0_8px_32px_rgba(196,97,10,0.12)]`}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className={`mx-auto mb-6 p-5 rounded-2xl bg-surface-warm border ${borderColor} w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${color} group-hover:shadow-lg group-hover:shadow-primary/15`}>
                    <div className="w-8 h-8 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
                <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300">{desc}</p>
            </div>
        </div>
    );
}
