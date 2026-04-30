import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import FancyOutlineLiftButton from '../components/FancyOutlineLiftButton';
import { ArrowRight, Shield, MessageSquare, CheckCircle2, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';
import { LotusAnimation } from '../components/LotusAnimation';
import chatInterface from '../Assets/chat-interface.png';

export function LandingPage() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  
  const rotatingTexts = ["AI Guidance", "Scheme Navigation", "Agentic workflow"];
  const totalItems = rotatingTexts.length;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalItems);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, totalItems]);

  // Parallax removed — image area displays clearly without blur

  return (
    <div className="min-h-screen bg-background overflow-hidden">
        <PageLoader />
        <Header />
      
        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex items-center pt-28 pb-20">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left — text content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="hero-title text-text-primary mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                        <span key={i} className="scroll-item text-primary">{text}</span>
                      ))}
                    </span>
                  </span>
                </h1>

                <p className="text-xl text-text-secondary max-w-xl mx-auto lg:mx-0 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  Discover government programs, get personalized business advice, and navigate growth with our specialized AI agents.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <Link to="/chat">
                    <button className="btn-modern-glow w-full sm:w-auto">
                      <span className="relative z-10">Start Free Trial <ArrowRight className="inline-block ml-2 w-6 h-5" /></span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </Link>
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-text-secondary hover:text-text-primary border border-[rgba(196,97,10,0.15)] hover:border-primary/30 px-8 py-3 rounded-xl transition-all">
                    View Demo
                  </Button>
                </div>
              </div>

              {/* Right — lotus flower animation */}
              <div className="flex-1 w-full max-w-sm lg:max-w-none flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-400">
                <div className="w-full" style={{ maxWidth: '420px', aspectRatio: '1 / 1' }}>
                  <LotusAnimation />
                </div>
              </div>
            </div>

            {/* Hero Visual — image area below (no blur) */}
            <div
              ref={heroVisualRef}
              className="mt-20 relative animate-in fade-in zoom-in duration-1000 delay-600"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="rounded-3xl max-w-5xl mx-auto overflow-hidden border border-[rgba(196,97,10,0.15)] bg-white shadow-[0_8px_32px_rgba(150,80,0,0.10)] group">
                <div className="relative">
                  <img 
                    src={chatInterface} 
                    alt="MAYA Chat Interface" 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-24 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </section>

        {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-[rgba(196,97,10,0.05)] blur-[50px] rounded-full" />
        </div>

        {/* 2. VALUE PROP SECTION */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueCard 
                icon={<Shield className="w-8 h-8 text-primary" />}
                title="Scheme Navigator"
                desc="Find relevant government programs in seconds with instant eligibility checks."
              />
              <ValueCard 
                icon={
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 32 32"
                    className="w-8 h-8 text-secondary"
                    fill="currentColor"
                  >
                    <title>technology-robot-ai-signal-2</title> 
                    <g> 
                      <path d="m27.425 13.71 -1.52 0 0 -4.57 -1.53 0 0 12.19 1.53 0 0 -6.09 1.52 0 0 1.52 1.53 0 0 -4.57 -1.53 0 0 1.52z" strokeWidth="1"></path> 
                      <path d="m22.855 28.95 0 3.05 1.52 0 0 -1.52 3.05 0 0 1.52 1.53 0 0 -4.57 -1.53 0 0 1.52 -4.57 0z" strokeWidth="1"></path> 
                      <path d="M25.905 1.52h1.52v1.53h-1.52Z" strokeWidth="1"></path> 
                      <path d="M24.375 3.05h1.53v1.52h-1.53Z" strokeWidth="1"></path> 
                      <path d="M24.375 0h1.53v1.52h-1.53Z" strokeWidth="1"></path> 
                      <path d="M22.855 21.33h1.52v1.53h-1.52Z" strokeWidth="1"></path> 
                      <path d="M22.855 7.62h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="m21.335 13.71 -1.53 0 0 -1.52 -1.52 0 0 3.05 1.52 0 0 1.52 1.53 0 0 -1.52 1.52 0 0 -3.05 -1.52 0 0 1.52z" strokeWidth="1"></path> 
                      <path d="M21.335 1.52h1.52v1.53h-1.52Z" strokeWidth="1"></path> 
                      <path d="M9.145 22.86v1.52h1.52v1.52h-6.1v1.53h22.86V25.9h-6.09v-1.52h1.52v-1.52Zm10.66 3.04h-7.62v-1.52h7.62Z" strokeWidth="1"></path> 
                      <path d="M19.805 3.05h1.53v1.52h-1.53Z" strokeWidth="1"></path> 
                      <path d="M19.805 0h1.53v1.52h-1.53Z" strokeWidth="1"></path> 
                      <path d="m10.665 28.95 0 3.05 1.52 0 0 -1.52 7.62 0 0 1.52 1.53 0 0 -3.05 -10.67 0z" strokeWidth="1"></path> 
                      <path d="M16.755 1.52h1.53v1.53h-1.53Z" strokeWidth="1"></path> 
                      <path d="m16.755 18.28 -1.52 0 0 1.53 -1.52 0 0 1.52 4.57 0 0 -1.52 -1.53 0 0 -1.53z" strokeWidth="1"></path> 
                      <path d="M15.235 0h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="M13.715 1.52h1.52v1.53h-1.52Z" strokeWidth="1"></path> 
                      <path d="m13.715 12.19 -1.53 0 0 1.52 -1.52 0 0 -1.52 -1.52 0 0 3.05 1.52 0 0 1.52 1.52 0 0 -1.52 1.53 0 0 -3.05z" strokeWidth="1"></path> 
                      <path d="m10.665 9.14 1.52 0 0 1.53 7.62 0 0 -1.53 1.53 0 0 -1.52 1.52 0 0 -1.53 -6.1 0 0 -3.04 -1.52 0 0 3.04 -6.09 0 0 1.53 1.52 0 0 1.52z" strokeWidth="1"></path> 
                      <path d="M10.665 3.05h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="M10.665 0h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="M9.145 1.52h1.52v1.53h-1.52Z" strokeWidth="1"></path> 
                      <path d="M7.615 21.33h1.53v1.53h-1.53Z" strokeWidth="1"></path> 
                      <path d="M7.615 7.62h1.53v1.52h-1.53Z" strokeWidth="1"></path> 
                      <path d="m7.615 9.14 -1.52 0 0 4.57 -1.53 0 0 -1.52 -1.52 0 0 4.57 1.52 0 0 -1.52 1.53 0 0 6.09 1.52 0 0 -12.19z" strokeWidth="1"></path> 
                      <path d="M6.095 3.05h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="M6.095 0h1.52v1.52h-1.52Z" strokeWidth="1"></path> 
                      <path d="M4.565 1.52h1.53v1.53h-1.53Z" strokeWidth="1"></path> 
                      <path d="m3.045 32 1.52 0 0 -1.52 3.05 0 0 1.52 1.53 0 0 -3.05 -4.58 0 0 -1.52 -1.52 0 0 4.57z" strokeWidth="1"></path> 
                    </g> 
                  </svg>
                }
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

        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-[rgba(196,97,10,0.05)] blur-[50px] rounded-full" />
        </div>
                  
        {/* 3. FEATURE BLOCKS */}
        <section id="features" className="py-32 bg-background relative">
          <div className="container mx-auto px-6">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-24 mb-48">
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/6 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-500" />
                  <div className="p-8 rounded-3xl relative z-10 border border-[rgba(196,97,10,0.14)] bg-white group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-[0_8px_40px_rgba(150,80,0,0.12)]">
                      <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-warm border border-[rgba(196,97,10,0.12)] group-hover:bg-[#FDE8C0] transition-all duration-300">
                              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">1</div>
                              <div>
                                  <h4 className="font-bold text-text-primary">PMEGP Scheme</h4>
                                  <p className="text-xs text-text-muted">Subsidy up to 35%</p>
                              </div>
                              <div className="ml-auto text-primary text-sm font-semibold">95% Match</div>
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F0EA] border border-[rgba(196,97,10,0.08)] opacity-70 hover:opacity-100 transition-opacity duration-300">
                              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">2</div>
                              <div>
                                  <h4 className="font-bold text-text-primary">Mudra Loan</h4>
                                  <p className="text-xs text-text-muted">Up to 10 Lakhs</p>
                              </div>
                              <div className="ml-auto text-secondary text-sm font-semibold">82% Match</div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-text-primary font-display">
                  Find the right schemes <br />
                  <span className="text-primary">in seconds.</span>
                </h2>
                <p className="text-text-secondary text-lg leading-relaxed">
                  Stop searching through endless government websites. Our AI analyzes your business profile and matches you with the top 3-5 schemes you're actually eligible for.
                </p>
                <ul className="space-y-4">
                  {['Instant Eligibility Check', 'Direct Application Links', 'Document Checklist'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-text-primary group/item">
                      <CheckCircle2 className="w-5 h-5 text-secondary group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="group-hover/item:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2 (Alternating) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-24">
              <div className="flex-1">
                 <div className="relative">
                  <div className="absolute inset-0 bg-secondary/8 blur-[80px] rounded-full" />
                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      <AgentCard 
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
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
                        title="Market Research Agent"
                        color="text-secondary"
                        borderColor="border-secondary/20"
                      />
                      <AgentCard 
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
                        title="Brand Agent"
                        color="text-primary"
                        borderColor="border-primary/20"
                      />
                      <AgentCard 
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
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
                        title="Finance Agent"
                        color="text-amber-700"
                        borderColor="border-amber-500/20"
                      />
                      <AgentCard icon={<Megaphone />} title="Marketing Agent" color="text-purple-700" borderColor="border-purple-400/20" />
                   </div>
                 </div>
              </div>
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-text-primary font-display">
                  Your Personal Board <br />
                  <span className="text-primary">of Advisors.</span>
                </h2>
                <p className="text-text-secondary text-lg leading-relaxed">
                  Get expert advice on branding, marketing, finance, and market research. Our multi-agent system routes your query to the right specialist.
                </p>
                <ul className="space-y-4">
                  {['Competitor Analysis', 'Brand Name Generation', 'Low-budget Marketing Ideas'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-text-primary group/item">
                      <CheckCircle2 className="w-5 h-5 text-secondary group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="group-hover/item:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Glowing Section Divider */}
        <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
          <div className="absolute w-full max-w-[1400px] h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-[rgba(196,97,10,0.05)] blur-[50px] rounded-full" />
        </div>

        {/* 4. METRICS */}
        <section className="py-24 bg-surface-warm">
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
          <div className="absolute w-full max-w-[1400px] h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="absolute w-full max-w-[1000px] h-[40px] bg-[rgba(196,97,10,0.05)] blur-[50px] rounded-full" />
        </div>

        {/* 5. CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(196,97,10,0.04)] to-transparent" />
          <div className="container mx-auto px-6 relative z-10 text-center">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 text-text-primary font-display">
                  Make smarter <br/> business decisions.
              </h2>
              <p className="text-xl text-text-secondary mb-12">No credit card required. Start growing today.</p>
              <Link to="/chat">
                  <FancyOutlineLiftButton>
                    Start Free
                  </FancyOutlineLiftButton>
              </Link>
          </div>
        </section>
        <Footer />
      
      </div>
  );
}

// -----------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group relative p-8 rounded-2xl bg-white border border-[rgba(196,97,10,0.12)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-[0_2px_16px_rgba(150,80,0,0.06)] hover:shadow-[0_8px_32px_rgba(150,80,0,0.12)]">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/4 via-transparent to-primary-light/4 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6 p-4 rounded-xl bg-surface-warm border border-[rgba(196,97,10,0.12)] w-fit group-hover:scale-110 transition-all duration-300 group-hover:bg-primary/8 group-hover:shadow-md group-hover:shadow-primary/10">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">{desc}</p>
      </div>
    </div>
  );
}
function AgentCard({ icon, title, color, borderColor }: { icon: React.ReactNode, title: string, color: string, borderColor: string }) {
    return (
        <div className={`group relative p-6 rounded-2xl flex flex-col items-center text-center gap-4 bg-white border ${borderColor} hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 shadow-[0_2px_12px_rgba(150,80,0,0.06)] hover:shadow-[0_6px_24px_rgba(150,80,0,0.10)]`}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/3 via-transparent to-primary-light/3 pointer-events-none rounded-2xl" />
            <div className={`relative z-10 p-3 rounded-full bg-surface-warm border ${borderColor} ${color} group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
            <span className="relative z-10 font-medium text-text-primary group-hover:text-primary transition-colors duration-300">{title}</span>
        </div>
    )
}

function Metric({ number, label }: { number: string, label: string }) {
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="metric-number mb-1 group-hover:scale-110 transition-transform duration-300">{number}</div>
            <div className="text-[10px] md:text-xs font-medium text-text-muted uppercase tracking-[0.2em] group-hover:text-text-secondary transition-colors duration-300">{label}</div>
        </div>
    )
}
