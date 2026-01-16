import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { LoadingScreen } from '../components/LoadingScreen';
import { ArrowRight, Shield, Brain, MessageSquare, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GreenMotion from '../Assets/GREEN_MOTION.mp4';
import { PixelMaya } from '../components/PixelMaya';

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  
  const rotatingTexts = ["AI Guidance", "Scheme Navigation", "Agentic workflow"];
  const totalItems = rotatingTexts.length;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalItems);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, totalItems]);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      <div className={`min-h-screen bg-black overflow-hidden transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Header />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-40">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          
          <h1 className="hero-title text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Smarter Business
            Decisions with 
            <span 
              ref={containerRef}
              className="scroll-container cursor-pointer"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <span 
                className="scroll-text"
                style={{ transform: `translateY(-${index * 1.5}em)` }}
              >
                {rotatingTexts.map((text, i) => (
                  <span 
                    key={i} 
                    className="scroll-item text-[#00FFB2]"
                  >
                    {text}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Discover government programs, get personalized business advice, and navigate growth with our specialized AI agents.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link to="/chat">
                <button className="btn-modern-glow w-full sm:w-auto">
                Start Free Trial <ArrowRight className="inline-block ml-2 w-6 h-5" />
                </button>
            </Link>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto btn-glow">
              View Demo
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="glass-panel p-2 rounded-2xl max-w-5xl mx-auto shadow-2xl shadow-primary/10 border border-white/10 overflow-hidden">
               <video 
                 autoPlay 
                 loop 
                 muted 
                 playsInline
                 className="rounded-xl w-full h-auto opacity-80"
               >
                 <source src={GreenMotion} type="video/mp4" />
                 Your browser does not support the video tag.
               </video>
               {/* Overlay Gradients */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent h-full w-full rounded-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROP SECTION */}
      <section className="py-48 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Scheme Navigator"
              desc="Find relevant government programs in seconds with instant eligibility checks."
            />
            <ValueCard 
              icon={<Brain className="w-8 h-8 text-secondary" />}
              title="Smart Agents"
              desc="4 specialized agents for branding, marketing, finance, and research."
            />
            <ValueCard 
              icon={<MessageSquare className="w-8 h-8 text-primary" />}
              title="Modern Chat"
              desc="Clean, WhatsApp-like interface with history and quick actions."
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURE BLOCKS */}
      <section id="features" className="py-48 bg-black relative">
        <div className="container mx-auto px-6">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-24 mb-48">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
                <div className="glass-panel p-8 rounded-3xl relative z-10 border border-white/10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">1</div>
                            <div>
                                <h4 className="font-bold">PMEGP Scheme</h4>
                                <p className="text-xs text-text-secondary">Subsidy up to 35%</p>
                            </div>
                            <div className="ml-auto text-primary text-sm">95% Match</div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 opacity-60">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">2</div>
                            <div>
                                <h4 className="font-bold">Mudra Loan</h4>
                                <p className="text-xs text-text-secondary">Up to 10 Lakhs</p>
                            </div>
                            <div className="ml-auto text-secondary text-sm">82% Match</div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Find the right schemes <br />
                <span className="text-primary">in seconds.</span>
              </h2>
              <p className="text-text-secondary text-lg">
                Stop searching through endless government websites. Our AI analyzes your business profile and matches you with the top 3-5 schemes you're actually eligible for.
              </p>
              <ul className="space-y-4">
                {['Instant Eligibility Check', 'Direct Application Links', 'Document Checklist'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              <br />
              <Link to="/chat">
                <FancyOutlineLiftButton>
                  Try Scheme Finder
                </FancyOutlineLiftButton>
              </Link>
            </div>
          </div>

          {/* Feature 2 (Alternating) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-24">
            <div className="flex-1">
               <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 blur-[80px] rounded-full" />
                 <div className="grid grid-cols-2 gap-4 relative z-10">
                    <AgentCard icon={<Users />} title="Market Agent" color="text-blue-400" />
                    <AgentCard icon={<Brain />} title="Brand Agent" color="text-purple-400" />
                    <AgentCard icon={<TrendingUp />} title="Finance Agent" color="text-green-400" />
                    <AgentCard icon={<MessageSquare />} title="Marketing Agent" color="text-orange-400" />
                 </div>
               </div>
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Your Personal Board <br />
                <span className="text-secondary">of Advisors.</span>
              </h2>
              <p className="text-text-secondary text-lg">
                Get expert advice on branding, marketing, finance, and market research. Our multi-agent system routes your query to the right specialist.
              </p>
              <ul className="space-y-4">
                {['Competitor Analysis', 'Brand Name Generation', 'Low-budget Marketing Ideas'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> {item}
                  </li>
                ))}
              </ul>
              <br />
              <Link to="/agents">
                <FancyOutlineLiftButton>
                  Meet the Agents
                </FancyOutlineLiftButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. METRICS */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32">
                <Metric number="10,000+" label="Queries Answered" />
                <Metric number="95%" label="User Satisfaction" />
                <Metric number="₹50Cr+" label="Loans Facilitated" />
            </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-black opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
                Make smarter <br/> business decisions.
            </h2>
            <p className="text-xl text-text-secondary mb-12">No credit card required. Start growing today.</p>
            <Link to="/chat">
                <button className="btn-modern-glow px-12">Start Free</button>
            </Link>
        </div>
      </section>

      <Footer />
      <PixelMaya />
    </div>
    </>
  );
}

// -----------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-500 group relative overflow-hidden border border-white/5 hover:border-primary/40 hover:-translate-y-1 shadow-2xl hover:shadow-primary/10">
      {/* Abstract Glow Background - Always moving */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-20 group-hover:opacity-50 transition-opacity duration-700">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,255,178,0.15)_0%,transparent_70%)] animate-glow-slow" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,201,255,0.1)_0%,transparent_70%)] animate-glow-slow [animation-delay:-5s]" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_rgba(0,255,178,0.2)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-text-secondary leading-relaxed group-hover:text-white/90 transition-colors duration-300">{desc}</p>
      </div>
    </div>
  );
}

function AgentCard({ icon, title, color }: { icon: React.ReactNode, title: string, color: string }) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
            <div className={`p-3 rounded-full bg-white/5 ${color}`}>{icon}</div>
            <span className="font-medium text-white">{title}</span>
        </div>
    )
}

function Metric({ number, label }: { number: string, label: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="metric-number mb-1">{number}</div>
            <div className="text-[10px] md:text-xs font-medium text-white/40 uppercase tracking-[0.2em]">{label}</div>
        </div>
    )
}
