import React from 'react';
import { ExternalLink, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface Scheme {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string;
  eligibility: any;
  application_link?: string;
  relevance_score?: number;
  explanation?: string;
  key_benefit?: string;
}

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-white/10 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
            {scheme.category}
          </span>
          <h3 className="text-lg font-bold text-white mt-2 leading-tight group-hover:text-primary transition-colors">
            {scheme.name}
          </h3>
        </div>
        {scheme.relevance_score && (
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-primary">{scheme.relevance_score}%</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">Match</div>
          </div>
        )}
      </div>

      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
        {scheme.description}
      </p>

      {scheme.key_benefit && (
        <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
          <div className="flex items-center gap-2 mb-1 text-xs text-primary font-medium uppercase tracking-wide">
            <CheckCircle size={12} /> Key Benefit
          </div>
          <p className="text-sm text-white/90">{scheme.key_benefit}</p>
        </div>
      )}

      {scheme.explanation && (
        <div className="text-xs text-text-secondary italic mb-4 border-l-2 border-white/10 pl-3">
          "{scheme.explanation}"
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <button className="text-sm text-text-secondary hover:text-white transition-colors flex items-center gap-1">
          <AlertCircle size={14} />
          Details
        </button>
        
        {scheme.application_link ? (
            <a 
                href={scheme.application_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
                Apply Now <ExternalLink size={14} />
            </a>
        ) : (
            <Button size="sm" className="gap-2">
                Check Eligibility <ArrowRight size={14} />
            </Button>
        )}
      </div>
    </div>
  );
}
