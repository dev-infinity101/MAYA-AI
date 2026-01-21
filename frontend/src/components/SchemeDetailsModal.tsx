import React, { useEffect } from 'react';
import { X, ExternalLink, FileText, UserCheck, CheckCircle, Info, Sparkles, LayoutGrid, Calendar } from 'lucide-react';
import { Scheme } from '../types'; // Ensure this path is correct based on your folder structure

interface SchemeDetailsModalProps {
  scheme: Scheme;
  onClose: () => void;
}

export function SchemeDetailsModal({ scheme, onClose }: SchemeDetailsModalProps) {
  
  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  console.log("DEBUG: Incoming Scheme Data:", scheme);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* 1. Header (Sticky) */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur rounded-t-2xl z-10">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
                {scheme.category}
              </span>
              {scheme.relevance_score && (
                <span className="text-[10px] font-medium text-text-secondary border border-white/10 px-2 py-0.5 rounded">
                  {scheme.relevance_score}% Match
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{scheme.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* AI Explanation Section */}
          {scheme.explanation && (
            <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-4 rounded-r-xl">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Sparkles size={14} /> AI Analysis
              </div>
              <p className="text-sm text-white/90 italic leading-relaxed">
                "{scheme.explanation}"
              </p>
            </div>
          )}

          {/* Description */}
          <section>
            <h3 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <Info size={16} className="text-primary" /> About the Scheme
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {scheme.description}
            </p>
          </section>
{/* Main Content Grid: 50:50 Symmetry */}
<div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-stretch">
  
  {/* LEFT SIDE (50%): Eligibility Details */}
  <div className="md:col-span-5 flex flex-col">
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-7 border border-white/10 h-full flex flex-col shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <UserCheck size={20} className="text-primary" />
        </div>
        <h3 className="text-white font-semibold text-base">Eligibility Details</h3>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {scheme.eligibility_criteria && typeof scheme.eligibility_criteria === 'object' ? (
          Object.entries(scheme.eligibility_criteria).map(([key, value]) => (
            <div key={key} className="relative pl-4 border-l-2 border-white/5 hover:border-primary/40 transition-colors py-1">
              <span className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-1.5">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="block text-white text-[15px] font-medium leading-relaxed">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <p className="text-sm italic">Detailed criteria not specified.</p>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* RIGHT SIDE (50%): Documents & Benefits Stack */}
  <div className="md:col-span-5 flex flex-col gap-6">
    
    {/* Required Documents Section (Vertical List) */}
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-7 border border-white/10 flex-1 flex flex-col min-h-[220px] shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText size={20} className="text-primary" />
        </div>
        <h3 className="text-white font-semibold text-base">Required Documents</h3>
      </div>
      
      {/* Vertical Layout: space-y-3 instead of grid */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {Array.isArray(scheme.required_documents) && scheme.required_documents.length > 0 ? (
          scheme.required_documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all group">
              <CheckCircle size={16} className="text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-sm text-white/90 font-medium">{doc}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-secondary italic">Contact nodal agency for documentation.</p>
        )}
      </div>
    </div>

    {/* Strategic Benefits Section (Kept Same) */}
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-7 border border-white/10 flex-1 flex flex-col min-h-[220px] shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <LayoutGrid size={20} className="text-primary" />
        </div>
        <h3 className="text-white font-semibold text-base">Strategic Benefits</h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {scheme.benefits?.map((benefit, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-l-4 border-primary/40 shadow-sm hover:translate-x-1 transition-transform">
            <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />
            <span className="text-sm text-white/95 leading-relaxed font-medium">
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>
  </div>

        {/* 3. Footer (Fixed Actions) */}
        <div className="p-5 border-t border-white/10 bg-[#0f0f0f] rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Calendar size={14} />
            <span>Application Mode: <strong className="text-white">{scheme.application_mode || 'Online/Offline'}</strong></span>
          </div>
          
          <div className="flex w-full sm:w-auto gap-3">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            
            {scheme.link ? (
              <a 
                href={scheme.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Apply Now <ExternalLink size={16} />
              </a>
            ) : (
              <button disabled className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-white/5 text-white/30 text-sm font-bold cursor-not-allowed">
                Link Unavailable
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}