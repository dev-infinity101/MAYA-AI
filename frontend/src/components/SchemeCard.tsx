import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Info, ArrowRight, Tag } from 'lucide-react';
import { Scheme } from '../types'; // Ensure types are imported from your central file
import { SchemeDetailsModal } from './SchemeDetailsModal'; // Import the Modal we created

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="glass-panel rounded-xl p-5 border border-white/10 hover:border-primary/30 transition-all group flex flex-col h-full bg-[#111] hover:bg-[#151515]">
        
        {/* Header Section: Category, Name & Match Score */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wide">
              {scheme.category}
            </span>
            <h3 className="text-base font-bold text-white mt-2 leading-tight group-hover:text-primary transition-colors">
              {scheme.name}
            </h3>
          </div>
          {scheme.relevance_score && (
            <div className="flex flex-col items-end shrink-0 ml-1">
              <div className="text-xl font-bold text-primary">{scheme.relevance_score}%</div>
              <div className="text-[8px] text-text-secondary uppercase tracking-wider">Match</div>
            </div>
          )}
        </div>

        {/* Description (Truncated) */}
        <p className="text-text-secondary text-xs mb-4 line-clamp-2 leading-relaxed">
          {scheme.description}
        </p>

        {/* Dynamic Benefits List (Compact) */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-[10px] text-primary font-bold uppercase tracking-wide">
              <CheckCircle size={10} /> Key Benefits
            </div>
            <ul className="space-y-1.5">
              {scheme.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="text-xs text-white/90 flex gap-2 items-start">
                  <span className="text-primary mt-1">•</span> 
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
              {scheme.benefits.length > 2 && (
                <li className="text-[10px] text-text-secondary pl-3">
                  +{scheme.benefits.length - 2} more benefits...
                </li>
              )}
            </ul>
          </div>
        )}

      

        {/* Footer: 3-Button Action Grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/10">
          
          {/* Button 1: View Full Details (Triggers Modal) - Full Width */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="col-span-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs py-2.5 rounded-lg border border-white/10 transition-colors group/btn"
          >
            <Info size={14} className="group-hover/btn:text-primary transition-colors" /> 
            View Full Details
          </button>
          
          {/* Button 2: Check Eligibility (Mock Action) */}
          <button className="flex items-center justify-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold py-2 rounded-lg border border-primary/20 transition-all">
            Check Eligibility
          </button>

          {/* Button 3: Official Link */}
          {scheme.link ? (
            <a 
                href={scheme.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-primary text-black text-[10px] font-bold py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
                Direct Link <ExternalLink size={10} />
            </a>
          ) : (
             <button disabled className="bg-white/5 text-white/30 text-[10px] font-bold py-2 rounded-lg cursor-not-allowed">
               No Link
             </button>
          )}
        </div>
      </div>

      {/* Modal Component (Renders outside the card structure visually) */}
      {isModalOpen && (
        <SchemeDetailsModal 
          scheme={scheme} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}