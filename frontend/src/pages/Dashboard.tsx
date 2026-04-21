import { useState, useEffect } from 'react';
import { Users, MessageSquare, FileText, Search, BarChart2, Banknote, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

interface DashboardData {
  overview: {
    total_users: number;
    total_conversations: number;
    total_messages: number;
    scheme_searches: number;
    drafts_generated: number;
    reports_generated: number;
    estimated_value_unlocked: number;
  };
  agent_breakdown: Record<string, number>;
  daily_activity: { date: string; count: number }[];
  top_schemes: { name: string; interactions: number }[];
}

function formatINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

const AGENT_COLORS: Record<string, string> = {
  scheme:    'bg-primary',
  market:    'bg-blue-500',
  finance:   'bg-amber-500',
  brand:     'bg-purple-500',
  marketing: 'bg-pink-500',
  general:   'bg-white/30',
  report_pipeline: 'bg-teal-500',
};

const AGENT_LABELS: Record<string, string> = {
  scheme:    'Scheme Finder',
  market:    'Market Research',
  finance:   'Finance',
  brand:     'Branding',
  marketing: 'Marketing',
  general:   'General',
  report_pipeline: 'Report Pipeline',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/dashboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load analytics'); setLoading(false); });
  }, []);

  const overview = data?.overview;
  const agentEntries = Object.entries(data?.agent_breakdown ?? {}).sort((a, b) => b[1] - a[1]);
  const agentTotal  = agentEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const activity     = data?.daily_activity ?? [];
  const activityMax  = Math.max(...activity.map(a => a.count), 1);
  const activityLast = activity.slice(-14); // last 14 days

  const topSchemes    = data?.top_schemes ?? [];
  const schemesMax    = Math.max(...topSchemes.map(s => s.interactions), 1);

  const statCards = [
    { label: 'Total Users',        value: overview?.total_users ?? 0,         icon: Users,         color: 'text-primary' },
    { label: 'Conversations',      value: overview?.total_conversations ?? 0,  icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Messages',           value: overview?.total_messages ?? 0,       icon: MessageSquare, color: 'text-blue-300' },
    { label: 'Scheme Searches',    value: overview?.scheme_searches ?? 0,      icon: Search,        color: 'text-amber-400' },
    { label: 'Drafts Generated',   value: overview?.drafts_generated ?? 0,     icon: FileText,      color: 'text-purple-400' },
    { label: 'Reports Generated',  value: overview?.reports_generated ?? 0,    icon: BarChart2,     color: 'text-teal-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Top bar */}
      <div className="border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <Brand showText />
          <span className="text-white/20">|</span>
          <span className="text-[13px] text-white/50 font-medium">Impact Dashboard</span>
        </div>
        <Link
          to="/chat"
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary text-[13px] font-medium transition-all"
        >
          Open MAYA →
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Impact</h1>
          <p className="text-sm text-white/40 mt-1">Real-time metrics from MAYA's multi-agent system</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Value unlocked hero */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/80 font-medium mb-1">Estimated Value Unlocked</p>
                <p className="text-4xl font-bold text-white">{formatINR(overview?.estimated_value_unlocked ?? 0)}</p>
                <p className="text-xs text-white/40 mt-1">Based on ₹2L avg per application draft generated</p>
              </div>
              <Banknote size={48} className="text-primary/30" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</span>
                    <Icon size={16} className={color} />
                  </div>
                  <p className="text-2xl font-bold text-white">{value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            {/* Agent breakdown + Top schemes side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Agent usage breakdown */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Agent Usage Breakdown</h2>
                {agentEntries.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {agentEntries.map(([agent, count]) => (
                      <div key={agent}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-white/60">{AGENT_LABELS[agent] ?? agent}</span>
                          <span className="text-[12px] text-white/40">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${AGENT_COLORS[agent] ?? 'bg-white/30'}`}
                            style={{ width: `${(count / agentTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top schemes */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Top Government Schemes</h2>
                {topSchemes.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No scheme interactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {topSchemes.map(({ name, interactions }) => (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-white/60 truncate pr-2 flex-1">{name}</span>
                          <span className="text-[12px] text-white/40 flex-shrink-0">{interactions}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500/70 rounded-full transition-all duration-700"
                            style={{ width: `${(interactions / schemesMax) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Daily activity */}
            {activityLast.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-5">Daily Activity (last 14 days)</h2>
                <div className="flex items-end gap-1.5 h-24">
                  {activityLast.map(({ date, count }) => (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-primary/50 group-hover:bg-primary rounded-sm transition-all duration-200"
                          style={{ height: `${Math.max((count / activityMax) * 100, 4)}%` }}
                          title={`${formatDate(date)}: ${count} messages`}
                        />
                      </div>
                      <span className="text-[9px] text-white/20 rotate-45 origin-left translate-x-1">
                        {formatDate(date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer note */}
            <p className="text-center text-[11px] text-white/20 pb-4">
              MAYA — AI Business Assistant for Indian MSMEs · Data updates in real time
            </p>
          </>
        )}
      </div>
    </div>
  );
}
