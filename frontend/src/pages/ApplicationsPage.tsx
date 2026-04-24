import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ClipboardList, Calendar, ExternalLink, CheckCircle, FileText } from 'lucide-react';
import { getApplications, ApplicationItem } from '../services/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    draft_generated: {
        label: 'Draft Ready',
        color: 'text-primary',
        bg: 'bg-primary/8',
        border: 'border-primary/20',
    },
    submitted: {
        label: 'Submitted',
        color: 'text-secondary',
        bg: 'bg-secondary/8',
        border: 'border-secondary/20',
    },
    approved: {
        label: 'Approved',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
    },
};

export default function ApplicationsPage() {
    const { getToken } = useAuth();
    const [apps, setApps] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const token = await getToken().catch(() => null);
            const data = await getApplications(token);
            setApps(data.applications || []);
            setLoading(false);
        };
        load();
    }, []);

    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="w-full text-text-primary font-sans animate-in fade-in duration-500 pb-20">
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 space-y-8">

                <div>
                    <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">My Applications</h1>
                    <p className="text-text-secondary mt-1 text-sm">Schemes for which MAYA generated a draft application letter.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : apps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-surface-warm border border-[rgba(196,97,10,0.10)] flex items-center justify-center mb-5">
                            <ClipboardList size={26} className="text-primary/50" />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary mb-2">No applications yet</h3>
                        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
                            When MAYA generates a draft letter for a scheme, it will appear here for tracking.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apps.map(app => {
                            const status = STATUS_CONFIG[app.application_status] || STATUS_CONFIG.draft_generated;
                            return (
                                <div
                                    key={app.id}
                                    className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[22px] p-5 hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(150,80,0,0.06)] transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FileText size={17} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                    {app.scheme_category && (
                                                        <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded border border-primary/15 uppercase tracking-wider">
                                                            {app.scheme_category}
                                                        </span>
                                                    )}
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${status.color} ${status.bg} ${status.border} flex items-center gap-1`}>
                                                        <CheckCircle size={10} /> {status.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-text-primary text-[15px] leading-snug">{app.scheme_name}</h3>
                                                {app.scheme_description && (
                                                    <p className="text-text-secondary text-[13px] mt-1 line-clamp-2 leading-relaxed">{app.scheme_description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2.5 text-[12px] text-text-muted">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={11} /> {fmt(app.updated_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {app.scheme_link && (
                                            <a
                                                href={app.scheme_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Apply Online"
                                                className="p-2 rounded-xl border border-[rgba(196,97,10,0.12)] text-text-muted hover:text-primary hover:border-primary/30 hover:bg-surface-warm transition-all flex-shrink-0"
                                            >
                                                <ExternalLink size={15} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
