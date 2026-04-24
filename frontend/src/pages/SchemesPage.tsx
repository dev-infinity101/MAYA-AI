import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { FileText, Calendar, ExternalLink, Search } from 'lucide-react';
import { getSchemeResults, SchemeResultItem, Scheme } from '../services/api';

interface SchemeWithMeta extends Scheme {
    _from: string;
    _date: string;
    _convId: string;
}

export default function SchemesPage() {
    const { getToken } = useAuth();
    const [results, setResults] = useState<SchemeResultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            const token = await getToken().catch(() => null);
            const data = await getSchemeResults(token);
            setResults(data.scheme_results || []);
            setLoading(false);
        };
        load();
    }, []);

    // Deduplicate schemes by name, keep most recent occurrence
    const allSchemes: SchemeWithMeta[] = Array.from(
        new Map(
            results
                .flatMap(sr =>
                    sr.schemes.map(s => [
                        s.name,
                        { ...s, _from: sr.title, _date: sr.created_at, _convId: sr.conversation_id } as SchemeWithMeta,
                    ])
                )
        ).values()
    );

    const filtered = search.trim()
        ? allSchemes.filter(
            s =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.category || '').toLowerCase().includes(search.toLowerCase())
          )
        : allSchemes;

    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="w-full text-text-primary font-sans animate-in fade-in duration-500 pb-20">
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 space-y-8">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Schemes</h1>
                        <p className="text-text-secondary mt-1 text-sm">Government schemes MAYA surfaced across all your chats.</p>
                    </div>
                    {allSchemes.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search schemes…"
                                className="w-full pl-9 pr-4 py-2 bg-white border border-[rgba(196,97,10,0.12)] rounded-full text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/40 transition-colors"
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : allSchemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-surface-warm border border-[rgba(196,97,10,0.10)] flex items-center justify-center mb-5">
                            <FileText size={26} className="text-primary/50" />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary mb-2">No schemes found yet</h3>
                        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                            Ask MAYA about government loans or schemes — all results will appear here.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-text-secondary text-sm py-8 text-center">No schemes match "{search}".</p>
                ) : (
                    <>
                        <p className="text-[12px] text-text-muted">{filtered.length} scheme{filtered.length !== 1 ? 's' : ''} found</p>
                        <div className="space-y-3">
                            {filtered.map((s, i) => (
                                <div
                                    key={`${s.name}-${i}`}
                                    className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[20px] p-5 hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(150,80,0,0.06)] transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded border border-primary/15 uppercase tracking-wider">
                                                    {s.category || 'Scheme'}
                                                </span>
                                                {s.relevance_score != null && (
                                                    <span className="text-[10px] text-text-secondary border border-[rgba(196,97,10,0.10)] px-2 py-0.5 rounded">
                                                        {s.relevance_score}% match
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-text-primary text-[15px] leading-snug">{s.name}</h3>
                                            {s.description && (
                                                <p className="text-text-secondary text-[13px] mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-3 text-[12px] text-text-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={11} /> {fmt(s._date)}
                                                </span>
                                                <span>From: {s._from}</span>
                                            </div>
                                        </div>
                                        {s.link && (
                                            <a
                                                href={s.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                title="Apply / Learn more"
                                                className="p-2 rounded-xl border border-[rgba(196,97,10,0.12)] text-text-muted hover:text-primary hover:border-primary/30 hover:bg-surface-warm transition-all flex-shrink-0"
                                            >
                                                <ExternalLink size={15} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
