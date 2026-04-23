import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Target, Info, IndianRupee } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

interface EligibilityData {
    is_eligible: boolean;
    max_benefit: string;
    match_score: number;
    reasons: string[];
    missing_criteria: string[];
}

interface Props {
    schemeName: string;
    onClose: () => void;
}

export function EligibilityModal({ schemeName, onClose }: Props) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<EligibilityData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const checkEligibility = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error("No auth token");

                const res = await fetch(`${API_BASE}/api/draft/eligibility/${encodeURIComponent(schemeName)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Scheme not found for evaluation");
                    throw new Error("Evaluation failed");
                }

                const json = await res.json();
                if (isMounted) {
                    setData(json);
                    setLoading(false);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || "Failed to calculate eligibility.");
                    setLoading(false);
                }
            }
        };

        checkEligibility();
        return () => { isMounted = false; };
    }, [schemeName, getToken]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-5 border-b border-white/5 bg-[#1A1A1A]">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] text-white text-[12px] font-medium mb-3 border border-white/10">
                            <Target size={14} className="text-[#067a44]" /> Eligibility Check
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">{schemeName}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A0A0A0] hover:bg-white/10 hover:text-white transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-[#161616] max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-6">
                            <div className="w-12 h-12 border-[3px] border-[#067a44]/30 border-t-[#067a44] rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-white mb-2">Calculating Eligibility</p>
                                <p className="text-[14px] text-[#A0A0A0]">Evaluating your business profile against government criteria...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                            <AlertTriangle size={40} className="text-amber-500 mb-4" />
                            <p className="text-xl font-bold text-white mb-1">{error}</p>
                            <p className="text-[14px] text-[#A0A0A0]">Please make sure your profile is updated in Settings.</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            {/* Hero Status Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Match Score */}
                                <div className={`bg-white/[0.02] border ${data.is_eligible ? 'border-[#067a44]/20' : 'border-amber-500/20'} rounded-[24px] p-5 flex flex-col justify-between group`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[#A0A0A0] font-medium text-[13px]">Match Score</span>
                                        <div className={`w-8 h-8 rounded-full border border-white/10 flex shrink-0 items-center justify-center bg-white/[0.02]`}>
                                            {data.is_eligible ? <CheckCircle size={14} className="text-[#067a44]" /> : <XCircle size={14} className="text-amber-500" />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-end gap-1 mb-2">
                                            <p className={`text-4xl font-bold ${data.is_eligible ? 'text-[#067a44]' : 'text-amber-500'} tracking-tight leading-none`}>
                                                {data.match_score}
                                            </p>
                                            <span className="text-xl text-[#A0A0A0] font-bold mb-1">%</span>
                                        </div>
                                        <p className="text-[12px] text-[#A0A0A0] font-medium mt-2">
                                            {data.is_eligible ? "Highly eligible profile" : "Missing key requirements"}
                                        </p>
                                    </div>
                                </div>

                                {/* Max Benefit Highlight */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between group hover:bg-white/[0.04] transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[#A0A0A0] font-medium text-[13px]">Estimated Benefit</span>
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex shrink-0 items-center justify-center bg-white/[0.02]">
                                            <IndianRupee size={14} className="text-white/60" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-bold text-white mb-2 break-words tracking-tight">
                                            {data.max_benefit}
                                        </p>
                                        <p className="text-[12px] text-[#A0A0A0] font-medium mt-3">Calculated maximum cap</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Reasons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {data.reasons.length > 0 && (
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-5">
                                        <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <CheckCircle size={16} className="text-[#067a44]" /> 
                                            Why you match
                                        </h4>
                                        <ul className="space-y-4">
                                            {data.reasons.map((reason, i) => (
                                                <li key={i} className="text-[14px] text-[#A0A0A0] flex items-start gap-3">
                                                    <span className="text-[#067a44] mt-1 shrink-0">•</span>
                                                    <span className="leading-relaxed">{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {data.missing_criteria.length > 0 && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-[24px] p-5">
                                        <h4 className="text-[13px] font-semibold text-amber-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <AlertTriangle size={16} /> 
                                            Criteria to meet
                                        </h4>
                                        <ul className="space-y-4">
                                            {data.missing_criteria.map((miss, i) => (
                                                <li key={i} className="text-[14px] text-amber-500/80 flex items-start gap-3">
                                                    <span className="text-amber-500/50 mt-1 shrink-0">•</span>
                                                    <span className="leading-relaxed">{miss}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-[#1A1A1A] flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <p className="text-[12px] text-[#A0A0A0] flex items-start md:items-center gap-2 flex-1 leading-relaxed">
                        <Info size={16} className="shrink-0 mt-0.5 md:mt-0" />
                        AI assessments are guide-only. Final eligibility is decided by the bank or nodal agency.
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-[#067a44] text-white font-semibold text-[14px] rounded-full hover:bg-[#056337] transition-all shadow-lg shadow-[#067a44]/20 shrink-0 w-full md:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
