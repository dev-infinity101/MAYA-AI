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

    const c = {
        blue:   { text: 'text-secondary',  border: 'border-secondary/20',      dot: 'bg-secondary',   iconBg: 'bg-secondary/8',   glow: 'bg-secondary/8'   },
        purple: { text: 'text-primary',    border: 'border-primary/20',        dot: 'bg-primary',     iconBg: 'bg-primary/8',     glow: 'bg-primary/8'     },
        orange: { text: 'text-purple-700', border: 'border-purple-400/20',     dot: 'bg-purple-500',  iconBg: 'bg-purple-500/8',  glow: 'bg-purple-500/8'  },
        green:  { text: 'text-amber-700',  border: 'border-amber-500/20',      dot: 'bg-amber-600',   iconBg: 'bg-amber-500/8',   glow: 'bg-amber-500/8'   },
    }[color];

    return (
        <section id={id} className="py-24 relative overflow-hidden bg-background">
            <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-1/3 h-full ${c.glow} blur-[120px] opacity-40 pointer-events-none`} />

            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 max-w-7xl mx-auto`}>
                    {/* Visual Card */}
                    <div className="flex-1 w-full">
                        <div className={`group relative p-12 rounded-3xl border ${c.border} bg-white shadow-[0_4px_24px_rgba(150,80,0,0.07)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(150,80,0,0.12)] hover:border-primary/20`}>
                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                <div className={`p-8 rounded-full ${c.iconBg} border ${c.border} ${c.text} group-hover:scale-110 transition-transform duration-500`}>
                                    {icon}
                                </div>

                                <div className="space-y-3 w-full max-w-[200px]">
                                    <div className="h-2 w-full bg-[rgba(196,97,10,0.08)] rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gradient-to-r from-primary/40 to-primary-light/30 rounded-full" />
                                    </div>
                                    <div className="h-2 w-2/3 bg-[rgba(196,97,10,0.08)] rounded-full overflow-hidden mx-auto">
                                        <div className="h-full w-1/2 bg-gradient-to-r from-primary/40 to-primary-light/30 rounded-full" />
                                    </div>
                                </div>

                                <div className="w-full h-40 rounded-xl bg-surface-warm border border-[rgba(196,97,10,0.08)] flex items-center justify-center group-hover:border-primary/15 transition-colors duration-500">
                                    <div className="grid grid-cols-3 gap-3 p-6">
                                        {[...Array(9)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-10 h-10 rounded-lg bg-[rgba(196,97,10,0.06)] border border-[rgba(196,97,10,0.10)] group-hover:bg-[rgba(196,97,10,0.10)] group-hover:border-primary/20 transition-all duration-500"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight text-text-primary">
                            {title}
                        </h2>
                        <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                            {desc}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                            {capabilities.map((cap, i) => (
                                <div key={i} className="group/item flex items-center gap-3 text-text-primary">
                                    <div className={`w-2 h-2 rounded-full ${c.dot} group-hover/item:scale-150 transition-all duration-300`} />
                                    <span className="text-sm font-medium group-hover/item:text-primary transition-colors duration-300">{cap}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
