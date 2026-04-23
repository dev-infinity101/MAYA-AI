import { useState, useEffect } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Save, CheckCircle, Activity, User, Target, ChevronRight } from 'lucide-react';
import { PremiumSelect } from '../components/PremiumSelect';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { ImpactNumbers } from '../components/ImpactNumbers';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

const FIELD_CONFIG = [
    {
        section: 'Personal Info',
        fields: [
            { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'As it appears on Aadhaar' },
            { id: 'category', label: 'Category', type: 'select', options: ['General', 'SC', 'ST', 'OBC', 'Women', 'Ex-Serviceman'] },
            { id: 'state', label: 'State', type: 'select', options: INDIAN_STATES },
            { id: 'city', label: 'City / District', type: 'text', placeholder: 'e.g. Lucknow' },
        ]
    },
    {
        section: 'Business Info',
        fields: [
            { id: 'business_name', label: 'Business Name', type: 'text', placeholder: 'e.g. Priya Foods' },
            { id: 'business_type', label: 'Business Type', type: 'select', options: ['Manufacturing', 'Services', 'Trading', 'Agriculture Allied', 'Not started yet'] },
            { id: 'sector', label: 'Sector', type: 'select', options: ['Food & Beverage', 'Textile & Garments', 'Technology', 'Retail', 'Construction', 'Beauty & Wellness', 'Education', 'Healthcare', 'Agriculture', 'Handicrafts', 'Transport', 'Other'] },
            { id: 'turnover_range', label: 'Annual Revenue', type: 'select', options: ['Not started', 'Under ₹10 Lakh', '₹10L - ₹50L', '₹50L - ₹5Cr', 'Above ₹5Cr'] },
        ]
    },
    {
        section: 'Additional Details',
        fields: [
            { id: 'udyam_registered', label: 'Udyam Registered?', type: 'select', options: ['Yes', 'No', "Don't know"] },
            { id: 'existing_loan', label: 'Existing Business Loan?', type: 'select', options: ['Yes', 'No'] },
            { id: 'primary_goal', label: 'Primary Goal', type: 'select', options: ['Funding / Loan', 'Equipment / Machinery', 'Training / Skills', 'Market Access', 'Brand Building', 'All of the above'] },
        ]
    }
];

