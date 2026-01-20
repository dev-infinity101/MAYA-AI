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
            className={`group relative p-8 rounded-2xl border ${borderColor} bg-gradient-to-b ${bgGlow} to-black/40 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 text-center overflow-hidden z-10 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20`}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
        >
            {/* Enhanced Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
            
            {/* Animated border glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 blur-sm" />
            </div>
            
            <div className="relative z-10">
                <div className={`mx-auto mb-6 p-5 rounded-2xl bg-black/50 border ${borderColor} w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${color} group-hover:shadow-lg group-hover:shadow-emerald-500/50`}>
                    <div className="w-8 h-8 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-100 transition-colors duration-300">{title}</h3>
                <p className="text-sm text-emerald-100/50 group-hover:text-emerald-100/70 transition-colors duration-300">{desc}</p>
            </div>
        </div>
    )
}
