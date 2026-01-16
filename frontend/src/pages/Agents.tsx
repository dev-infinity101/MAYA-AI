import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { ArrowRight, BarChart3, PenTool, Megaphone, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AgentsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      {/* Enhanced Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[700px] h-[700px] bg-emerald-600/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-[65vh] flex items-center z-10">
        {/* Animated concentric circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight animate-in fade-in zoom-in duration-700 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
            Meet Your <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">Team of Agents</span>
          </h1>
          <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            4 specialized AI experts, available 24/7 to help you grow.
          </p>
        </div>
      </section>
        <br />
        <br />
        <br />
      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
      </div>

      {/* 2. AGENTS GRID with Hover Light Effect */}
      <section className="py-32 bg-black relative z-10">
        <div className="container mx-auto px-6">
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {/* Floating Light Source that follows hover */}
                {hoveredCard !== null && (
                  <div 
                    className="absolute pointer-events-none transition-all duration-500 ease-out z-0"
                    style={{
                      left: `${(hoveredCard % 4) * 25 + 12.5}%`,
                      top: `${Math.floor(hoveredCard / 4) * 100 + 50}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-[400px] h-[400px] bg-gradient-radial from-emerald-500/30 via-cyan-500/10 to-transparent rounded-full blur-[80px]" />
                  </div>
                )}
                
                <AgentOverviewCard 
                    index={0}
                    icon={<BarChart3 />} 
                    title="Market Research" 
                    desc="Competitor analysis & trends"
                    color="text-cyan-400"
                    borderColor="border-cyan-500/30"
                    bgGlow="from-cyan-500/5"
                    onHover={setHoveredCard}
                />
                <AgentOverviewCard 
                    index={1}
                    icon={<PenTool />} 
                    title="Brand Strategy" 
                    desc="Naming & positioning"
                    color="text-emerald-400"
                    borderColor="border-emerald-500/30"
                    bgGlow="from-emerald-500/5"
                    onHover={setHoveredCard}
                />
                <AgentOverviewCard 
                    index={2}
                    icon={<Megaphone />} 
                    title="Marketing" 
                    desc="Campaigns & ROI"
                    color="text-teal-400"
                    borderColor="border-teal-500/30"
                    bgGlow="from-teal-500/5"
                    onHover={setHoveredCard}
                />
                <AgentOverviewCard 
                    index={3}
                    icon={<Calculator />} 
                    title="Financial" 
                    desc="Pricing & planning"
                    color="text-green-400"
                    borderColor="border-green-500/30"
                    bgGlow="from-green-500/5"
                    onHover={setHoveredCard}
                />
            </div>
        </div>
      </section>

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-cyan-500/10 blur-[50px] rounded-full" />
      </div>

      {/* 3. DETAILED AGENT SECTIONS */}
      
      {/* Market Agent */}
      <AgentSection 
        id="market"
        title="Market Research Agent"
        desc="Deep dive into your industry landscape. Understand your competitors, identify gaps, and spot emerging trends before they happen."
        capabilities={['Competitive Analysis', 'Local Demand Estimation', 'Industry Trends', 'SWOT Analysis']}
        icon={<BarChart3 className="w-12 h-12 text-cyan-400" />}
        color="blue"
        align="left"
      />

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
      </div>

      {/* Brand Agent */}
      <AgentSection 
        id="brand"
        title="Brand Strategy Agent"
        desc="Craft a memorable identity. From catchy business names to compelling taglines and mission statements that resonate with your audience."
        capabilities={['Business Name Generation', 'Tagline Creation', 'Brand Voice Guidelines', 'Value Proposition Design']}
        icon={<PenTool className="w-12 h-12 text-emerald-400" />}
        color="purple"
        align="right"
      />

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-teal-500/10 blur-[50px] rounded-full" />
      </div>

      {/* Marketing Agent */}
      <AgentSection 
        id="marketing"
        title="Marketing Agent"
        desc="Growth strategies that fit your budget. Get actionable plans for social media, local advertising, and customer acquisition."
        capabilities={['Low-budget Campaign Ideas', 'Social Media Calendar', 'Go-to-Market Strategy', 'ROI Estimation']}
        icon={<Megaphone className="w-12 h-12 text-teal-400" />}
        color="orange"
        align="left"
      />

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-green-500/10 blur-[50px] rounded-full" />
      </div>

      {/* Financial Agent */}
      <AgentSection 
        id="financial"
        title="Financial Agent"
        desc="Master your numbers. Get help with pricing strategies, profit margin calculations, and break-even analysis."
        capabilities={['Pricing Strategy', 'Profit Margin Calculation', 'Cost Breakdown', 'Break-even Analysis']}
        icon={<Calculator className="w-12 h-12 text-green-400" />}
        color="green"
        align="right"
      />

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-cyan-500/10 blur-[50px] rounded-full" />
      </div>

      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              Ready to work with your new team?
            </h2>
            <Link to="/chat">
                <FancyOutlineLiftButton>
                    Ask agents
                </FancyOutlineLiftButton>
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AgentOverviewCard({ index, icon, title, desc, color, borderColor, bgGlow, onHover }: { 
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

function LightLeak({ color = 'cyan' }: { color?: 'cyan' | 'blue' | 'purple' | 'orange' | 'green' }) {
    const colors = {
        cyan: 'bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent',
        blue: 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent',
        purple: 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent',
        orange: 'bg-gradient-to-r from-transparent via-teal-500/30 to-transparent',
        green: 'bg-gradient-to-r from-transparent via-green-500/30 to-transparent',
    };
    const glows = {
        cyan: 'bg-cyan-500',
        blue: 'bg-blue-500',
        purple: 'bg-emerald-500',
        orange: 'bg-teal-500',
        green: 'bg-green-500',
    };
    return (
        <div className="relative z-20 h-px w-full overflow-visible">
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[2px] ${colors[color]} blur-sm`} />
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[30px] ${glows[color]}/10 blur-[40px] rounded-full`} />
        </div>
    );
}

interface AgentSectionProps {
    id: string;
    title: string;
    desc: string;
    capabilities: string[];
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'orange' | 'green';
    align: 'left' | 'right';
}

function AgentSection({ id, title, desc, capabilities, icon, color, align }: AgentSectionProps) {
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