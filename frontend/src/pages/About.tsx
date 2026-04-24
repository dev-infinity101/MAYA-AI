import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Heart, Globe, Lightbulb } from 'lucide-react';
import aboutImage from '../Assets/about-m.png';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans relative">
      {/* Warm ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-primary-light/[0.03] rounded-full blur-[180px]" />
      </div>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                    <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest bg-primary/8 border border-primary/15 px-4 py-1.5 rounded-full">
                        भारत के MSMEs के लिए
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight text-text-primary">
                        Empowering <br/><span className="text-primary">Indian MSMEs</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-xl leading-relaxed">
                        We believe that every business owner deserves access to the best advice and government support, regardless of their size or location.
                    </p>
                </div>
                <div className="flex-1 relative max-w-xl group">
                    <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full" />
                    <div className="relative z-10 rounded-2xl border border-[rgba(196,97,10,0.15)] shadow-[0_8px_48px_rgba(150,80,0,0.10)] overflow-hidden bg-white p-2">
                        <img src={aboutImage} alt="About MAYA" className="w-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      <SectionDivider />

      {/* 2. STORY SECTION */}
      <section className="py-24 relative bg-surface-warm">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-12 text-text-primary">The Story of MAYA</h2>
            <div className="space-y-6 text-lg text-text-secondary leading-relaxed text-left md:text-justify">
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

      <SectionDivider />

      {/* 3. VALUES */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 text-text-primary">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <ValueCard
                    icon={<Heart className="w-8 h-8 text-red-500" />}
                    title="Empathy First"
                    desc="We build for the user, simplifying complexity at every step."
                    iconBg="bg-red-50"
                    borderColor="border-red-200"
                />
                <ValueCard
                    icon={<Globe className="w-8 h-8 text-secondary" />}
                    title="Accessibility"
                    desc="High-quality business advice shouldn't be a luxury."
                    iconBg="bg-secondary/8"
                    borderColor="border-secondary/20"
                />
                <ValueCard
                    icon={<Lightbulb className="w-8 h-8 text-amber-600" />}
                    title="Innovation"
                    desc="Leveraging the latest in AI to solve real-world problems."
                    iconBg="bg-amber-50"
                    borderColor="border-amber-200"
                />
            </div>
        </div>
      </section>

      <SectionDivider />

      {/* 4. CTA SECTION */}
      <section className="py-24 relative overflow-hidden bg-surface-warm">
        <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-text-primary">
                Join thousands of <br/> growing businesses
            </h2>
            <p className="text-xl text-text-secondary mb-3 max-w-2xl mx-auto">
                Start your journey with MAYA today and unlock the full potential of your business.
            </p>
            <p className="text-primary font-semibold mb-10 text-lg">आज ही शुरू करें — पूरी तरह मुफ्त</p>
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

function SectionDivider() {
    return (
        <div className="relative h-16 w-full overflow-visible flex items-center justify-center">
            <div className="absolute w-full max-w-[1200px] h-[1.5px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute w-full max-w-[600px] h-[28px] bg-primary/[0.05] blur-[36px] rounded-full" />
        </div>
    );
}

function ValueCard({ icon, title, desc, iconBg, borderColor }: { icon: React.ReactNode, title: string, desc: string, iconBg: string, borderColor: string }) {
    return (
        <div className={`group relative p-8 rounded-2xl border ${borderColor} bg-white shadow-[0_2px_16px_rgba(150,80,0,0.06)] flex flex-col items-center gap-4 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(150,80,0,0.10)]`}>
            <div className={`p-5 rounded-full ${iconBg} border ${borderColor} mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
            <p className="text-text-secondary leading-relaxed">{desc}</p>
        </div>
    );
}
