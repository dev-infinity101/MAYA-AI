import React from 'react';

interface AgentSectionProps {
    id: string;
    title: string;
    desc: string;
    capabilities: string[];
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'orange' | 'green';
    align: 'left' | 'right';
}

export function AgentSection({ id, title, desc, capabilities, icon, color, align }: AgentSectionProps) {
    const isLeft = align === 'left';
    
    const colorClasses = {
        blue: 'from-cyan-500/20 text-cyan-400 border-cyan-500/30 bg-cyan-500',
        purple: 'from-emerald-500/20 text-emerald-400 border-emerald-500/30 bg-emerald-500',
        orange: 'from-teal-500/20 text-teal-400 border-teal-500/30 bg-teal-500',
        green: 'from-green-500/20 text-green-400 border-green-500/30 bg-green-500',
    };

    const activeColor = colorClasses[color];

    return (
        <section id={id} className="py-32 relative overflow-hidden bg-black">
            {/* Side Glow Effect */}
            <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-r ${activeColor.split(' ')[0]} to-transparent blur-[120px] opacity-20 pointer-events-none`} />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 max-w-7xl mx-auto`}>
                    {/* Visual Card */}
                    <div className="flex-1 w-full">
                        <div className={`group relative p-12 rounded-3xl border ${activeColor.split(' ')[2]} bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-md overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20`}>
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                {/* Icon Container */}
                                <div className={`p-8 rounded-full bg-black/70 border ${activeColor.split(' ')[2]} ${activeColor.split(' ')[1]} group-hover:scale-110 transition-transform duration-500 group-hover:shadow-lg group-hover:shadow-emerald-500/50`}>
                                    {icon}
                                </div>
                                
                                {/* Abstract Loading Bars */}
                                <div className="space-y-3 w-full max-w-[200px]">
                                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-full" />
                                    </div>
                                    <div className="h-2 w-2/3 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rounded-full overflow-hidden mx-auto">
                                        <div className="h-full w-1/2 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-full" />
                                    </div>
                                </div>
                                
                                {/* Abstract Visual Grid */}
                                <div className="w-full h-40 rounded-xl bg-black/50 border border-emerald-500/10 flex items-center justify-center backdrop-blur-sm group-hover:border-emerald-500/30 transition-colors duration-500">
                                    <div className="grid grid-cols-3 gap-3 p-6">
                                        {[...Array(9)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 group-hover:border-emerald-400/40 transition-all duration-500"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                            {title}
                        </h2>
                        <p className="text-lg text-emerald-100/60 leading-relaxed max-w-xl">
                            {desc}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                            {capabilities.map((cap, i) => (
                                <div key={i} className="group/item flex items-center gap-3 text-white">
                                    <div className={`w-2 h-2 rounded-full ${activeColor.split(' ')[3]} group-hover/item:scale-150 group-hover/item:shadow-lg group-hover/item:shadow-emerald-500/50 transition-all duration-300`} />
                                    <span className="text-sm font-medium group-hover/item:text-emerald-200 transition-colors duration-300">{cap}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