export default function SettingsPage() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();

    const [profile, setProfile] = useState<Record<string, any>>({});
    const [healthScore, setHealthScore] = useState<any>(null);
    const [impactStats, setImpactStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'health'>('health');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                
                const [profileRes, healthRes, impactRes] = await Promise.all([
                    fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/api/user/health-score`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/api/user/impact-stats`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile({
                        ...data,
                        udyam_registered: data.udyam_registered === true ? 'Yes' : data.udyam_registered === false ? 'No' : '',
                        existing_loan: data.existing_loan === true ? 'Yes' : data.existing_loan === false ? 'No' : '',
                    });
                }
                if (healthRes.ok) setHealthScore(await healthRes.json());
                if (impactRes.ok) setImpactStats(await impactRes.json());
                
            } catch (e) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/user/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...profile,
                    udyam_registered: profile.udyam_registered === 'Yes',
                    existing_loan: profile.existing_loan === 'Yes',
                    onboarding_complete: true
                })
            });
            if (!res.ok) throw new Error('Save failed');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const setField = (id: string, value: string) =>
        setProfile(prev => ({ ...prev, [id]: value }));

    return (
        <div className="w-full text-white font-sans animate-in fade-in duration-500 pb-20">
            <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings & Profile</h1>
                    <p className="text-[#A0A0A0] mt-1">Manage your business profile and monitor health.</p>
                  </div>
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-lg
                          ${saved 
                              ? 'bg-[#067a44]/20 text-[#067a44] border border-[#067a44]/30' 
                              : 'bg-[#067a44] hover:bg-[#056337] text-white shadow-[#067a44]/20'
                          } disabled:opacity-50`}
                  >
                      {saved ? (
                          <><CheckCircle size={16} /> Saved!</>
                      ) : (
                          <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</>
                      )}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 bg-[#1A1A1A] p-1.5 rounded-full border border-white/5 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium transition-all ${
                            activeTab === 'health' ? 'bg-white/10 text-white shadow-sm' : 'text-[#A0A0A0] hover:text-white'
                        }`}
                    >
                        <Activity size={16} /> Business Health
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium transition-all ${
                            activeTab === 'profile' ? 'bg-white/10 text-white shadow-sm' : 'text-[#A0A0A0] hover:text-white'
                        }`}
                    >
                        <User size={16} /> Profile Info
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        <div className="col-span-12 bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-6">
                                <UserButton
                                    appearance={{
                                        elements: { avatarBox: "w-16 h-16 shadow-lg shadow-black/50" }
                                    }}
                                />
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-1">
                                        {clerkUser?.fullName || clerkUser?.firstName || 'Business Owner'}
                                    </h2>
                                    <div className="text-[#A0A0A0] text-sm flex items-center gap-2">
                                        {clerkUser?.primaryEmailAddress?.emailAddress}
                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                        <span>Manage Clerk Account</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A0A0A0] group-hover:bg-white/10 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        {FIELD_CONFIG.map((section, idx) => (
                            <div key={section.section} className="col-span-12 lg:col-span-6 bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                      {idx + 1}
                                    </div>
                                    <h2 className="text-base font-semibold text-white">
                                        {section.section}
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    {section.fields.map(field => (
                                        <div key={field.id}>
                                            <label className="text-[13px] text-[#A0A0A0] font-medium block mb-2 ml-1">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <div className="custom-premium-select-wrapper">
                                                  <PremiumSelect
                                                      value={profile[field.id] || ''}
                                                      onChange={(val: string) => setField(field.id, val)}
                                                      options={field.options || []}
                                                      placeholder={`Select ${field.label}`}
                                                  />
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={profile[field.id] || ''}
                                                    placeholder={field.placeholder}
                                                    onChange={e => setField(field.id, e.target.value)}
                                                    className="w-full bg-[#2A2A2A] border border-[#2F2F2F] rounded-2xl px-4 py-3 text-white text-[14px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-[#606060]"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="col-span-12 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-base font-semibold text-white mb-2">
                                    Reset Onboarding
                                </h2>
                                <p className="text-[#A0A0A0] text-[13px]">
                                    Reset the onboarding flow so you can re-run it with updated information from scratch.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const token = await getToken();
                                    await fetch(`${API_BASE}/api/user/profile`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ onboarding_complete: false })
                                    });
                                    window.location.href = '/chat';
                                }}
                                className="px-6 py-3 border border-white/10 text-white bg-white/5 rounded-full text-[13px] font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
                            >
                                Reset Flow
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-7 bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8">
                            <h2 className="text-base font-semibold text-white flex items-center justify-between mb-8">
                                <span>Business Health Score</span>
                                <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-bold tracking-wider">BETA</span>
                            </h2>
                            <HealthScoreCard score={healthScore} />
                        </div>

                        <div className="col-span-12 lg:col-span-5 space-y-6">
                          <div className="bg-[#1A1A1A] border border-white/5 rounded-[32px] p-8">
                              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-8">
                                  <Target size={18} className="text-primary" /> Impact Metrics
                              </h2>
                              <ImpactNumbers stats={impactStats} />
                          </div>
                          
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-8 text-[13px] text-amber-200/80 leading-relaxed">
                              <strong className="text-amber-400 block mb-2 text-[14px]">How is this calculated?</strong>
                              Your score is deterministically calculated without AI based on 5 dimensions: your scheme bookmarks/drafts, Udyam compliance, logged annual turnover, industry MSME weightings, and primary goals. Keep interacting with MAYA and applying to schemes to increase your score automatically.
                          </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
