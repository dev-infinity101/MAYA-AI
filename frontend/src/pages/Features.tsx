import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Search, Shield, Zap, MessageSquare, ArrowRight, Brain, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full opacity-40 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
            Discover. Match. Apply.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            The most advanced AI-powered government scheme discovery and business guidance platform for Indian MSMEs.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link to="/chat">
                <Button className='btn-modern-glow w-full sm:w-auto'>
                    Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURES OVERVIEW GRID */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Capabilities</h2>
            <p className="text-text-secondary">Everything you need to grow your business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-primary" />}
              title="Find Schemes Instantly"
              desc="Stop searching manually. Get matched with top government programs in seconds."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-secondary" />}
              title="Eligibility Intelligence"
              desc="Our AI analyzes your business profile to check eligibility criteria automatically."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Auto-Match System"
              desc="We rank schemes based on relevance to your specific business needs."
            />
             <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-secondary" />}
              title="Smart Explanation"
              desc="Understand complex government terms in simple, plain language."
            />
          </div>
        </div>
      </section>

      {/* 3. SCHEME NAVIGATOR DEEP-DIVE */}
      <section className="py-24 bg-white/5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1">
                {/* Abstract Visual Placeholder */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 space-y-4">
                        {/* Mock UI Elements */}
                        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                        <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4">
                             <div className="h-4 w-1/2 bg-primary/20 rounded mb-2" />
                             <div className="h-2 w-full bg-white/10 rounded mb-1" />
                             <div className="h-2 w-5/6 bg-white/10 rounded" />
                        </div>
                        <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 opacity-70">
                             <div className="h-4 w-1/2 bg-secondary/20 rounded mb-2" />
                             <div className="h-2 w-full bg-white/10 rounded mb-1" />
                        </div>
                    </div>
                </div>
             </div>
             <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-bold text-white leading-tight">
                    AI-powered <br/> <span className="text-primary">Scheme Discovery</span>
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

      {/* 4. MULTI-AGENT SYSTEM */}
      <section className="py-24 relative">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Specialized AI Agents</h2>
                <p className="text-text-secondary">A complete board of advisors for your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AgentDetailCard 
                    icon={<Users />} 
                    title="Market Agent" 
                    desc="Analyzes market size, competitors, and trends."
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                    borderColor="border-blue-400/20"
                />
                <AgentDetailCard 
                    icon={<Brain />} 
                    title="Brand Agent" 
                    desc="Generates business names, taglines, and positioning."
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                    borderColor="border-purple-400/20"
                />
                <AgentDetailCard 
                    icon={<Target />} 
                    title="Marketing Agent" 
                    desc="Creates low-budget campaigns and social media strategies."
                    color="text-orange-400"
                    bg="bg-orange-400/10"
                    borderColor="border-orange-400/20"
                />
                <AgentDetailCard 
                    icon={<TrendingUp />} 
                    title="Financial Agent" 
                    desc="Helps with pricing, profitability, and cost estimations."
                    color="text-green-400"
                    bg="bg-green-400/10"
                    borderColor="border-green-400/20"
                />
            </div>
         </div>
      </section>

      {/* 5. CHAT EXPERIENCE */}
      <section className="py-24 bg-gradient-to-b from-black to-white/5">
         <div className="container mx-auto px-6">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 order-2 md:order-1">
                    <img 
                        src="https://placehold.co/800x600/111/444?text=Chat+Interface" 
                        alt="Chat Interface" 
                        className="rounded-xl shadow-2xl border border-white/10"
                    />
                </div>
                <div className="flex-1 space-y-8 order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Modern, powerful <br/> chat interface.
                    </h2>
                    <ul className="space-y-4">
                        {['Conversation History', 'Quick Action Buttons', 'Rich Scheme Cards', 'Export Capabilities'].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-text-secondary">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/chat">
                        <Button variant="primary" size="lg" className="mt-4">
                            Try the Demo
                        </Button>
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
        <div className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group">
            <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            <div className="mt-4 text-primary text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
            </div>
        </div>
    )
}

function FeaturePoint({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-text-secondary">{desc}</p>
            </div>
        </div>
    )
}

function AgentDetailCard({ icon, title, desc, color, bg, borderColor }: { icon: React.ReactNode, title: string, desc: string, color: string, bg: string, borderColor: string }) {
    return (
        <div className={`glass-panel p-6 rounded-2xl border ${borderColor} hover:-translate-y-2 transition-transform duration-300`}>
            <div className={`p-4 rounded-full w-fit mb-4 ${bg} ${color}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-text-secondary text-sm">{desc}</p>
        </div>
    )
}
