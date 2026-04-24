import { useEffect } from 'react';
import { X, ExternalLink, FileText, UserCheck, CheckCircle, Info, Sparkles, LayoutGrid, Calendar } from 'lucide-react';
import { Scheme } from '../types';

interface SchemeDetailsModalProps {
  scheme: Scheme;
  onClose: () => void;
}

export function SchemeDetailsModal({ scheme, onClose }: SchemeDetailsModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C1007]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white border border-[rgba(196,97,10,0.12)] rounded-2xl shadow-[0_20px_60px_rgba(150,80,0,0.15)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[rgba(196,97,10,0.08)] bg-white rounded-t-2xl z-10">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
                {scheme.category}
              </span>
              {scheme.relevance_score && (
                <span className="text-[10px] font-medium text-text-secondary border border-[rgba(196,97,10,0.12)] px-2 py-0.5 rounded">
                  {scheme.relevance_score}% Match
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-text-primary leading-tight">{scheme.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-surface-warm rounded-full transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* AI Explanation */}
          {scheme.explanation && (
            <div className="bg-gradient-to-r from-primary/8 to-transparent border-l-4 border-primary p-4 rounded-r-xl">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Sparkles size={13} /> AI Analysis
              </div>
              <p className="text-sm text-text-primary italic leading-relaxed">"{scheme.explanation}"</p>
            </div>
          )}

          {/* Description */}
          <section>
            <h3 className="flex items-center gap-2 text-text-primary font-bold text-sm mb-3">
              <Info size={15} className="text-primary" /> About the Scheme
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">{scheme.description}</p>
          </section>

          {/* 50:50 grid */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-stretch">

            {/* Eligibility */}
            <div className="md:col-span-5 flex flex-col">
              <div className="bg-[#FEF8EE] border border-[rgba(196,97,10,0.10)] rounded-2xl p-6 h-full flex flex-col shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck size={18} className="text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold text-sm">Eligibility Details</h3>
                </div>
                <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {scheme.eligibility_criteria && typeof scheme.eligibility_criteria === 'object' ? (
                    Object.entries(scheme.eligibility_criteria).map(([key, value]) => (
                      <div key={key} className="relative pl-4 border-l-2 border-[rgba(196,97,10,0.12)] hover:border-primary/40 transition-colors py-0.5">
                        <span className="block text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] mb-1">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="block text-text-primary text-[14px] font-medium leading-relaxed">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary italic">Detailed criteria not specified.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents + Benefits */}
            <div className="md:col-span-5 flex flex-col gap-5">

              {/* Documents */}
              <div className="bg-[#FEF8EE] border border-[rgba(196,97,10,0.10)] rounded-2xl p-6 flex-1 flex flex-col min-h-[200px] shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold text-sm">Required Documents</h3>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {Array.isArray(scheme.required_documents) && scheme.required_documents.length > 0 ? (
                    scheme.required_documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[rgba(196,97,10,0.08)] hover:border-primary/20 transition-all group">
                        <CheckCircle size={14} className="text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                        <span className="text-sm text-text-primary font-medium">{doc}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary italic">Contact nodal agency for documentation.</p>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-[#FEF8EE] border border-[rgba(196,97,10,0.10)] rounded-2xl p-6 flex-1 flex flex-col min-h-[200px] shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutGrid size={18} className="text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold text-sm">Strategic Benefits</h3>
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {Array.isArray(scheme.benefits) && scheme.benefits.length > 0 ? (
                    scheme.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/6 to-transparent rounded-xl border-l-4 border-primary/30 hover:translate-x-1 transition-transform">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="text-sm text-text-primary leading-relaxed">{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary italic">No specific benefits listed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[rgba(196,97,10,0.08)] bg-[#FEF8EE] rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Calendar size={13} className="text-text-muted" />
            <span>Application Mode: <strong className="text-text-primary">{scheme.application_mode || 'Online/Offline'}</strong></span>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-[rgba(196,97,10,0.15)] text-text-secondary text-sm font-medium hover:bg-surface-warm hover:text-text-primary transition-colors"
            >
              Close
            </button>
            {scheme.link ? (
              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light hover:scale-105 transition-all shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
              >
                Apply Now <ExternalLink size={14} />
              </a>
            ) : (
              <button disabled className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-surface-warm text-text-muted text-sm font-bold cursor-not-allowed">
                Link Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
