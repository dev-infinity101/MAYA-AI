import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Users, Brain, TrendingUp, Target, ArrowRight, BarChart3, PenTool, Megaphone, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AgentsPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,201,255,0.05),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,255,178,0.05),transparent_40%)] pointer-events-none" />
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight animate-in fade-in zoom-in duration-700">
            <br />
            <br />
            <br />
            Meet Your <span className="bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] bg-clip-text text-transparent">Team of Agents</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            4 specialized AI experts, available 24/7 to help you grow.
          </p>
        </div>
      </section>

      {/* 2. AGENTS GRID */}
      <section className="py-40 bg-white/5">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AgentOverviewCard 
                    icon={<BarChart3 />} 
                    title="Market Research" 
                    desc="Competitor analysis & trends"
                    color="text-blue-400"
                    borderColor="border-blue-400/20"
                />
                <AgentOverviewCard 
                    icon={<PenTool />} 
                    title="Brand Strategy" 
                    desc="Naming & positioning"
                    color="text-purple-400"
                    borderColor="border-purple-400/20"
                />
                <AgentOverviewCard 
                    icon={<Megaphone />} 
                    title="Marketing" 
                    desc="Campaigns & ROI"
                    color="text-orange-400"
                    borderColor="border-orange-400/20"
                />
                <AgentOverviewCard 
                    icon={<Calculator />} 
                    title="Financial" 
                    desc="Pricing & planning"
                    color="text-green-400"
                    borderColor="border-green-400/20"
                />
            </div>
        </div>
      </section>

      {/* 3. DETAILED AGENT SECTIONS */}
      
      {/* Market Agent */}
      <AgentSection 
        id="market"
        title="Market Research Agent"
        desc="Deep dive into your industry landscape. Understand your competitors, identify gaps, and spot emerging trends before they happen."
        capabilities={['Competitive Analysis', 'Local Demand Estimation', 'Industry Trends', 'SWOT Analysis']}
        icon={<BarChart3 className="w-12 h-12 text-blue-400" />}
        color="blue"
        align="left"
      />

      {/* Brand Agent */}
      <AgentSection 
        id="brand"
        title="Brand Strategy Agent"
        desc="Craft a memorable identity. From catchy business names to compelling taglines and mission statements that resonate with your audience."
        capabilities={['Business Name Generation', 'Tagline Creation', 'Brand Voice Guidelines', 'Value Proposition Design']}
        icon={<PenTool className="w-12 h-12 text-purple-400" />}
        color="purple"
        align="right"
      />

      {/* Marketing Agent */}
      <AgentSection 
        id="marketing"
        title="Marketing Agent"
        desc="Growth strategies that fit your budget. Get actionable plans for social media, local advertising, and customer acquisition."
        capabilities={['Low-budget Campaign Ideas', 'Social Media Calendar', 'Go-to-Market Strategy', 'ROI Estimation']}
        icon={<Megaphone className="w-12 h-12 text-orange-400" />}
        color="orange"
        align="left"
      />

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

      <section className="py-24 text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-8">Ready to work with your new team?</h2>
            <Link to="/chat">
                <Button variant="primary" size="lg" glow>
                    Start Free Consultation <ArrowRight className="ml-2" />
                </Button>
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AgentOverviewCard({ icon, title, desc, color, borderColor }: { icon: React.ReactNode, title: string, desc: string, color: string, borderColor: string }) {
    return (
        <div className={`glass-panel p-6 rounded-xl border ${borderColor} hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 group text-center`}>
            <div className={`mx-auto mb-4 p-4 rounded-full bg-white/5 w-fit group-hover:scale-110 transition-transform ${color}`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
        </div>
    )
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
    
    // Map color names to Tailwind classes safely
    const colorClasses = {
        blue: 'from-blue-500/20 text-blue-400 border-blue-500/30',
        purple: 'from-purple-500/20 text-purple-400 border-purple-500/30',
        orange: 'from-orange-500/20 text-orange-400 border-orange-500/30',
        green: 'from-green-500/20 text-green-400 border-green-500/30',
    };

    const activeColor = colorClasses[color];

    return (
        <section id={id} className="py-40 relative overflow-hidden">
            <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-r ${activeColor.split(' ')[0]} to-transparent blur-[100px] opacity-30 pointer-events-none`} />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-24`}>
                    <div className="flex-1">
                        <div className={`glass-panel p-10 rounded-3xl border ${activeColor.split(' ')[2]} relative group overflow-hidden`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                             <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className={`p-6 rounded-full bg-black/50 ${activeColor.split(' ')[1]}`}>
                                    {icon}
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-24 bg-white/20 rounded mx-auto" />
                                    <div className="h-2 w-16 bg-white/20 rounded mx-auto" />
                                </div>
                                {/* Abstract Visual Representation */}
                                <div className="w-full h-32 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                                    <span className="text-xs text-text-secondary uppercase tracking-widest">Agent Visualization</span>
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">{title}</h2>
                        <p className="text-xl text-text-secondary leading-relaxed max-w-xl">
                            {desc}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {capabilities.map((cap, i) => (
                                <div key={i} className="flex items-center gap-3 text-white">
                                    <div className={`w-2 h-2 rounded-full ${activeColor.split(' ')[1].replace('text-', 'bg-')}`} />
                                    <span className="text-sm font-medium">{cap}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6">
                            <Link to="/chat">
                                <Button variant="outline" className="gap-2">
                                    Ask {title.split(' ')[0]} Agent <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
