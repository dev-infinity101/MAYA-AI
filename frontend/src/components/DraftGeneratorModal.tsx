import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { PremiumSelect } from './PremiumSelect';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

interface Question {
    id: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    options?: string[];
}

interface Draft {
    draft_letter: string;
    document_checklist: string[];
    apply_url: string;
    scheme_full_name: string;
}

interface Props {
    schemeName: string;
    conversationId?: string | null;
    onClose: () => void;
}

type Step = 'loading' | 'questions' | 'generating' | 'preview' | 'error';

export function DraftGeneratorModal({ schemeName, conversationId, onClose }: Props) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<Step>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [schemeMeta, setSchemeMeta] = useState<{ full_name: string; apply_url: string } | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [prefilledFields, setPrefilledFields] = useState<Record<string, string>>({});
    const [draft, setDraft] = useState<Draft | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                const [questionsRes, profileRes] = await Promise.all([
                    fetch(`${API_BASE}/api/draft/questions/${encodeURIComponent(schemeName)}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (!questionsRes.ok) throw new Error(await questionsRes.text());
                const data = await questionsRes.json();
                setQuestions(data.questions);
                setSchemeMeta({ full_name: data.full_name, apply_url: data.apply_url });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    const prefilled: Record<string, string> = {};
                    if (profileData.category)      prefilled['category']       = profileData.category;
                    if (profileData.business_name) prefilled['business_name']  = profileData.business_name;
                    if (profileData.city)          prefilled['district']       = profileData.city;
                    if (profileData.city)          prefilled['city']           = profileData.city;
                    if (profileData.full_name)     prefilled['applicant_name'] = profileData.full_name;
                    setAnswers(prefilled);
                    setPrefilledFields(prefilled);
                }

                setStep('questions');
            } catch {
                setErrorMsg('No draft template available for this scheme yet.');
                setStep('error');
            }
        };
        load();
    }, [schemeName]);

    const handleGenerate = async () => {
        const unanswered = questions.filter(q => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
            alert(`Please fill in: ${unanswered.map(q => q.label).join(', ')}`);
            return;
        }
        setStep('generating');
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/draft/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ scheme_name: schemeName, answers, conversation_id: conversationId }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setDraft(data);
            setStep('preview');
        } catch {
            setErrorMsg('Failed to generate draft. Please try again.');
            setStep('error');
        }
    };

    const handleDownload = () => {
        if (!draft) return;
        const blob = new Blob([draft.draft_letter], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MAYA_${schemeName.replace(/\s+/g, '_')}_Draft.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const setAnswer = (id: string, val: string) => setAnswers(prev => ({ ...prev, [id]: val }));

    const inputBase = "w-full bg-[#FEF8EE] border border-[rgba(196,97,10,0.15)] rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors placeholder-text-muted";
    const prefilledExtra = "border-primary/25 bg-primary/5";

    return (
        <div
            className="fixed inset-0 bg-[#1C1007]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white border border-[rgba(196,97,10,0.12)] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(150,80,0,0.12)]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[rgba(196,97,10,0.08)] flex-shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
                            <FileText size={15} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-text-primary font-semibold text-sm">Generate Application Draft</h2>
                            <p className="text-text-muted text-xs mt-0.5">{schemeMeta?.full_name || schemeName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-warm rounded-lg transition-colors">
                        <X size={17} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-[#FEF8EE]">

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 size={26} className="text-primary animate-spin" />
                            <p className="text-text-secondary text-sm">Loading form…</p>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
                            <p className="text-text-secondary text-sm">{errorMsg}</p>
                            <button onClick={onClose} className="px-4 py-2 bg-surface-warm text-text-primary text-sm rounded-xl hover:bg-[#FDE8C0] border border-[rgba(196,97,10,0.15)] transition-colors">Close</button>
                        </div>
                    )}

                    {step === 'questions' && (
                        <div className="p-5 space-y-4">
                            <p className="text-text-secondary text-sm">
                                Fill in the details below. MAYA will generate a ready-to-submit application letter instantly.
                            </p>
                            {questions.map(q => (
                                <div key={q.id} className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary flex items-center justify-between">
                                        <span>{q.label}</span>
                                        {prefilledFields[q.id] && (
                                            <span className="text-[10px] text-primary bg-primary/8 px-1.5 py-0.5 rounded font-semibold tracking-wide">
                                                Auto-filled
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        {q.type === 'textarea' ? (
                                            <textarea
                                                className={`${inputBase} ${prefilledFields[q.id] ? prefilledExtra : ''} resize-none h-20`}
                                                placeholder="Type here…"
                                                value={answers[q.id] || ''}
                                                onChange={e => setAnswer(q.id, e.target.value)}
                                            />
                                        ) : q.type === 'select' ? (
                                            <PremiumSelect
                                                className={prefilledFields[q.id] ? prefilledExtra : ''}
                                                value={answers[q.id] || ''}
                                                onChange={(val: string) => setAnswer(q.id, val)}
                                                options={q.options || []}
                                            />
                                        ) : (
                                            <input
                                                type={q.type === 'number' ? 'number' : 'text'}
                                                className={`${inputBase} ${prefilledFields[q.id] ? prefilledExtra : ''}`}
                                                placeholder={q.type === 'number' ? '0' : 'Type here…'}
                                                value={answers[q.id] || ''}
                                                onChange={e => setAnswer(q.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <div className="text-center">
                                <p className="text-text-primary text-sm font-medium">Generating your draft…</p>
                                <p className="text-text-secondary text-xs mt-1">MAYA is preparing your application letter</p>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && draft && (
                        <div className="p-5 space-y-5">
                            <div>
                                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Application Letter</h3>
                                <pre className="bg-white border border-[rgba(196,97,10,0.10)] rounded-xl p-4 text-text-secondary text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                                    {draft.draft_letter}
                                </pre>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Documents to Attach</h3>
                                <div className="space-y-2">
                                    {draft.document_checklist.map((doc, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCheckedDocs(prev => {
                                                const next = new Set(prev);
                                                next.has(i) ? next.delete(i) : next.add(i);
                                                return next;
                                            })}
                                            className="w-full flex items-center gap-3 text-left py-1"
                                        >
                                            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checkedDocs.has(i) ? 'bg-primary border-primary' : 'border-[rgba(196,97,10,0.25)] bg-white'}`}>
                                                {checkedDocs.has(i) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className={`text-sm transition-colors ${checkedDocs.has(i) ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{doc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[rgba(196,97,10,0.08)] flex-shrink-0 bg-white">
                    {step === 'questions' && (
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
                        >
                            Generate My Draft <ChevronRight size={16} />
                        </button>
                    )}
                    {step === 'preview' && draft && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-colors shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
                            >
                                <Download size={15} /> Download Draft
                            </button>
                            <a
                                href={draft.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary/30 text-primary font-semibold rounded-xl hover:bg-primary/8 transition-colors"
                            >
                                <ExternalLink size={15} /> Apply Online
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
