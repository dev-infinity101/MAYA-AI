import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { LightLeak } from '../components/LightLeak';
import { AgentOverviewCard } from '../components/AgentOverviewCard';
import { AgentSection } from '../components/AgentSection';
import { FuturisticBeam } from '../components/FuturisticBeam';
import { Search, Shield, Zap, MessageSquare, CheckCircle2, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      {/* Enhanced Animated Background Gradients from Agents.tsx */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[700px] h-[700px] bg-emerald-600/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <Header />
      <br />
      <br />
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-32 min-h-[65vh] flex items-center z-10">
        <FuturisticBeam className="h-[calc(100%+8rem)]" />

        {/* Animated concentric circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight animate-in fade-in zoom-in duration-700 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
            Discover. Match. Apply.
          </h1>
          <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            The most advanced AI-powered government scheme discovery and business guidance platform for Indian MSMEs.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link to="/chat">
                <FancyOutlineLiftButton>
                    Start Exploring
                </FancyOutlineLiftButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">Core Capabilities</h2>
            <p className="text-emerald-100/60 text-lg">Everything you need to grow your business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard icon={<Search className="w-6 h-6 text-emerald-400" />} title="Find Schemes Instantly" desc="Stop searching manually. Get matched with top government programs in seconds." />
            <FeatureCard icon={<Shield className="w-6 h-6 text-cyan-400" />} title="Eligibility Intelligence" desc="Our AI analyzes your business profile to check eligibility criteria automatically." />
            <FeatureCard icon={<Zap className="w-6 h-6 text-emerald-400" />} title="Auto-Match System" desc="We rank schemes based on relevance to your specific business needs." />
            <FeatureCard icon={<MessageSquare className="w-6 h-6 text-cyan-400" />} title="Smart Explanation" desc="Understand complex government terms in simple, plain language." />
          </div>
        </div>
      </section>

      <LightLeak color="green" />

      {/* 3. SCHEME DISCOVERY */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 max-w-7xl mx-auto">
             <div className="flex-1 w-full">
                <div className="group relative p-12 rounded-3xl border border-emerald-500/20 backdrop-blur-md bg-black/40 overflow-hidden hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-6">
                        <div className="h-4 w-3/4 bg-gradient-to-r from-emerald-500/20 to-transparent rounded animate-pulse" />
                        <div className="h-48 bg-black/50 rounded-xl border border-emerald-500/20 p-6 backdrop-blur-sm group-hover:border-emerald-500/40 transition-colors duration-500">
                             <div className="h-4 w-1/2 bg-emerald-500/30 rounded mb-4" />
                             <div className="h-2 w-full bg-emerald-500/10 rounded mb-2" />
                             <div className="h-2 w-5/6 bg-emerald-500/10 rounded" />
                        </div>
                        <div className="h-48 bg-black/50 rounded-xl border border-cyan-500/20 p-6 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
                             <div className="h-4 w-1/2 bg-cyan-500/30 rounded mb-4" />
                             <div className="h-2 w-full bg-cyan-500/10 rounded mb-2" />
                        </div>
                    </div>
                </div>
             </div>
             <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                    AI-powered <br/> <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Scheme Discovery</span>
                </h2>
                <div className="space-y-6">
                    <FeaturePoint title="Vector Search + LLM Ranking" desc="We use advanced vector embeddings to understand the semantic meaning of your business needs, not just keyword matching." />
                    <FeaturePoint title="Smart Filters" desc="Filter precisely by location, industry type, turnover, and business category to find exactly what fits." />
                    <FeaturePoint title="Why it matches?" desc="Our AI provides a clear explanation of why a specific scheme is relevant to your business profile." />
                </div>
             </div>
          </div>
        </div>
      </section>

      <LightLeak color="blue" />

      {/* 4. AI AGENTS HERO */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
            Meet Your <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">Team of Agents</span>
          </h2>
          <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto">4 specialized AI experts, available 24/7 to help you grow.</p>
        </div>

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
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                    <title>business-products-deal-handshake</title>
                    <g>
                      <path d="M30.48 7.62H32v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="m27.43 15.24 0 1.52 -3.04 0 0 1.53 3.04 0 0 9.14 -6.09 0 0 1.52 6.09 0 0 1.53 4.57 0 0 -15.24 -4.57 0z" strokeWidth="1"></path>
                      <path d="M28.96 9.14h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                      <path d="M27.43 7.62h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="M25.91 9.14h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                      <path d="M25.91 1.53h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M24.39 7.62h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M22.86 15.24h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="M21.34 13.72h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="m21.34 22.86 -1.53 0 0 3.05 -3.04 0 0 3.04 1.52 0 0 -1.52 3.05 0 0 -4.57z" strokeWidth="1"></path>
                      <path d="M18.29 21.34h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M18.29 3.05h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M16.77 19.81h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                      <path d="M16.77 16.76h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                      <path d="M15.24 12.19h6.1v1.53h-6.1Z" strokeWidth="1"></path>
                      <path d="M16.77 4.57h1.52V6.1h-1.52Z" strokeWidth="1"></path>
                      <path d="M16.77 1.53h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M15.24 24.38h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                      <path d="M15.24 18.29h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="M15.24 3.05h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="m13.72 30.48 -4.57 0 0 1.52 6.09 0 0 -1.52 1.53 0 0 -1.53 -3.05 0 0 1.53z" strokeWidth="1"></path>
                      <path d="M13.72 13.72h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M12.19 27.43h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="M12.19 19.81h3.05v1.53h-3.05Z" strokeWidth="1"></path>
                      <path d="M12.19 15.24h1.53v1.52h-1.53Z" strokeWidth="1"></path>
                      <path d="M10.67 12.19h3.05v1.53h-3.05Z" strokeWidth="1"></path>
                      <path d="M10.67 25.91h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M10.67 16.76h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                      <path d="M10.67 6.1h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M9.15 13.72h1.52v1.52H9.15Z" strokeWidth="1"></path>
                      <path d="M7.62 28.95h1.53v1.53H7.62Z" strokeWidth="1"></path>
                      <path d="M7.62 15.24h1.53v1.52H7.62Z" strokeWidth="1"></path>
                      <path d="m4.58 27.43 0 -9.14 3.04 0 0 -1.53 -3.04 0 0 -1.52 -4.58 0 0 15.24 4.58 0 0 -1.53 3.04 0 0 -1.52 -3.04 0z" strokeWidth="1"></path>
                      <path d="M6.1 0h1.52v1.53H6.1Z" strokeWidth="1"></path>
                      <path d="m4.58 12.19 0 -1.52 1.52 0 0 -1.53 -1.52 0 0 -1.52 -1.53 0 0 1.52 -1.52 0 0 1.53 1.52 0 0 1.52 1.53 0z" strokeWidth="1"></path>
                    </g>
                  </svg>
                } 
                title="Market Research" 
                desc="Competitor analysis & trends"
                color="text-cyan-400"
                borderColor="border-cyan-500/30"
                bgGlow="from-cyan-500/5"
                onHover={setHoveredCard}
            />
            <AgentOverviewCard 
                index={1}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
                    <title>interface-essential-link-broken-1</title>
                    <g>
                      <path d="M30.48 7.62H32v10.66h-1.52Z" strokeWidth="1"></path>
                      <path d="M28.95 18.28h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                      <path d="M28.95 6.09h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                      <path d="M19.81 19.81h9.14v1.52h-9.14Z" strokeWidth="1"></path>
                      <path d="M25.91 10.67h1.52v4.57h-1.52Z" strokeWidth="1"></path>
                      <path d="M19.81 9.14h6.1v1.53h-6.1Z" strokeWidth="1"></path>
                      <path d="M19.81 15.24h6.1v1.52h-6.1Z" strokeWidth="1"></path>
                      <path d="M19.81 4.57h9.14v1.52h-9.14Z" strokeWidth="1"></path>
                      <path d="M18.29 16.76h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                      <path d="M18.29 6.09h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                      <path d="M15.24 21.33h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                      <path d="M13.72 24.38h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M12.19 19.81h3.05v1.52h-3.05Z" strokeWidth="1"></path>
                      <path d="M13.72 1.52h1.52v4.57h-1.52Z" strokeWidth="1"></path>
                      <path d="M12.19 25.9h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                      <path d="M10.67 27.43h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                      <path d="M10.67 21.33h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                      <path d="M9.15 22.86h1.52v1.52H9.15Z" strokeWidth="1"></path>
                      <path d="M9.15 15.24h1.52v3.04H9.15Z" strokeWidth="1"></path>
                      <path d="M4.57 28.95h6.1v1.53h-6.1Z" strokeWidth="1"></path>
                      <path d="M7.62 18.28h1.53v1.53H7.62Z" strokeWidth="1"></path>
                      <path d="M6.1 13.71h3.05v1.53H6.1Z" strokeWidth="1"></path>
                      <path d="M6.1 24.38h3.05v1.52H6.1Z" strokeWidth="1"></path>
                      <path d="M6.1 19.81h1.52v1.52H6.1Z" strokeWidth="1"></path>
                      <path d="M4.57 9.14h4.58v1.53H4.57Z" strokeWidth="1"></path>
                      <path d="m4.57 3.05 3.05 0 0 3.04 3.05 0 0 3.05 1.52 0 0 -4.57 -3.04 0 0 -3.05 -4.58 0 0 1.53z" strokeWidth="1"></path>
                      <path d="M4.57 21.33H6.1v3.05H4.57Z" strokeWidth="1"></path>
                      <path d="M4.57 15.24H6.1v1.52H4.57Z" strokeWidth="1"></path>
                      <path d="M3.05 27.43h1.52v1.52H3.05Z" strokeWidth="1"></path>
                      <path d="M3.05 16.76h1.52v1.52H3.05Z" strokeWidth="1"></path>
                      <path d="M1.53 25.9h1.52v1.53H1.53Z" strokeWidth="1"></path>
                      <path d="M1.53 18.28h1.52v1.53H1.53Z" strokeWidth="1"></path>
                      <path d="M0 19.81h1.53v6.09H0Z" strokeWidth="1"></path>
                    </g>
                  </svg>
                } 
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
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                    <title>money-payments-bank</title>
                    <g>
                      <path d="M30.47 10.67h-1.52V9.14h-1.52v1.53h-3.05v1.52h1.52v12.19h-3.05v-4.57h-1.52v4.57h-1.52v-3.05h-1.53v3.05h-4.57v-3.05h-1.52v3.05h-1.53v-4.57H9.14v4.57H6.09V12.19h1.53v-1.52H4.57V9.14H3.04v1.53H1.52V7.62H0v4.57h1.52v15.24H0V32h32v-4.57h-1.53V12.19H32V7.62h-1.53Zm-3.04 1.52h1.52v12.19h-1.52Zm-24.39 0h1.53v12.19H3.04Zm0 13.72h25.91v1.52H3.04Zm27.43 4.57H1.52v-1.53h28.95Z" strokeWidth="1"></path>
                      <path d="M27.43 6.1h3.04v1.52h-3.04Z" strokeWidth="1"></path>
                      <path d="M24.38 7.62h3.05v1.52h-3.05Z" strokeWidth="1"></path>
                      <path d="M24.38 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
                      <path d="M21.33 6.1h3.05v1.52h-3.05Z" strokeWidth="1"></path>
                      <path d="M21.33 3.05h3.05v1.52h-3.05Z" strokeWidth="1"></path>
                      <path d="M18.28 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
                      <path d="M18.28 1.52h3.05v1.53h-3.05Z" strokeWidth="1"></path>
                      <path d="M13.71 6.1v1.52h-1.52v1.52h-1.53v1.53H9.14v4.57h1.52v1.52h1.53v1.53h1.52v1.52h4.57v-1.52h1.53v-1.53h1.52v-1.52h1.52v-4.57h-1.52V9.14h-1.52V7.62h-1.53V6.1Zm4.57 3.04v1.53h-4.57v1.52h4.57v1.52h1.53v1.53h-1.53v1.52h-1.52v1.53h-1.52v-1.53h-1.53v-1.52h4.57v-1.53h-4.57v-1.52h-1.52v-1.52h1.52V9.14h1.53V7.62h1.52v1.52Z" strokeWidth="1"></path>
                      <path d="M13.71 3.05h4.57v1.52h-4.57Z" strokeWidth="1"></path>
                      <path d="M13.71 0h4.57v1.52h-4.57Z" strokeWidth="1"></path>
                      <path d="M10.66 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
                      <path d="M10.66 1.52h3.05v1.53h-3.05Z" strokeWidth="1"></path>
                      <path d="M7.62 6.1h3.04v1.52H7.62Z" strokeWidth="1"></path>
                      <path d="M7.62 3.05h3.04v1.52H7.62Z" strokeWidth="1"></path>
                      <path d="M4.57 7.62h3.05v1.52H4.57Z" strokeWidth="1"></path>
                      <path d="M4.57 4.57h3.05V6.1H4.57Z" strokeWidth="1"></path>
                      <path d="M1.52 6.1h3.05v1.52H1.52Z" strokeWidth="1"></path>
                    </g>
                  </svg>
                } 
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

      <LightLeak color="cyan" />

      {/* 5. AGENT DETAILS */}
      <AgentSection 
        id="market"
        title="Market Research Agent"
        desc="Stay ahead of the competition. Get deep insights into market trends, competitor strategies, and customer behavior."
        capabilities={['Competitor Analysis', 'Web search with tavily api ', 'Customer Persona Building', 'SWOT Analysis']}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-12 h-12 text-cyan-400" fill="currentColor">
            <title>business-products-deal-handshake</title>
            <g>
              <path d="M30.48 7.62H32v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="m27.43 15.24 0 1.52 -3.04 0 0 1.53 3.04 0 0 9.14 -6.09 0 0 1.52 6.09 0 0 1.53 4.57 0 0 -15.24 -4.57 0z" strokeWidth="1"></path>
              <path d="M28.96 9.14h1.52v1.53h-1.52Z" strokeWidth="1"></path>
              <path d="M27.43 7.62h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="M25.91 9.14h1.52v1.53h-1.52Z" strokeWidth="1"></path>
              <path d="M25.91 1.53h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M24.39 7.62h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M22.86 15.24h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="M21.34 13.72h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="m21.34 22.86 -1.53 0 0 3.05 -3.04 0 0 3.04 1.52 0 0 -1.52 3.05 0 0 -4.57z" strokeWidth="1"></path>
              <path d="M18.29 21.34h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M18.29 3.05h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M16.77 19.81h1.52v1.53h-1.52Z" strokeWidth="1"></path>
              <path d="M16.77 16.76h1.52v1.53h-1.52Z" strokeWidth="1"></path>
              <path d="M15.24 12.19h6.1v1.53h-6.1Z" strokeWidth="1"></path>
              <path d="M16.77 4.57h1.52V6.1h-1.52Z" strokeWidth="1"></path>
              <path d="M16.77 1.53h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M15.24 24.38h1.53v1.53h-1.53Z" strokeWidth="1"></path>
              <path d="M15.24 18.29h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="M15.24 3.05h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="m13.72 30.48 -4.57 0 0 1.52 6.09 0 0 -1.52 1.53 0 0 -1.53 -3.05 0 0 1.53z" strokeWidth="1"></path>
              <path d="M13.72 13.72h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M12.19 27.43h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="M12.19 19.81h3.05v1.53h-3.05Z" strokeWidth="1"></path>
              <path d="M12.19 15.24h1.53v1.52h-1.53Z" strokeWidth="1"></path>
              <path d="M10.67 12.19h3.05v1.53h-3.05Z" strokeWidth="1"></path>
              <path d="M10.67 25.91h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M10.67 16.76h1.52v3.05h-1.52Z" strokeWidth="1"></path>
              <path d="M10.67 6.1h1.52v1.52h-1.52Z" strokeWidth="1"></path>
              <path d="M9.15 13.72h1.52v1.52H9.15Z" strokeWidth="1"></path>
              <path d="M7.62 28.95h1.53v1.53H7.62Z" strokeWidth="1"></path>
              <path d="M7.62 15.24h1.53v1.52H7.62Z" strokeWidth="1"></path>
              <path d="m4.58 27.43 0 -9.14 3.04 0 0 -1.53 -3.04 0 0 -1.52 -4.58 0 0 15.24 4.58 0 0 -1.53 3.04 0 0 -1.52 -3.04 0z" strokeWidth="1"></path>
              <path d="M6.1 0h1.52v1.53H6.1Z" strokeWidth="1"></path>
              <path d="m4.58 12.19 0 -1.52 1.52 0 0 -1.53 -1.52 0 0 -1.52 -1.53 0 0 1.52 -1.52 0 0 1.53 1.52 0 0 1.52 1.53 0z" strokeWidth="1"></path>
            </g>
          </svg>
        }
        color="green"
        align="left"
      />
      
      <LightLeak color="purple" />
      
      <AgentSection 
          id="brand"
          title="Brand Strategy Agent"
          desc="Craft a memorable identity. From catchy business names to compelling taglines and mission statements."
          capabilities={['Business Name Generation', 'Tagline Creation', 'Brand Voice Guidelines', 'Value Proposition Design']}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-12 h-12 text-emerald-400" fill="currentColor">
              <title>interface-essential-link-broken-1</title>
              <g>
                <path d="M30.48 7.62H32v10.66h-1.52Z" strokeWidth="1"></path>
                <path d="M28.95 18.28h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                <path d="M28.95 6.09h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                <path d="M19.81 19.81h9.14v1.52h-9.14Z" strokeWidth="1"></path>
                <path d="M25.91 10.67h1.52v4.57h-1.52Z" strokeWidth="1"></path>
                <path d="M19.81 9.14h6.1v1.53h-6.1Z" strokeWidth="1"></path>
                <path d="M19.81 15.24h6.1v1.52h-6.1Z" strokeWidth="1"></path>
                <path d="M19.81 4.57h9.14v1.52h-9.14Z" strokeWidth="1"></path>
                <path d="M18.29 16.76h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                <path d="M18.29 6.09h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                <path d="M15.24 21.33h1.52v3.05h-1.52Z" strokeWidth="1"></path>
                <path d="M13.72 24.38h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                <path d="M12.19 19.81h3.05v1.52h-3.05Z" strokeWidth="1"></path>
                <path d="M13.72 1.52h1.52v4.57h-1.52Z" strokeWidth="1"></path>
                <path d="M12.19 25.9h1.53v1.53h-1.53Z" strokeWidth="1"></path>
                <path d="M10.67 27.43h1.52v1.52h-1.52Z" strokeWidth="1"></path>
                <path d="M10.67 21.33h1.52v1.53h-1.52Z" strokeWidth="1"></path>
                <path d="M9.15 22.86h1.52v1.52H9.15Z" strokeWidth="1"></path>
                <path d="M9.15 15.24h1.52v3.04H9.15Z" strokeWidth="1"></path>
                <path d="M4.57 28.95h6.1v1.53h-6.1Z" strokeWidth="1"></path>
                <path d="M7.62 18.28h1.53v1.53H7.62Z" strokeWidth="1"></path>
                <path d="M6.1 13.71h3.05v1.53H6.1Z" strokeWidth="1"></path>
                <path d="M6.1 24.38h3.05v1.52H6.1Z" strokeWidth="1"></path>
                <path d="M6.1 19.81h1.52v1.52H6.1Z" strokeWidth="1"></path>
                <path d="M4.57 9.14h4.58v1.53H4.57Z" strokeWidth="1"></path>
                <path d="m4.57 3.05 3.05 0 0 3.04 3.05 0 0 3.05 1.52 0 0 -4.57 -3.04 0 0 -3.05 -4.58 0 0 1.53z" strokeWidth="1"></path>
                <path d="M4.57 21.33H6.1v3.05H4.57Z" strokeWidth="1"></path>
                <path d="M4.57 15.24H6.1v1.52H4.57Z" strokeWidth="1"></path>
                <path d="M3.05 27.43h1.52v1.52H3.05Z" strokeWidth="1"></path>
                <path d="M3.05 16.76h1.52v1.52H3.05Z" strokeWidth="1"></path>
                <path d="M1.53 25.9h1.52v1.53H1.53Z" strokeWidth="1"></path>
                <path d="M1.53 18.28h1.52v1.53H1.53Z" strokeWidth="1"></path>
                <path d="M0 19.81h1.53v6.09H0Z" strokeWidth="1"></path>
              </g>
            </svg>
          }
          color="purple"
          align="right"
        />
      
      <LightLeak color="orange" />
      
      <AgentSection 
        id="marketing"
        title="Marketing Agent"
        desc="Growth strategies that fit your budget. Get actionable plans for social media, local advertising, and customer acquisition."
        capabilities={['Low-budget Campaign Ideas', 'Social Media Calendar', 'Go-to-Market Strategy', 'ROI Estimation']}
        icon={<Megaphone className="w-12 h-12 text-teal-400" />}
        color="orange"
        align="left"
      />
      
      <LightLeak color="green" />
      
      <AgentSection 
        id="financial"
        title="Financial Agent"
        desc="Master your numbers. Get help with pricing strategies, profit margin calculations, and break-even analysis."
        capabilities={['Pricing Strategy', 'Profit Margin Calculation', 'Cost Breakdown', 'Break-even Analysis']}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-12 h-12 text-green-400" fill="currentColor">
            <title>money-payments-bank</title>
            <g>
              <path d="M30.47 10.67h-1.52V9.14h-1.52v1.53h-3.05v1.52h1.52v12.19h-3.05v-4.57h-1.52v4.57h-1.52v-3.05h-1.53v3.05h-4.57v-3.05h-1.52v3.05h-1.53v-4.57H9.14v4.57H6.09V12.19h1.53v-1.52H4.57V9.14H3.04v1.53H1.52V7.62H0v4.57h1.52v15.24H0V32h32v-4.57h-1.53V12.19H32V7.62h-1.53Zm-3.04 1.52h1.52v12.19h-1.52Zm-24.39 0h1.53v12.19H3.04Zm0 13.72h25.91v1.52H3.04Zm27.43 4.57H1.52v-1.53h28.95Z" strokeWidth="1"></path>
              <path d="M27.43 6.1h3.04v1.52h-3.04Z" strokeWidth="1"></path>
              <path d="M24.38 7.62h3.05v1.52h-3.05Z" strokeWidth="1"></path>
              <path d="M24.38 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
              <path d="M21.33 6.1h3.05v1.52h-3.05Z" strokeWidth="1"></path>
              <path d="M21.33 3.05h3.05v1.52h-3.05Z" strokeWidth="1"></path>
              <path d="M18.28 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
              <path d="M18.28 1.52h3.05v1.53h-3.05Z" strokeWidth="1"></path>
              <path d="M13.71 6.1v1.52h-1.52v1.52h-1.53v1.53H9.14v4.57h1.52v1.52h1.53v1.53h1.52v1.52h4.57v-1.52h1.53v-1.53h1.52v-1.52h1.52v-4.57h-1.52V9.14h-1.52V7.62h-1.53V6.1Zm4.57 3.04v1.53h-4.57v1.52h4.57v1.52h1.53v1.53h-1.53v1.52h-1.52v1.53h-1.52v-1.53h-1.53v-1.52h4.57v-1.53h-4.57v-1.52h-1.52v-1.52h1.52V9.14h1.53V7.62h1.52v1.52Z" strokeWidth="1"></path>
              <path d="M13.71 3.05h4.57v1.52h-4.57Z" strokeWidth="1"></path>
              <path d="M13.71 0h4.57v1.52h-4.57Z" strokeWidth="1"></path>
              <path d="M10.66 4.57h3.05V6.1h-3.05Z" strokeWidth="1"></path>
              <path d="M10.66 1.52h3.05v1.53h-3.05Z" strokeWidth="1"></path>
              <path d="M7.62 6.1h3.04v1.52H7.62Z" strokeWidth="1"></path>
              <path d="M7.62 3.05h3.04v1.52H7.62Z" strokeWidth="1"></path>
              <path d="M4.57 7.62h3.05v1.52H4.57Z" strokeWidth="1"></path>
              <path d="M4.57 4.57h3.05V6.1H4.57Z" strokeWidth="1"></path>
              <path d="M1.52 6.1h3.05v1.52H1.52Z" strokeWidth="1"></path>
            </g>
          </svg>
        }
        color="green"
        align="right"
      />

      <LightLeak color="cyan" />

      {/* 6. CHAT INTERFACE */}
      <section className="py-32 relative z-10">
         <div className="container mx-auto px-6">
            <div className="group p-8 md:p-12 rounded-3xl border border-emerald-500/20 backdrop-blur-md bg-black/40 flex flex-col md:flex-row items-center gap-12 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
                <div className="flex-1 order-2 md:order-1 relative z-10">
                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors duration-500">
                        <img src="https://placehold.co/800x600/000000/10b981?text=Chat+Interface" alt="Chat Interface" className="rounded-xl shadow-2xl w-full group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 space-y-8 order-1 md:order-2 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                        Modern, powerful <br/> chat interface.
                    </h2>
                    <ul className="space-y-4">
                        {['Conversation History', 'Quick Action Buttons', 'Rich Scheme Cards', 'Export Capabilities'].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-emerald-100/70 group/item">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover/item:scale-150 group-hover/item:shadow-lg group-hover/item:shadow-emerald-500/50 transition-all duration-300" /> 
                                <span className="group-hover/item:text-emerald-200 transition-colors duration-300">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <br />
                    <Link to="/chat">
                        <FancyOutlineLiftButton>
                            Try the Demo
                        </FancyOutlineLiftButton>
                    </Link>
                </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group relative p-8 rounded-2xl border border-emerald-500/20 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 overflow-hidden hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
                <div className="mb-6 p-4 rounded-xl bg-black/50 border border-emerald-500/20 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-emerald-500/50">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-100 transition-colors duration-300">{title}</h3>
                <p className="text-emerald-100/60 leading-relaxed group-hover:text-emerald-100/80 transition-colors duration-300">{desc}</p>
            </div>
        </div>
    )
}

function FeaturePoint({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-5 group/item p-4 rounded-xl transition-all duration-300 hover:bg-white/5">
            <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover/item:scale-110 group-hover/item:text-cyan-400 transition-all duration-300" /></div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover/item:text-emerald-200 transition-colors duration-300">{title}</h3>
                <p className="text-emerald-100/60 group-hover/item:text-emerald-100/80 transition-colors duration-300">{desc}</p>
            </div>
        </div>
    )
}
