
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { AgentMonitor } from '../components/AgentMonitor';
import { PageLoader } from '../components/PageLoader';
import { DocumentsAnimation } from '../components/DocumentsAnimation';
import { SchemeScanAnimation } from '../components/SchemeScanAnimation';
import { Search, Shield, Zap, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import chatInterface from '../Assets/chat-interface.png';

export function FeaturesPage() {


  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans relative">
      <PageLoader />
      {/* Warm ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-primary-light/[0.03] rounded-full blur-[180px]" />
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[160px]" />
      </div>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-28 min-h-[65vh] flex items-center z-10">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight text-text-primary">
                खोजें। मिलाएं। <span className="text-primary">आगे बढ़ें।</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                The most advanced AI-powered government scheme discovery and business guidance platform for Indian MSMEs.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link to="/chat">
                  <FancyOutlineLiftButton>
                    Start Exploring
                  </FancyOutlineLiftButton>
                </Link>
              </div>
            </div>
            
            {/* Visual Animation */}
            <div className="flex-1 w-full max-w-lg mx-auto lg:max-w-none">
              <div className="aspect-[4/3] w-full relative animate-in fade-in zoom-in duration-1000 bg-transparent">
                <DocumentsAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* 2. CORE CAPABILITIES */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-text-primary">Core Capabilities</h2>
            <p className="text-text-secondary text-lg">Everything you need to grow your business — bilkul free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard icon={<Search className="w-6 h-6 text-primary" />} title="Find Schemes Instantly" desc="Stop searching manually. Get matched with top government programs in seconds." />
            <FeatureCard icon={<Shield className="w-6 h-6 text-secondary" />} title="Eligibility Intelligence" desc="Our AI analyzes your business profile to check eligibility criteria automatically." />
            <FeatureCard icon={<Zap className="w-6 h-6 text-primary" />} title="Auto-Match System" desc="We rank schemes based on relevance to your specific business needs." />
            <FeatureCard icon={<MessageSquare className="w-6 h-6 text-secondary" />} title="Smart Explanation" desc="Understand complex government terms in simple, plain language." />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* 3. SCHEME DISCOVERY */}
      <section className="py-24 relative overflow-hidden z-10 bg-surface-warm">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 max-w-7xl mx-auto">
             <div className="flex-1 w-full">
                <div className="group relative rounded-3xl overflow-hidden aspect-square bg-transparent">
                    <SchemeScanAnimation />
                </div>
             </div>
             <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight text-text-primary">
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

      <SectionDivider />

      {/* 4. AI AGENTS HERO */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight text-text-primary">
            Meet Your <span className="text-primary">Team of Agents</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">4 specialized AI experts, available 24/7 to help you grow.</p>
        </div>

        <div className="container mx-auto px-6">
          <AgentMonitor />
        </div>
      </section>

      <SectionDivider />

      {/* 6. CHAT INTERFACE */}
      <section className="py-24 relative z-10 bg-surface-warm">
         <div className="container mx-auto px-6">
            <div className="group p-8 md:p-12 rounded-3xl border border-[rgba(196,97,10,0.12)] bg-white shadow-[0_4px_32px_rgba(150,80,0,0.07)] flex flex-col md:flex-row items-center gap-12 hover:shadow-[0_8px_48px_rgba(150,80,0,0.12)] transition-all duration-500">
                <div className="flex-1 order-2 md:order-1 relative z-10">
                    <div className="relative rounded-xl overflow-hidden border border-[rgba(196,97,10,0.12)]">
                        <img src={chatInterface} alt="Chat Interface" className="rounded-xl shadow-lg w-full group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 space-y-6 order-1 md:order-2 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary">
                        Modern, powerful <br/> <span className="text-primary">chat interface.</span>
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {['Conversation History', 'Quick Action Buttons', 'Rich Scheme Cards', 'Export Capabilities'].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-text-secondary group/item">
                                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover/item:bg-primary group-hover/item:scale-150 transition-all duration-300" />
                                <span className="font-medium group-hover/item:text-text-primary transition-colors duration-300">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-6 border-t border-[rgba(196,97,10,0.1)]">
                        <Link to="/chat">
                            <FancyOutlineLiftButton>
                                Try the Demo
                            </FancyOutlineLiftButton>
                        </Link>
                    </div>
                </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionDivider() {
    return (
        <div className="relative h-16 w-full overflow-visible flex items-center justify-center">
            <div className="absolute w-full max-w-[1200px] h-[1.5px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute w-full max-w-[600px] h-[28px] bg-primary/[0.05] blur-[36px] rounded-full" />
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group relative p-8 rounded-2xl border border-[rgba(196,97,10,0.10)] bg-white shadow-[0_2px_12px_rgba(150,80,0,0.05)] transition-all duration-500 hover:-translate-y-2 overflow-hidden hover:border-primary/25 hover:shadow-[0_8px_32px_rgba(196,97,10,0.10)]">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
                <div className="mb-6 p-4 rounded-xl bg-surface-warm border border-[rgba(196,97,10,0.10)] w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
                <p className="text-text-secondary leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function FeaturePoint({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-5 group/item p-4 rounded-xl transition-all duration-300 hover:bg-primary/5">
            <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-primary group-hover/item:scale-110 transition-all duration-300" /></div>
            <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary">{desc}</p>
            </div>
        </div>
    );
}
