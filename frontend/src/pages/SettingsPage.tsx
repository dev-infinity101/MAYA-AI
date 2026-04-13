import { useState, useEffect } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Activity, User, Target } from 'lucide-react';
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
    const navigate = useNavigate();

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

    const inputClass = `w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 
                        text-white text-sm focus:border-emerald-500/50 focus:outline-none 
                        transition-colors placeholder:text-gray-600`;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
                <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-base font-semibold text-white">Settings</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                            ${saved 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                            } disabled:opacity-50`}
                    >
                        {saved ? (
                            <><CheckCircle size={15} /> Saved!</>
                        ) : (
                            <><Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}</>
                        )}
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="max-w-2xl mx-auto px-6 h-12 flex items-end gap-6 border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'health' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Activity size={16} /> Business Health
                        </div>
                        {activeTab === 'health' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'profile' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <User size={16} /> Profile Info
                        </div>
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'profile' ? (
                    <>
                        {/* Clerk Account Section */}
                        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                Account
                            </h2>
                            <div className="flex items-center gap-4">
                                <UserButton
                                    appearance={{
                                        elements: { avatarBox: "w-12 h-12" }
                                    }}
                                />
                                <div>
                                    <div className="text-white font-medium">
                                        {clerkUser?.fullName || clerkUser?.firstName || 'Business Owner'}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        {clerkUser?.primaryEmailAddress?.emailAddress}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Click avatar to manage Clerk account (password, 2FA, etc.)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {FIELD_CONFIG.map(section => (
                            <div key={section.section} className="bg-white/3 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                                    {section.section}
                                </h2>
                                <div className="space-y-4">
                                    {section.fields.map(field => (
                                        <div key={field.id}>
                                            <label className="text-sm text-gray-300 font-medium block mb-1.5">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <PremiumSelect
                                                    value={profile[field.id] || ''}
                                                    onChange={(val: string) => setField(field.id, val)}
                                                    options={field.options || []}
                                                    placeholder={`Select ${field.label}`}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={profile[field.id] || ''}
                                                    placeholder={field.placeholder}
                                                    onChange={e => setField(field.id, e.target.value)}
                                                    className={inputClass}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Onboarding reset */}
                        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Onboarding
                            </h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Reset the onboarding flow so you can re-run it with updated information.
                            </p>
                            <button
                                onClick={async () => {
                                    const token = await getToken();
                                    await fetch(`${API_BASE}/api/user/profile`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ onboarding_complete: false })
                                    });
                                    navigate('/chat');
                                }}
                                className="px-4 py-2 border border-white/10 text-gray-400 rounded-xl text-sm hover:border-white/20 hover:text-white transition-colors"
                            >
                                Reset Onboarding
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Health Score Tab */}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-400 flex items-center justify-between mb-4">
                                <span>BUSINESS HEALTH SCORE</span>
                                <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">BETA</span>
                            </h2>
                            <HealthScoreCard score={healthScore} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-4">
                                <Target size={16} /> IMPACT METRICS
                            </h2>
                            <ImpactNumbers stats={impactStats} />
                        </div>
                        
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/80 leading-relaxed">
                            <strong className="text-amber-400 block mb-1">How is this calculated?</strong>
                            Your score is deterministically calculated without AI based on 5 dimensions: your scheme bookmarks/drafts, Udyam compliance, logged annual turnover, industry MSME weightings, and primary goals. Keep interacting with MAYA and applying to schemes to increase your score automatically.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
