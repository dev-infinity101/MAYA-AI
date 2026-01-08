import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Check, X as XIcon, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden font-sans">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Start for free, upgrade as you grow. No hidden fees.
          </p>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="pb-20">
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
      <section className="py-20 bg-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Compare Plans</h2>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-4 px-6 text-text-secondary font-medium w-1/3">Feature</th>
                            <th className="py-4 px-6 text-white font-bold text-center w-1/5">Free</th>
                            <th className="py-4 px-6 text-primary font-bold text-center w-1/5">Pro</th>
                            <th className="py-4 px-6 text-white font-bold text-center w-1/5">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
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
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
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
      <section className="py-20 text-center border-t border-white/10">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-white mb-6">Still have questions?</h2>
            <Link to="/chat">
                 <Button variant="outline" size="lg" className="gap-2">
                    <HelpCircle size={20} /> Talk to Support
                </Button>
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
            "glass-panel p-8 rounded-2xl flex flex-col relative transition-transform duration-300 hover:-translate-y-2",
            isFeatured ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-white/10"
        )}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                </div>
            )}
            
            <div className="mb-8">
                <h3 className="text-xl font-medium text-text-secondary mb-2">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    {period && <span className="text-text-secondary">{period}</span>}
                </div>
                <p className="text-sm text-text-secondary mt-4">{desc}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                        <Check className={clsx("w-5 h-5 shrink-0", isFeatured ? "text-primary" : "text-white/50")} />
                        {feat}
                    </li>
                ))}
            </ul>
            
            <Button variant={isFeatured ? 'primary' : 'outline'} className="w-full justify-center">
                {cta}
            </Button>
        </div>
    )
}

function ComparisonRow({ feature, free, pro, ent }: any) {
    const renderCell = (val: any) => {
        if (typeof val === 'boolean') {
            return val ? <Check className="w-5 h-5 text-primary mx-auto" /> : <XIcon className="w-5 h-5 text-white/20 mx-auto" />;
        }
        return val;
    };

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="py-4 px-6 text-white font-medium">{feature}</td>
            <td className="py-4 px-6 text-text-secondary text-center">{renderCell(free)}</td>
            <td className="py-4 px-6 text-white text-center font-bold">{renderCell(pro)}</td>
            <td className="py-4 px-6 text-white text-center">{renderCell(ent)}</td>
        </tr>
    )
}

function FAQItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-bold text-white">{q}</span>
                {isOpen ? <ChevronUp className="text-text-secondary" /> : <ChevronDown className="text-text-secondary" />}
            </button>
            <div className={clsx(
                "px-6 text-text-secondary transition-all duration-300 ease-in-out overflow-hidden",
                isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 pb-0 opacity-0"
            )}>
                {a}
            </div>
        </div>
    )
}
