import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, ChevronRight, Copy, CheckCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

interface RichDraft {
    scheme_key: string;
    scheme_name: string;
    subsidy_info: string;
    sections: string[];
    draft_content: string;
    auto_filled_fields: Record<string, string>;
    fields_to_update: string[];
    document_checklist: string[];
    apply_url: string;
}

interface Props {
    schemeName: string;
    conversationId?: string | null;
    onClose: () => void;
}

type Step = 'input' | 'generating' | 'preview' | 'error';

export function DraftGeneratorModal({ schemeName, conversationId, onClose }: Props) {
    const { getToken } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [userInput, setUserInput] = useState('');
    const [richDraft, setRichDraft] = useState<RichDraft | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());
    const [copied, setCopied] = useState(false);
    const [autoFillCount, setAutoFillCount] = useState(0);

    // Load profile to preview how many fields will be auto-filled
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const profile = await res.json();
                    let count = 0;
                    const fields = ['full_name', 'category', 'city', 'state', 'business_type', 'business_name', 'sector'];
                    fields.forEach(f => { if (profile[f]) count++; });
                    setAutoFillCount(count);
                }
            } catch {
                // non-fatal
            }
        };
        loadProfile();
    }, []);

    const handleGenerate = async () => {
        if (!userInput.trim()) {
            alert('Please describe your business / what you want to apply for.');
            return;
        }
        setStep('generating');
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/draft/generate-rich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    scheme_name: schemeName,
                    user_input: userInput,
                    conversation_id: conversationId,
                }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'Generation failed');
            }
            const data: RichDraft = await res.json();
            setRichDraft(data);
            setStep('preview');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to generate draft. Please try again.';
            setErrorMsg(msg);
            setStep('error');
        }
    };

    const handleCopy = async () => {
        if (!richDraft) return;
        await navigator.clipboard.writeText(richDraft.draft_content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!richDraft) return;
        const blob = new Blob([richDraft.draft_content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MAYA_${richDraft.scheme_name.replace(/\s+/g, '_')}_Draft.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className="fixed inset-0 bg-[#1C1007]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white border border-[rgba(196,97,10,0.12)] rounded-2xl w-full max-w-2xl max-h-[94vh] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(150,80,0,0.15)]">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between p-5 border-b border-[rgba(196,97,10,0.08)] flex-shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
                            <FileText size={15} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-text-primary font-semibold text-sm">
                                {richDraft ? richDraft.scheme_name : `Generate ${schemeName} Draft`}
                            </h2>
                            {richDraft ? (
                                <p className="text-[11px] text-primary font-medium mt-0.5">{richDraft.subsidy_info}</p>
                            ) : (
                                <p className="text-text-muted text-xs mt-0.5">AI-powered application document</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-warm rounded-lg transition-colors">
                        <X size={17} />
                    </button>
                </div>

                {/* ── Body ───────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto bg-[#FEF8EE]">

                    {/* INPUT STEP */}
                    {step === 'input' && (
                        <div className="p-5 space-y-5">
                            {/* Auto-fill info banner */}
                            {autoFillCount > 0 && (
                                <div className="flex items-start gap-2.5 bg-primary/6 border border-primary/15 rounded-xl p-3.5">
                                    <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        <span className="font-semibold text-primary">{autoFillCount} fields</span> from your profile will be auto-filled
                                        (name, location, business type, category, sector). Just describe your business below.
                                    </p>
                                </div>
                            )}

                            {/* What will be generated */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                    What MAYA will generate
                                </p>
                                <div className="bg-white border border-[rgba(196,97,10,0.10)] rounded-xl p-3.5 space-y-1.5">
                                    {_getSections(schemeName).map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* User input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-text-secondary">
                                    Describe your business / application
                                </label>
                                <textarea
                                    className="w-full bg-white border border-[rgba(196,97,10,0.15)] rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors placeholder-text-muted resize-none h-28"
                                    placeholder={`E.g. "I want to start a pickle manufacturing unit in Lucknow with ₹5 lakh budget. I have experience in food processing for 3 years."`}
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                />
                                <p className="text-[11px] text-text-muted">
                                    The more detail you provide, the more accurate the financial tables will be.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* GENERATING STEP */}
                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-5">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-2 border-primary/15 border-t-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText size={18} className="text-primary/60" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-text-primary text-sm font-semibold">Generating your draft…</p>
                                <p className="text-text-secondary text-xs">MAYA is building your scheme-specific application document</p>
                                <p className="text-text-muted text-[11px] mt-2">Auto-filling financial tables · Calculating subsidy · Adding sections</p>
                            </div>
                        </div>
                    )}

                    {/* ERROR STEP */}
                    {step === 'error' && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle size={18} className="text-red-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-text-primary text-sm font-medium">Draft generation failed</p>
                                <p className="text-text-secondary text-xs">{errorMsg}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep('input')}
                                    className="px-4 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-light transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-surface-warm text-text-primary text-sm rounded-xl hover:bg-[#FDE8C0] border border-[rgba(196,97,10,0.15)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PREVIEW STEP */}
                    {step === 'preview' && richDraft && (
                        <div className="p-5 space-y-5">

                            {/* Auto-fill summary */}
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                    <CheckCheck size={12} />
                                    {Object.keys(richDraft.auto_filled_fields).length} fields auto-filled
                                </span>
                                {richDraft.fields_to_update.length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                        <AlertCircle size={12} />
                                        {richDraft.fields_to_update.length} fields to verify
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/6 border border-primary/15 px-2.5 py-1 rounded-full">
                                    <Sparkles size={12} />
                                    {richDraft.scheme_name}
                                </span>
                            </div>

                            {/* Rich markdown document */}
                            <div className="bg-white border border-[rgba(196,97,10,0.10)] rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-[rgba(196,97,10,0.07)] flex items-center justify-between">
                                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                        Application Document
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-primary transition-colors"
                                    >
                                        {copied ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="p-4 max-h-[420px] overflow-y-auto custom-scrollbar draft-markdown">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => <h1 className="text-base font-bold text-text-primary mb-3 mt-4 first:mt-0">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-sm font-bold text-text-primary mb-2 mt-4 border-b border-[rgba(196,97,10,0.08)] pb-1">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xs font-semibold text-text-secondary mb-1.5 mt-3 uppercase tracking-wide">{children}</h3>,
                                            p: ({ children }) => <p className="text-xs text-text-secondary leading-relaxed mb-2">{children}</p>,
                                            table: ({ children }) => (
                                                <div className="overflow-x-auto mb-3">
                                                    <table className="w-full text-xs border-collapse">{children}</table>
                                                </div>
                                            ),
                                            th: ({ children }) => <th className="bg-[#FEF8EE] border border-[rgba(196,97,10,0.12)] px-2.5 py-1.5 text-left font-semibold text-text-secondary">{children}</th>,
                                            td: ({ children }) => <td className="border border-[rgba(196,97,10,0.08)] px-2.5 py-1.5 text-text-secondary">{children}</td>,
                                            li: ({ children }) => <li className="text-xs text-text-secondary mb-0.5">{children}</li>,
                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                                            strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                                            em: ({ children }) => <em className="italic text-text-muted">{children}</em>,
                                            hr: () => <hr className="border-[rgba(196,97,10,0.10)] my-3" />,
                                            blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/30 pl-3 italic text-text-muted">{children}</blockquote>,
                                        }}
                                    >
                                        {richDraft.draft_content}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Document checklist */}
                            {richDraft.document_checklist.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                        Documents to Attach
                                    </h3>
                                    <div className="space-y-1.5">
                                        {richDraft.document_checklist.map((doc, i) => (
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
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ─────────────────────────────────────────── */}
                <div className="p-5 border-t border-[rgba(196,97,10,0.08)] flex-shrink-0 bg-white">
                    {step === 'input' && (
                        <button
                            onClick={handleGenerate}
                            disabled={!userInput.trim()}
                            className="w-full py-3 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
                        >
                            <Sparkles size={15} />
                            Generate My {schemeName} Draft
                            <ChevronRight size={16} />
                        </button>
                    )}
                    {step === 'preview' && richDraft && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-colors shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
                            >
                                <Download size={15} /> Download Draft
                            </button>
                            <a
                                href={richDraft.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary/30 text-primary font-semibold rounded-xl hover:bg-primary/8 transition-colors"
                            >
                                <ExternalLink size={15} /> Apply Online
                            </a>
                        </div>
                    )}
                    {step === 'preview' && (
                        <button
                            onClick={() => { setStep('input'); setRichDraft(null); setCheckedDocs(new Set()); }}
                            className="w-full mt-2 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
                        >
                            ← Regenerate with different input
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Helper: sections to preview ───────────────────────────────────────────────

function _getSections(schemeName: string): string[] {
    const name = schemeName.toLowerCase();
    if (name.includes('pmegp')) return [
        'Project At A Glance (auto-filled table)',
        'Promoter Profile paragraph',
        'Project Description & Market Potential',
        'Cost Breakdown & Finance Table',
        'Revenue Projections (3 years)',
        'Employment Generation table',
        'Implementation Schedule',
        'Declaration with your details',
    ];
    if (name.includes('mudra')) return [
        'Mudra Category Determination (Shishu/Kishore/Tarun)',
        'Applicant Information table',
        'Business Details',
        'Loan Requirement & Purpose Breakdown',
        'Repayment Plan with EMI calculation',
        'Document Checklist',
    ];
    if (name.includes('stand')) return [
        'Eligibility Status check',
        'Applicant Profile',
        'Enterprise Details',
        'Project Cost & Loan Computation',
        'Revenue Projection (3 years)',
        'Repayment Schedule',
        'Document Checklist',
    ];
    if (name.includes('odop')) return [
        'District-Product Mapping (ODOP product for your district)',
        'Applicant Information',
        'Enterprise Plan aligned with ODOP',
        'Financial Assistance breakdown',
        'Marketing Support available',
        'Document Checklist',
    ];
    if (name.includes('vishwakarma')) return [
        'Trade Eligibility (mapping to 18 official trades)',
        'Applicant Information',
        'Full Benefits Package (Phase 1 & 2)',
        'Toolkit Requirement list with costs',
        'Training Plan',
        'Registration steps',
    ];
    return ['Applicant Details', 'Business Plan', 'Financial Projections', 'Document Checklist'];
}
