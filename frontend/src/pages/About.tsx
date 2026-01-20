import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Heart, Globe, Lightbulb } from 'lucide-react';
import aboutVideo from '../Assets/MAYA ABOUT MOTION.mp4';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      {/* Enhanced Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '3s' }} />
      </div>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                        Empowering <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">Indian MSMEs</span>
                    </h1>
                    <p className="text-xl text-emerald-100/70 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-relaxed">
                        We believe that every business owner deserves access to the best advice and government support, regardless of their size or location.
                    </p>
                </div>
                <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-200 max-w-xl group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="relative z-10 rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden backdrop-blur-sm bg-black/20 p-2 group-hover:border-emerald-500/50 transition-all duration-500 group-hover:shadow-emerald-500/20 rotate-2 group-hover:rotate-0">
                        <video 
                            src={aboutVideo}
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="rounded-xl w-full h-auto group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
      </div>

      {/* 2. STORY SECTION */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">The Story of MAYA</h2>
            <div className="space-y-6 text-lg text-emerald-100/70 leading-relaxed">
                <p className="group hover:text-emerald-100/90 transition-colors duration-300 text-left md:text-justify">
                    It started with a simple observation: India has thousands of schemes for small businesses, but most owners don't know they exist. The information is scattered, complex, and often buried in bureaucratic jargon.
                </p>
                <p className="group hover:text-emerald-100/90 transition-colors duration-300 text-left md:text-justify">
                    We built MAYA to bridge this gap. By combining advanced AI with deep knowledge of the Indian MSME landscape, we've created a tool that acts as a 24/7 consultant for business owners.
                </p>
                <p className="group hover:text-emerald-100/90 transition-colors duration-300 text-left md:text-justify">
                    Whether it's finding the right subsidy, understanding loan eligibility, or just getting a quick marketing idea, MAYA is designed to be the partner every entrepreneur wishes they had.
                </p>
            </div>
        </div>
      </section>

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-cyan-500/10 blur-[50px] rounded-full" />
      </div>

      {/* 3. VALUES */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <ValueCard 
                    icon={<Heart className="w-8 h-8 text-red-400" />}
                    title="Empathy First"
                    desc="We build for the user, simplifying complexity at every step."
                    iconBg="bg-red-500/5"
                    borderColor="border-red-500/30"
                />
                <ValueCard 
                    icon={<Globe className="w-8 h-8 text-cyan-400" />}
                    title="Accessibility"
                    desc="High-quality business advice shouldn't be a luxury."
                    iconBg="bg-cyan-500/5"
                    borderColor="border-cyan-500/30"
                />
                <ValueCard 
                    icon={<Lightbulb className="w-8 h-8 text-yellow-400" />}
                    title="Innovation"
                    desc="Leveraging the latest in AI to solve real-world problems."
                    iconBg="bg-yellow-500/5"
                    borderColor="border-yellow-500/30"
                />
            </div>
        </div>
      </section>

      {/* Glowing Section Divider */}
      <div className="relative h-24 w-full overflow-visible flex items-center justify-center">
        <div className="absolute w-full max-w-[1400px] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="absolute w-full max-w-[1000px] h-[40px] bg-emerald-500/10 blur-[50px] rounded-full" />
      </div>

      {/* 4. CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />
        <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                Join thousands of <br/> growing businesses
            </h2>
            <p className="text-xl text-emerald-100/60 mb-10 max-w-2xl mx-auto">
                Start your journey with MAYA today and unlock the full potential of your business.
            </p>
            <a href="/chat">
                <button className="btn-modern-glow sm:w-auto">
                    <span className="relative z-10">Get Started Free</span>
                    <div />
                </button>
            </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, desc, iconBg, borderColor }: { icon: React.ReactNode, title: string, desc: string, iconBg: string, borderColor: string }) {
    return (
        <div className={`group relative p-8 rounded-2xl border ${borderColor} backdrop-blur-md bg-black/40 flex flex-col items-center gap-4 hover:border-emerald-500/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10`}>
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            
            <div className="relative z-10">
                <div className={`p-5 rounded-full ${iconBg} border ${borderColor} mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30`}>
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-200 transition-colors duration-300">{title}</h3>
                <p className="text-emerald-100/60 leading-relaxed group-hover:text-emerald-100/80 transition-colors duration-300">{desc}</p>
            </div>
        </div>
    )
}