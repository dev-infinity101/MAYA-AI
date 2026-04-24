import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { PremiumSelect } from './PremiumSelect'

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface Props {
    onComplete: () => void
}

const ONBOARDING_STEPS = [
    {
        id: 'personal',
        title: 'About You',
        fields: [
            { id: 'full_name',  label: 'Your full name',  type: 'text',   placeholder: 'As it appears on Aadhaar' },
            { id: 'category',   label: 'Your category',   type: 'select', options: ['General', 'SC', 'ST', 'OBC', 'Women', 'Ex-Serviceman'] },
            { id: 'state',      label: 'State',           type: 'select', options: INDIAN_STATES },
            { id: 'city',       label: 'City / District', type: 'text',   placeholder: 'e.g. Lucknow' },
        ]
    },
    {
        id: 'business',
        title: 'Your Business',
        fields: [
            { id: 'business_name', label: 'Business name (or proposed name)', type: 'text',   placeholder: 'e.g. Priya Foods' },
            { id: 'business_type', label: 'Type of business',                 type: 'select', options: ['Manufacturing', 'Services', 'Trading', 'Agriculture Allied', 'Not started yet'] },
            { id: 'sector',        label: 'Your sector',                      type: 'select', options: ['Food & Beverage', 'Textile & Garments', 'Technology', 'Retail', 'Construction', 'Beauty & Wellness', 'Education', 'Healthcare', 'Agriculture', 'Handicrafts', 'Transport', 'Other'] },
            { id: 'turnover_range',label: 'Annual revenue (approximate)',     type: 'select', options: ['Not started', 'Under ₹10 Lakh', '₹10L - ₹50L', '₹50L - ₹5Cr', 'Above ₹5Cr'] },
        ]
    },
    {
        id: 'details',
        title: 'A Few More Details',
        fields: [
            { id: 'udyam_registered', label: 'Do you have Udyam Registration?',      type: 'select', options: ['Yes', 'No', "Don't know"] },
            { id: 'existing_loan',    label: 'Do you have any existing business loan?', type: 'select', options: ['Yes', 'No'] },
            { id: 'primary_goal',     label: 'What do you need most right now?',      type: 'select', options: ['Funding / Loan', 'Equipment / Machinery', 'Training / Skills', 'Market Access', 'Brand Building', 'All of the above'] },
        ]
    }
]

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

export const OnboardingModal = ({ onComplete }: Props) => {
    const { getToken } = useAuth()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const step = ONBOARDING_STEPS[currentStep]
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

    const handleNext = async () => {
        if (!isLastStep) { setCurrentStep(prev => prev + 1); return; }
        setSaving(true)
        try {
            const token = await getToken()
            await fetch(`${API_BASE}/api/user/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...answers,
                    udyam_registered: answers.udyam_registered === 'Yes',
                    existing_loan: answers.existing_loan === 'Yes',
                    onboarding_complete: true
                })
            })
            onComplete()
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-[#1C1007]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white border border-[rgba(196,97,10,0.15)] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(150,80,0,0.15)]">

                {/* Progress bar */}
                <div className="h-1 bg-[rgba(196,97,10,0.08)] w-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                        </p>
                        <h2 className="text-text-primary text-xl font-semibold">{step.title}</h2>
                        <p className="text-text-secondary text-sm mt-1">
                            This helps MAYA pre-fill your applications automatically.
                        </p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        {step.fields.map((field, idx) => (
                            <div key={field.id}>
                                <label className="text-sm text-text-secondary font-medium block mb-1.5">
                                    {field.label}
                                </label>
                                {field.type === 'select' ? (
                                    <PremiumSelect
                                        value={answers[field.id] || ''}
                                        onChange={(val: string) => setAnswers(prev => ({ ...prev, [field.id]: val }))}
                                        options={field.options || []}
                                        placeholder={`Select your ${field.label.toLowerCase()}`}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        autoFocus={idx === 0}
                                        value={answers[field.id] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                        className="w-full bg-[#FEF8EE] border border-[rgba(196,97,10,0.15)] rounded-xl px-4 py-3 text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors placeholder:text-text-muted"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="px-6 py-2.5 border border-[rgba(196,97,10,0.15)] text-text-secondary rounded-xl text-sm font-medium hover:border-primary/25 hover:text-text-primary transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-light transition-colors disabled:opacity-50 shadow-[0_4px_16px_rgba(196,97,10,0.25)]"
                        >
                            {saving ? 'Saving…' : isLastStep ? 'Complete Setup' : 'Continue'}
                        </button>
                    </div>

                    {!isLastStep && (
                        <button
                            onClick={onComplete}
                            className="w-full mt-3 text-xs text-text-muted font-medium hover:text-text-secondary transition-colors"
                        >
                            Skip for now (you can complete this later)
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
