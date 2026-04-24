import { useState, useEffect } from 'react';
import { Users, MessageSquare, FileText, Search, Activity, ArrowUpRight, CheckCircle, Ghost } from 'lucide-react';

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

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'short' }).charAt(0);
}

const AGENT_COLORS: Record<string, string> = {
  scheme:          'bg-primary',
  market:          'bg-secondary',
  finance:         'bg-amber-500',
  brand:           'bg-purple-500',
  marketing:       'bg-pink-500',
  general:         'bg-text-muted',
  report_pipeline: 'bg-blue-500',
};

const AGENT_LABELS: Record<string, string> = {
  scheme:          'Scheme Finder',
  market:          'Market Research',
  finance:         'Finance',
  brand:           'Branding',
  marketing:       'Marketing',
  general:         'General',
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

  const activity     = data?.daily_activity ?? [];
  const activityMax  = Math.max(...activity.map(a => a.count), 1);
  const activityLast = activity.slice(-7);

  const topSchemes    = data?.top_schemes ?? [];

  const conversionRate = overview && overview.total_conversations > 0
    ? Math.min(Math.round((overview.reports_generated / overview.total_conversations) * 100), 100)
    : 0;

  if (loading) {
      return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
      );
  }

  return (
    <div className="w-full text-text-primary animate-in fade-in duration-500 pb-20">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Dashboard</h1>
            <p className="text-text-secondary mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Hero metric card — stays saffron */}
              <div className="bg-primary rounded-[32px] p-6 shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-white/90 font-medium text-sm">Value Unlocked</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight size={18} className="text-white" />
                  </div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-white mb-2">{formatINR(overview?.estimated_value_unlocked ?? 0)}</h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-medium">
                    <Activity size={12} /> Real-time estimate
                  </div>
                </div>
              </div>

              {[
                { label: 'Total Users', value: overview?.total_users ?? 0, icon: Users },
                { label: 'Conversations', value: overview?.total_conversations ?? 0, icon: MessageSquare },
                { label: 'Reports Generated', value: overview?.reports_generated ?? 0, icon: FileText }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-[rgba(196,97,10,0.08)] rounded-[32px] p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-text-secondary font-medium text-sm">{stat.label}</span>
                    <div className="w-8 h-8 rounded-full border border-[rgba(196,97,10,0.10)] flex items-center justify-center">
                      <ArrowUpRight size={16} className="text-text-muted" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-text-primary mb-2">{stat.value.toLocaleString('en-IN')}</h2>
                    <p className="text-[12px] text-text-muted flex items-center gap-1">
                       <CheckCircle size={12} className="text-primary" /> Active tracking
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics bar chart */}
            <div className="col-span-12 lg:col-span-7 bg-white border border-[rgba(196,97,10,0.08)] rounded-[32px] p-8 flex flex-col shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
              <h2 className="text-[15px] font-medium text-text-primary mb-8">Platform Analytics</h2>
              <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto">
                {activityLast.map(({ date, count }, idx) => {
                  const heightPercentage = Math.max((count / activityMax) * 100, 15);
                  const isToday = idx === activityLast.length - 1;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="relative w-full max-w-[48px] flex items-end h-full bg-[rgba(196,97,10,0.05)] rounded-full overflow-hidden">
                        <div
                          className={`w-full rounded-full transition-all duration-700 ${isToday ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                          style={{ height: `${heightPercentage}%` }}
                        />
                      </div>
                      <span className={`text-[12px] font-medium ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                        {formatDateShort(date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent collaboration */}
            <div className="col-span-12 lg:col-span-5 bg-white border border-[rgba(196,97,10,0.08)] rounded-[32px] p-8 shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[15px] font-medium text-text-primary">Agent Collaboration</h2>
                <button className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[11px] font-medium hover:bg-primary/5 transition-colors">
                  + Add Agent
                </button>
              </div>
              <div className="space-y-5">
                {agentEntries.slice(0, 4).map(([agent, count]) => (
                  <div key={agent} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${AGENT_COLORS[agent] || 'bg-surface-warm'}`}>
                      <Ghost size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-medium text-text-primary truncate">{AGENT_LABELS[agent] ?? agent}</h3>
                      <p className="text-[11px] text-text-secondary truncate">Handling user queries</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-surface-warm border border-[rgba(196,97,10,0.10)] text-text-secondary">
                      {count} calls
                    </div>
                  </div>
                ))}
                {agentEntries.length === 0 && (
                  <div className="text-center py-6 text-text-muted text-sm">No agent data yet</div>
                )}
              </div>
            </div>

            {/* Conversion gauge */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-[rgba(196,97,10,0.08)] rounded-[32px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
               <h2 className="text-[15px] font-medium text-text-primary self-start w-full text-left mb-6">Conversion Progress</h2>

               <div className="relative w-48 h-24 overflow-hidden mt-4">
                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-[rgba(196,97,10,0.08)]"></div>
                  <div
                    className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-primary transition-transform duration-1000 origin-center"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                      transform: `rotate(${-180 + (conversionRate * 1.8)}deg)`
                    }}
                  ></div>
               </div>
               <div className="mt-2 -translate-y-6">
                 <span className="text-5xl font-bold text-text-primary block">{conversionRate}%</span>
                 <span className="text-[11px] text-text-secondary mt-1">Chats to Reports</span>
               </div>

               <div className="w-full flex justify-between items-center mt-auto pt-6 px-4">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-[11px] text-text-secondary">Completed</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[rgba(196,97,10,0.12)]"></div><span className="text-[11px] text-text-secondary">Pending</span></div>
               </div>
            </div>

            {/* Time tracker — warm version */}
            <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-surface-warm to-white border border-[rgba(196,97,10,0.12)] rounded-[32px] p-8 flex flex-col relative overflow-hidden shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent"></div>
               <h2 className="text-[15px] font-medium text-text-primary mb-auto relative z-10">Time Tracker</h2>

               <div className="relative z-10 flex flex-col items-center justify-center my-8">
                 <div className="text-5xl font-bold text-text-primary tracking-widest font-mono">01:24:08</div>
               </div>

               <div className="flex items-center justify-center gap-4 mt-auto relative z-10">
                 <button className="w-12 h-12 rounded-full bg-text-primary text-white flex items-center justify-center hover:scale-105 transition-transform">
                   <div className="w-4 h-4 bg-white rounded-sm"></div>
                 </button>
                 <button className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 transition-transform">
                   <div className="w-4 h-4 rounded-full bg-white"></div>
                 </button>
               </div>
            </div>

            {/* Top Schemes */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-[rgba(196,97,10,0.08)] rounded-[32px] p-8 shadow-[0_2px_12px_rgba(150,80,0,0.05)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[15px] font-medium text-text-primary">Top Schemes</h2>
                <button className="px-3 py-1.5 rounded-full border border-[rgba(196,97,10,0.15)] text-text-secondary text-[11px] font-medium hover:bg-surface-warm transition-colors">
                  + New
                </button>
              </div>
              <div className="space-y-4">
                {topSchemes.slice(0, 4).map((scheme, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-warm border border-[rgba(196,97,10,0.10)] flex items-center justify-center flex-shrink-0 text-primary">
                      <Search size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-medium text-text-primary truncate">{scheme.name}</h3>
                      <p className="text-[11px] text-text-secondary truncate">Searched {scheme.interactions} times</p>
                    </div>
                  </div>
                ))}
                {topSchemes.length === 0 && (
                  <div className="text-center py-6 text-text-muted text-sm">No schemes tracked yet</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
