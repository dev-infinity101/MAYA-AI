import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, IndianRupee, AlertTriangle, Target, Info } from 'lucide-react';
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
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Target size={20} className="text-emerald-400" /> 
                            Eligibility Check
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[300px]">{schemeName}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <Loader2 size={32} className="text-emerald-500 animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-white">Calculating Eligibility...</p>
                                <p className="text-xs text-gray-500 mt-1">AI is evaluating your business profile against government rules</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                            <AlertTriangle size={32} className="text-amber-500 mb-2" />
                            <p className="text-sm font-medium text-white">{error}</p>
                            <p className="text-xs text-gray-500">Please make sure your profile is updated in Settings.</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Hero Status */}
                            <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                                data.is_eligible 
                                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                                    : 'bg-amber-500/10 border-amber-500/30'
                            }`}>
                                <div className={`pt-1 ${data.is_eligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.is_eligible ? <CheckCircle size={28} /> : <XCircle size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1">
                                        {data.is_eligible 
                                            ? "You appear highly eligible!" 
                                            : "You might face some eligibility issues."}
                                    </h3>
                                    <p className="text-xs text-gray-300">
                                        Based on your current profile, your match score is <strong className={data.match_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{data.match_score}%</strong>.
                                    </p>
                                </div>
                            </div>

                            {/* Max Benefit Highlight */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                                <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Maximum Calculated Benefit</p>
                                    <p className="text-sm font-semibold text-white">{data.max_benefit}</p>
                                </div>
                            </div>

                            {/* Why? Reasons */}
                            {data.reasons.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-500" /> 
                                        Why you match
                                    </h4>
                                    <ul className="space-y-2">
                                        {data.reasons.map((reason, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-emerald-500/50 mt-0.5">•</span>
                                                <span className="leading-snug">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing Criteria */}
                            {data.missing_criteria.length > 0 && (
                                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <h4 className="text-xs font-semibold text-red-400 uppercase mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} /> 
                                        Criteria to meet / Missing elements
                                    </h4>
                                    <ul className="space-y-2">
                                        {data.missing_criteria.map((miss, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-red-500/50 mt-0.5">•</span>
                                                <span className="leading-snug">{miss}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-1">
                        <Info size={12} />
                        AI assessments are guide-only. Final eligibility is decided by the bank/nodal agency.
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
