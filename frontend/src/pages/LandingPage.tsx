import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { FuturisticBeam } from '../components/FuturisticBeam';
import { ArrowRight, Shield, Brain, MessageSquare, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GreenMotion from '../Assets/GREEN_MOTION.mp4';
import { PixelMaya } from '../components/PixelMaya';

export function LandingPage() {
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
    <div className="min-h-screen bg-black overflow-hidden">
        {/* Enhanced Animated Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />
        </div>

        <Header />
      
        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-40">
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full opacity-30 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          
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
            
            <p className="text-xl text-emerald-100/70 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Discover government programs, get personalized business advice, and navigate growth with our specialized AI agents.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link to="/chat">
                  <button className="btn-modern-glow w-full sm:w-auto ">
                    <span className="relative z-10">Start Free Trial <ArrowRight className="inline-block ml-2 w-6 h-5" /></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
              </Link>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto btn-glow">
                View Demo
              </Button>
            </div>

            {/* Hero Visual with Parallax Effect */}
            <div className="mt-20 relative animate-in fade-in zoom-in duration-1000 delay-500 group">
              <div className="glass-panel p-2 rounded-2xl max-w-5xl mx-auto shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden backdrop-blur-md bg-black/40 group-hover:border-emerald-500/40 transition-all duration-500 group-hover:shadow-emerald-500/20">
                 <video 
                   autoPlay 
                   loop 
                   muted 
                   playsInline
                   className="rounded-xl w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                 >
                   <source src={GreenMotion} type="video/mp4" />
                   Your browser does not support the video tag.
                 </video>
                 {/* Enhanced Overlay Gradients */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent h-full w-full rounded-2xl pointer-events-none" />
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 h-full w-full rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
        </div>

        {/* 2. VALUE PROP SECTION */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard 
                icon={<Shield className="w-8 h-8 text-emerald-400" />}
                title="Scheme Navigator"
                desc="Find relevant government programs in seconds with instant eligibility checks."
              />
              <ValueCard 
                icon={<Brain className="w-8 h-8 text-cyan-400" />}
                title="Smart Agents"
                desc="4 specialized agents for branding, marketing, finance, and research."
              />
              <ValueCard 
                icon={<MessageSquare className="w-8 h-8 text-emerald-400" />}
                title="Modern Chat"
                desc="Clean, WhatsApp-like interface with history and quick actions."
              />
            </div>
          </div>
        </section>

        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
        </div>
                  
        {/* 3. FEATURE BLOCKS */}
        <section id="features" className="py-32 bg-black relative">
          <FuturisticBeam />
          <div className="container mx-auto px-6">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-24 mb-48">
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-500" />
                  <div className="glass-panel p-8 rounded-3xl relative z-10 border border-emerald-500/20 backdrop-blur-md bg-black/40 group-hover:border-emerald-500/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-500/20">
                      <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 group-hover:bg-emerald-500/10 transition-all duration-300">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">1</div>
                              <div>
                                  <h4 className="font-bold text-white">PMEGP Scheme</h4>
                                  <p className="text-xs text-emerald-100/60">Subsidy up to 35%</p>
                              </div>
                              <div className="ml-auto text-emerald-400 text-sm font-semibold">95% Match</div>
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60 hover:opacity-100 transition-opacity duration-300">
                              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">2</div>
                              <div>
                                  <h4 className="font-bold text-white">Mudra Loan</h4>
                                  <p className="text-xs text-emerald-100/60">Up to 10 Lakhs</p>
                              </div>
                              <div className="ml-auto text-cyan-400 text-sm font-semibold">82% Match</div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                  Find the right schemes <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">in seconds.</span>
                </h2>
                <p className="text-emerald-100/60 text-lg leading-relaxed">
                  Stop searching through endless government websites. Our AI analyzes your business profile and matches you with the top 3-5 schemes you're actually eligible for.
                </p>
                <ul className="space-y-4">
                  {['Instant Eligibility Check', 'Direct Application Links', 'Document Checklist'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white group/item">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover/item:scale-110 transition-transform duration-300" /> 
                      <span className="group-hover/item:text-emerald-200 transition-colors duration-300">{item}</span>
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
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full" />
                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      <AgentCard icon={<Users />} title="Market Agent" color="text-cyan-400" borderColor="border-cyan-500/30" />
                      <AgentCard icon={<Brain />} title="Brand Agent" color="text-emerald-400" borderColor="border-emerald-500/30" />
                      <AgentCard icon={<TrendingUp />} title="Finance Agent" color="text-green-400" borderColor="border-green-500/30" />
                      <AgentCard icon={<MessageSquare />} title="Marketing Agent" color="text-teal-400" borderColor="border-teal-500/30" />
                   </div>
                 </div>
              </div>
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                  Your Personal Board <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">of Advisors.</span>
                </h2>
                <p className="text-emerald-100/60 text-lg leading-relaxed">
                  Get expert advice on branding, marketing, finance, and market research. Our multi-agent system routes your query to the right specialist.
                </p>
                <ul className="space-y-4">
                  {['Competitor Analysis', 'Brand Name Generation', 'Low-budget Marketing Ideas'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white group/item">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 group-hover/item:scale-110 transition-transform duration-300" /> 
                      <span className="group-hover/item:text-emerald-200 transition-colors duration-300">{item}</span>
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

        {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
        </div>

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

        {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
        </div>

        {/* 5. CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />
          <div className="container mx-auto px-6 relative z-10 text-center">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                  Make smarter <br/> business decisions.
              </h2>
              <p className="text-xl text-emerald-100/60 mb-12">No credit card required. Start growing today.</p>
              <Link to="/chat">
                  <button className="btn-modern-glow sm:w-auto ">
                    <span className="relative z-10">Start Free</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
              </Link>
          </div>
        </section>

        <Footer />
        <PixelMaya />
      </div>
  );
}

// -----------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group relative p-8 rounded-2xl backdrop-blur-md bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10">
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6 p-4 rounded-xl bg-black/50 border border-emerald-500/20 w-fit group-hover:scale-110 transition-all duration-300 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:shadow-lg group-hover:shadow-emerald-500/50">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-200 transition-colors duration-300">{title}</h3>
        <p className="text-emerald-100/60 leading-relaxed group-hover:text-emerald-100/80 transition-colors duration-300">{desc}</p>
      </div>
    </div>
  );
}

function AgentCard({ icon, title, color, borderColor }: { icon: React.ReactNode, title: string, color: string, borderColor: string }) {
    return (
        <div className={`group p-6 rounded-2xl flex flex-col items-center text-center gap-4 backdrop-blur-md bg-black/40 border ${borderColor} hover:border-emerald-500/40 hover:-translate-y-2 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/20`}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-2xl" />
            <div className={`relative z-10 p-3 rounded-full bg-black/50 border ${borderColor} ${color} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
            <span className="relative z-10 font-medium text-white group-hover:text-emerald-200 transition-colors duration-300">{title}</span>
        </div>
    )
}

function Metric({ number, label }: { number: string, label: string }) {
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="metric-number mb-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{number}</div>
            <div className="text-[10px] md:text-xs font-medium text-emerald-100/40 uppercase tracking-[0.2em] group-hover:text-emerald-100/60 transition-colors duration-300">{label}</div>
        </div>
    )
}