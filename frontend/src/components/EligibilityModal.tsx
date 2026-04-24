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
                if (isMounted) { setData(json); setLoading(false); }
            } catch (err: any) {
                if (isMounted) { setError(err.message || "Failed to calculate eligibility."); setLoading(false); }
            }
        };
        checkEligibility();
        return () => { isMounted = false; };
    }, [schemeName, getToken]);

    const eligible = data?.is_eligible;

    return (
        <div className="fixed inset-0 bg-[#1C1007]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[rgba(196,97,10,0.12)] rounded-[28px] w-full max-w-2xl shadow-[0_20px_60px_rgba(150,80,0,0.15)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-5 border-b border-[rgba(196,97,10,0.08)] bg-white">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-warm text-text-secondary text-[12px] font-medium mb-3 border border-[rgba(196,97,10,0.10)]">
                            <Target size={13} className="text-secondary" /> Eligibility Check
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-tight">{schemeName}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-surface-warm flex items-center justify-center text-text-secondary hover:bg-[#FDE8C0] hover:text-text-primary transition-colors shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-[#FEF8EE] max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-6">
                            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-base font-bold text-text-primary mb-1.5">Calculating Eligibility</p>
                                <p className="text-[13px] text-text-secondary">Evaluating your business profile against government criteria…</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                            <AlertTriangle size={38} className="text-amber-500 mb-2" />
                            <p className="text-lg font-bold text-text-primary mb-1">{error}</p>
                            <p className="text-[13px] text-text-secondary">Please make sure your profile is updated in Settings.</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Hero Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Match Score */}
                                <div className={`bg-white border ${eligible ? 'border-secondary/20' : 'border-amber-400/30'} rounded-[22px] p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(150,80,0,0.04)]`}>
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="text-text-secondary font-medium text-[13px]">Match Score</span>
                                        <div className="w-8 h-8 rounded-full border border-[rgba(196,97,10,0.10)] flex shrink-0 items-center justify-center bg-surface-warm">
                                            {eligible
                                                ? <CheckCircle size={14} className="text-secondary" />
                                                : <XCircle size={14} className="text-amber-500" />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-end gap-1 mb-1.5">
                                            <p className={`text-4xl font-bold tracking-tight leading-none ${eligible ? 'text-secondary' : 'text-amber-600'}`}>
                                                {data.match_score}
                                            </p>
                                            <span className="text-xl text-text-muted font-bold mb-1">%</span>
                                        </div>
                                        <p className="text-[12px] text-text-secondary font-medium mt-1">
                                            {eligible ? "Highly eligible profile" : "Missing key requirements"}
                                        </p>
                                    </div>
                                </div>

                                {/* Max Benefit */}
                                <div className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[22px] p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(150,80,0,0.04)] hover:border-primary/20 transition-colors">
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="text-text-secondary font-medium text-[13px]">Estimated Benefit</span>
                                        <div className="w-8 h-8 rounded-full border border-[rgba(196,97,10,0.10)] flex shrink-0 items-center justify-center bg-surface-warm">
                                            <IndianRupee size={13} className="text-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-bold text-text-primary mb-1.5 break-words tracking-tight">
                                            {data.max_benefit}
                                        </p>
                                        <p className="text-[12px] text-text-secondary font-medium">Calculated maximum cap</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reasons + Missing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.reasons.length > 0 && (
                                    <div className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[20px] p-5">
                                        <h4 className="text-[12px] font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <CheckCircle size={14} className="text-secondary" /> Why you match
                                        </h4>
                                        <ul className="space-y-3">
                                            {data.reasons.map((reason, i) => (
                                                <li key={i} className="text-[13px] text-text-secondary flex items-start gap-2.5">
                                                    <span className="text-secondary mt-1 shrink-0">•</span>
                                                    <span className="leading-relaxed">{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {data.missing_criteria.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5">
                                        <h4 className="text-[12px] font-semibold text-amber-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <AlertTriangle size={14} /> Criteria to meet
                                        </h4>
                                        <ul className="space-y-3">
                                            {data.missing_criteria.map((miss, i) => (
                                                <li key={i} className="text-[13px] text-amber-700/80 flex items-start gap-2.5">
                                                    <span className="text-amber-500 mt-1 shrink-0">•</span>
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
                <div className="p-5 border-t border-[rgba(196,97,10,0.08)] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-[12px] text-text-secondary flex items-start md:items-center gap-2 flex-1 leading-relaxed">
                        <Info size={14} className="shrink-0 mt-0.5 md:mt-0 text-text-muted" />
                        AI assessments are guide-only. Final eligibility is decided by the bank or nodal agency.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-primary text-white font-semibold text-[13px] rounded-full hover:bg-primary-light transition-all shadow-[0_4px_16px_rgba(196,97,10,0.25)] shrink-0 w-full md:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
