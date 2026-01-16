import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Check, X as XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { HeartHandshake } from 'lucide-react';
import FancyOutlineLiftButton from '@/components/FancyOutlineLiftButton';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans relative">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/5 to-transparent rounded-full blur-[120px]" />
      </div>

      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/20 blur-[120px] rounded-full opacity-30 pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-gradient-to-b from-white via-white to-emerald-200 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-xl md:text-1xl text-emerald-100/70 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Start for free, upgrade as you grow. No hidden fees.
          </p>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="pb-20 relative z-10">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <PricingCard 
                    title="Free"
                    price="₹0"
                    desc="Perfect for exploring schemes and basic advice."
                    features={[
                        '50 Chat messages/month',
                        'Basic Scheme Search',
                        'Access to General Agent',
                        'Community Support'
                    ]}
                    cta="Get Started"
                    variant="default"
                />
                <PricingCard 
                    title="Pro"
                    price="₹999"
                    period="/month"
                    desc="For growing businesses needing deep insights."
                    features={[
                        'Unlimited Chat messages',
                        'Advanced Scheme Eligibility',
                        'Access to All 4 Specialist Agents',
                        'Export Reports',
                        'Priority Support'
                    ]}
                    cta="Start Free Trial"
                    variant="featured"
                    popular
                />
                <PricingCard 
                    title="Enterprise"
                    price="Custom"
                    desc="For organizations and large advisory firms."
                    features={[
                        'Custom AI Model Training',
                        'API Access',
                        'Dedicated Account Manager',
                        'SLA & Uptime Guarantee',
                        'On-premise Deployment Option'
                    ]}
                    cta="Contact Sales"
                    variant="default"
                />
            </div>
        </div>
      </section>

      {/* 3. COMPARISON TABLE */}
      <section className="py-20 bg-gradient-to-b from-emerald-950/20 to-transparent relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              Compare Plans
            </h2>
            
            <div className="overflow-x-auto backdrop-blur-sm bg-black/30 rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-emerald-500/20">
                            <th className="py-6 px-6 text-emerald-100/60 font-medium w-1/3 text-lg">Feature</th>
                            <th className="py-6 px-6 text-white font-bold text-center w-1/5">Free</th>
                            <th className="py-6 px-6 text-emerald-400 font-bold text-center w-1/5">Pro</th>
                            <th className="py-6 px-6 text-white font-bold text-center w-1/5">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                        <ComparisonRow feature="Scheme Discovery" free="Basic" pro="Advanced" ent="Custom" />
                        <ComparisonRow feature="Agent Access" free="General Only" pro="All 4 Agents" ent="All + Custom" />
                        <ComparisonRow feature="Chat History" free="7 Days" pro="Unlimited" ent="Unlimited" />
                        <ComparisonRow feature="Report Export" free={false} pro={true} ent={true} />
                        <ComparisonRow feature="API Access" free={false} pro={false} ent={true} />
                        <ComparisonRow feature="Support" free="Community" pro="Email (24h)" ent="Dedicated Agent" />
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                <FAQItem 
                    q="Is the scheme information accurate?" 
                    a="Yes, our database is updated weekly from official government sources. However, we always recommend verifying with the official scheme portal before applying." 
                />
                <FAQItem 
                    q="Can I cancel my Pro subscription?" 
                    a="Absolutely. You can cancel anytime from your account settings. You'll retain access until the end of your billing cycle." 
                />
                <FAQItem 
                    q="How does the eligibility check work?" 
                    a="We use AI to analyze your business profile (turnover, sector, location) against the specific requirements of each scheme to provide a probability match." 
                />
                <FAQItem 
                    q="Do you offer refunds?" 
                    a="We offer a 7-day money-back guarantee for our Pro plan if you're not satisfied with the results." 
                />
            </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="py-20 text-center border-t border-emerald-500/20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Still have questions?</h2>
            <Link to="/chat">
                <FancyOutlineLiftButton>
                     Talk to Support
                </FancyOutlineLiftButton>
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PricingCard({ title, price, period, desc, features, cta, variant, popular }: any) {
    const isFeatured = variant === 'featured';
    
    return (
        <div className={clsx(
            "group relative p-8 rounded-2xl flex flex-col transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm overflow-hidden",
            isFeatured 
              ? "bg-gradient-to-b from-emerald-950/40 to-black/40 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20" 
              : "bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40"
        )}>
            {/* Hover Glow Effect */}
            <div className={clsx(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              isFeatured ? "bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/10" : "bg-emerald-500/5"
            )} />
            
            {/* Animated Border Gradient */}
            {isFeatured && (
              <div className="absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/30 to-emerald-500/0 animate-pulse" />
              </div>
            )}
            
            
            <div className="mb-8 relative z-10">
                <h3 className="text-xl font-medium text-emerald-100/70 mb-2">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className={clsx(
                      "text-5xl font-bold bg-gradient-to-br bg-clip-text text-transparent",
                      isFeatured ? "from-emerald-300 to-emerald-500" : "from-white to-emerald-100"
                    )}>{price}</span>
                    {period && <span className="text-emerald-100/50">{period}</span>}
                </div>
                <p className="text-sm text-emerald-100/60 mt-4">{desc}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 relative z-10">
                {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/90 group/item">
                        <Check className={clsx(
                          "w-5 h-5 shrink-0 transition-all duration-300 group-hover/item:scale-110",
                          isFeatured ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-emerald-500/70"
                        )} />
                        <span className="group-hover/item:text-white transition-colors duration-300">{feat}</span>
                    </li>
                ))}
            </ul>
            
            <Button variant={isFeatured ? 'primary' : 'outline'} className="w-full justify-center relative z-10">
                {cta}
            </Button>
        </div>
    )
}

function ComparisonRow({ feature, free, pro, ent }: any) {
    const renderCell = (val: any) => {
        if (typeof val === 'boolean') {
            return val 
              ? <Check className="w-5 h-5 text-emerald-400 mx-auto drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" /> 
              : <XIcon className="w-5 h-5 text-white/20 mx-auto" />;
        }
        return val;
    };

    return (
        <tr className="group hover:bg-emerald-500/5 transition-all duration-300">
            <td className="py-5 px-6 text-white font-medium group-hover:text-emerald-100 transition-colors duration-300">{feature}</td>
            <td className="py-5 px-6 text-emerald-100/60 text-center">{renderCell(free)}</td>
            <td className="py-5 px-6 text-emerald-300 text-center font-bold">{renderCell(pro)}</td>
            <td className="py-5 px-6 text-white text-center">{renderCell(ent)}</td>
        </tr>
    )
}

function FAQItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="group border border-emerald-500/20 rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-emerald-500/5 transition-all duration-300"
            >
                <HeartHandshake className="w-5 h-5 text-emerald-500/60 group-hover:text-emerald-400 transition-colors duration-300" />
                <span className="font-bold text-white group-hover:text-emerald-100 transition-colors duration-300">{q}</span>
                <div className={clsx(
                  "transition-all duration-300",
                  isOpen ? "rotate-180 text-emerald-400" : "text-emerald-500/60 group-hover:text-emerald-400"
                )}>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>
            <div className={clsx(
                "px-6 text-emerald-100/70 transition-all duration-500 ease-in-out overflow-hidden",
                isOpen ? "max-h-48 pb-6 opacity-100" : "max-h-0 pb-0 opacity-0"
            )}>
                {a}
            </div>
        </div>
    )
}