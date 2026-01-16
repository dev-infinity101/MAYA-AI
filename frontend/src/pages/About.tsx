import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Heart, Globe, Lightbulb } from 'lucide-react';
import aboutVideo from '../Assets/MAYA ABOUT MOTION.mp4';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,178,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_40%)] pointer-events-none" />
      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-16 relative">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Empowering <span className="text-[#00FFB2]">Indian MSMEs</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        We believe that every business owner deserves access to the best advice and government support, regardless of their size or location.
                    </p>
                </div>
                <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-200 max-w-xl">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                    <video 
                        src={aboutVideo}
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="relative z-10 rounded-2xl border border-white/10 shadow-2xl rotate-3 w-full h-auto"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* 2. STORY SECTION */}
      <section className="py-40 bg-white/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-8">The Story of MAYA</h2>
            <div className="space-y-6 text-lg text-text-secondary leading-relaxed text-justify">
                <p>
                    It started with a simple observation: India has thousands of schemes for small businesses, but most owners don't know they exist. The information is scattered, complex, and often buried in bureaucratic jargon.
                </p>
                <p>
                    We built MAYA to bridge this gap. By combining advanced AI with deep knowledge of the Indian MSME landscape, we've created a tool that acts as a 24/7 consultant for business owners.
                </p>
                <p>
                    Whether it's finding the right subsidy, understanding loan eligibility, or just getting a quick marketing idea, MAYA is designed to be the partner every entrepreneur wishes they had.
                </p>
            </div>
        </div>
      </section>

      {/* 3. VALUES */}
      <section className="py-40">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <ValueCard 
                    icon={<Heart className="w-8 h-8 text-red-400" />}
                    title="Empathy First"
                    desc="We build for the user, simplifying complexity at every step."
                />
                <ValueCard 
                    icon={<Globe className="w-8 h-8 text-blue-400" />}
                    title="Accessibility"
                    desc="High-quality business advice shouldn't be a luxury."
                />
                <ValueCard 
                    icon={<Lightbulb className="w-8 h-8 text-yellow-400" />}
                    title="Innovation"
                    desc="Leveraging the latest in AI to solve real-world problems."
                />
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 flex flex-col items-center gap-4 hover:bg-white/5 transition-colors">
            <div className="p-4 rounded-full bg-white/5 mb-2">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-text-secondary">{desc}</p>
        </div>
    )
}
