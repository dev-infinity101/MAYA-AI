import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BarChart3, Calendar, MapPin, Coins, ChevronRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { getReports, ReportItem } from '../services/api';
import { BusinessReport } from '../components/BusinessReport';

interface ReportsPageProps {
    onOpenChat?: (conversationId: string) => void;
}

export default function ReportsPage({ onOpenChat }: ReportsPageProps) {
    const { getToken } = useAuth();
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ReportItem | null>(null);

    useEffect(() => {
        const load = async () => {
            const token = await getToken().catch(() => null);
            const data = await getReports(token);
            setReports(data.reports || []);
            setLoading(false);
        };
        load();
    }, []);

    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="w-full text-text-primary font-sans animate-in fade-in duration-500 pb-20">
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 space-y-8">

                {selected ? (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={() => setSelected(null)}
                                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <ArrowLeft size={15} /> Back to Reports
                            </button>
                            {onOpenChat && (
                                <button
                                    onClick={() => onOpenChat(selected.conversation_id)}
                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    <MessageSquare size={14} />
                                    Jump to chat
                                </button>
                            )}
                        </div>
                        <BusinessReport markdown={selected.report} businessContext={selected.business_context} />
                    </>
                ) : (
                    <>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Business Reports</h1>
                            <p className="text-text-secondary mt-1 text-sm">AI-generated business plans from your chats — 5 specialist agents each.</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-surface-warm border border-[rgba(196,97,10,0.10)] flex items-center justify-center mb-5">
                                    <BarChart3 size={26} className="text-primary/50" />
                                </div>
                                <h3 className="text-base font-semibold text-text-primary mb-2">No reports yet</h3>
                                <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                                    Ask MAYA to plan a new business and it will generate a full report here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map(r => {
                                    const bizType = r.business_context?.business_type;
                                    const title = bizType ? `${bizType} — Business Plan` : r.title;
                                    return (
                                        <div
                                            key={r.id}
                                            className="w-full bg-white border border-[rgba(196,97,10,0.08)] rounded-[22px] p-5 hover:border-primary/25 hover:shadow-[0_4px_20px_rgba(150,80,0,0.07)] transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    onClick={() => setSelected(r)}
                                                    className="flex items-start gap-4 flex-1 min-w-0 text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <BarChart3 size={17} className="text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-text-primary text-[14px] leading-snug truncate">{title}</h3>
                                                        <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-text-secondary">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar size={11} className="text-text-muted" />
                                                                {fmt(r.created_at)}
                                                            </span>
                                                            {r.business_context?.location && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <MapPin size={11} className="text-text-muted" />
                                                                    {r.business_context.location}
                                                                </span>
                                                            )}
                                                            {r.business_context?.budget && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <Coins size={11} className="text-text-muted" />
                                                                    {r.business_context.budget}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-[11px] font-medium text-primary/80 bg-primary/6 border border-primary/12 px-2 py-0.5 rounded-full">
                                                                5 agent analysis
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                                                    {onOpenChat && (
                                                        <button
                                                            onClick={() => onOpenChat(r.conversation_id)}
                                                            title="Jump to chat"
                                                            className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                                                        >
                                                            <MessageSquare size={13} />
                                                            <span className="hidden sm:inline">Chat</span>
                                                        </button>
                                                    )}
                                                    <ChevronRight size={17} className="text-text-muted group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
