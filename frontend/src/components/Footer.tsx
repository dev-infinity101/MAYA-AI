import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const links = {
    Platform: ['Agents', 'Schemes', 'Dashboard', 'Compliance'],
    Company: ['About', 'Careers', 'Privacy', 'Terms']
  };

  return (
    <footer className="pt-24 pb-8 relative overflow-hidden bg-background border-t border-[rgba(196,97,10,0.08)]">
      {/* Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-display italic text-[clamp(140px,22vw,320px)] font-bold text-[rgba(196,97,10,0.03)] whitespace-nowrap pointer-events-none tracking-tighter select-none leading-none">
        MAYA AI
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          
          <div className="col-span-2 pr-8">
            <h4 className="font-display italic text-lg font-bold text-primary mb-4">MAYA</h4>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              The autonomous system designed to unlock non-obvious government capital through intelligent multi-agent collaboration.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-[rgba(196,97,10,0.15)] flex items-center justify-center text-text-secondary hover:bg-primary hover:border-primary hover:text-white transition-all">
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h5 className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-text-muted mb-6 font-semibold">{title}</h5>
              <div className="flex flex-col gap-3">
                {items.map(item => (
                  <a key={item} href="#" className="group relative overflow-hidden inline-block w-fit text-[0.62rem] tracking-[0.18em] uppercase text-text-secondary transition-colors duration-200">
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">{item}</span>
                    <span className="absolute top-full left-0 text-primary transition-transform duration-300 group-hover:-translate-y-full">{item}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}

        </div>

        <div className="pt-8 border-t border-[rgba(196,97,10,0.12)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-text-secondary">&copy; 2026 MAYA AI SYSTEMS.</div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-text-secondary hidden sm:inline">STATUS:</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-primary font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/80 via-primary-light to-primary/80"></div>
    </footer>
  );
}
