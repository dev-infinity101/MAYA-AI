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

// 8 questions — kept minimal, maximum value for draft pre-filling
const ONBOARDING_STEPS = [
    {
        id: 'personal',
        title: 'About You',
        fields: [
            {
                id: 'full_name',
                label: 'Your full name',
                type: 'text',
                placeholder: 'As it appears on Aadhaar'
            },
            {
                id: 'category',
                label: 'Your category',
                type: 'select',
                options: ['General', 'SC', 'ST', 'OBC', 'Women', 'Ex-Serviceman']
            },
            {
                id: 'state',
                label: 'State',
                type: 'select',
                options: INDIAN_STATES
            },
            {
                id: 'city',
                label: 'City / District',
                type: 'text',
                placeholder: 'e.g. Lucknow'
            },
        ]
    },
    {
        id: 'business',
        title: 'Your Business',
        fields: [
            {
                id: 'business_name',
                label: 'Business name (or proposed name)',
                type: 'text',
                placeholder: 'e.g. Priya Foods'
            },
            {
                id: 'business_type',
                label: 'Type of business',
                type: 'select',
                options: ['Manufacturing', 'Services', 'Trading',
                          'Agriculture Allied', 'Not started yet']
            },
            {
                id: 'sector',
                label: 'Your sector',
                type: 'select',
                options: ['Food & Beverage', 'Textile & Garments',
                          'Technology', 'Retail', 'Construction',
                          'Beauty & Wellness', 'Education', 'Healthcare',
                          'Agriculture', 'Handicrafts', 'Transport', 'Other']
            },
            {
                id: 'turnover_range',
                label: 'Annual revenue (approximate)',
                type: 'select',
                options: ['Not started', 'Under ₹10 Lakh',
                          '₹10L - ₹50L', '₹50L - ₹5Cr', 'Above ₹5Cr']
            },
        ]
    },
    {
        id: 'details',
        title: 'A Few More Details',
        fields: [
            {
                id: 'udyam_registered',
                label: 'Do you have Udyam Registration?',
                type: 'select',
                options: ['Yes', 'No', "Don't know"]
            },
            {
                id: 'existing_loan',
                label: 'Do you have any existing business loan?',
                type: 'select',
                options: ['Yes', 'No']
            },
            {
                id: 'primary_goal',
                label: 'What do you need most right now?',
                type: 'select',
                options: ['Funding / Loan', 'Equipment / Machinery',
                          'Training / Skills', 'Market Access',
                          'Brand Building', 'All of the above']
            },
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
        if (!isLastStep) {
            setCurrentStep(prev => prev + 1)
            return
        }
        // Last step — save to backend
        setSaving(true)
        try {
            const token = await getToken()
            await fetch(`${API_BASE}/api/user/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm 
                        flex items-center justify-center z-[100] p-4">
            <div className="bg-[#0f0f0f] border border-emerald-500/20 
                           rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

                {/* Progress bar */}
                <div className="h-1 bg-white/5 w-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-emerald-400 text-xs font-medium 
                                     uppercase tracking-wider mb-1">
                            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                        </p>
                        <h2 className="text-white text-xl font-semibold">
                            {step.title}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            This helps MAYA pre-fill your applications automatically.
                        </p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        {step.fields.map((field, idx) => (
                            <div key={field.id}>
                                <label className="text-sm text-gray-300 
                                                  font-medium block mb-1.5">
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-colors placeholder:text-gray-500"
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
                                className="px-6 py-2.5 border border-white/10 
                                           text-gray-300 rounded-xl text-sm font-medium
                                           hover:border-white/20 hover:text-white transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="flex-1 py-2.5 bg-emerald-500 text-black 
                                       font-semibold rounded-xl text-sm 
                                       hover:bg-emerald-400 transition-colors
                                       disabled:opacity-50"
                        >
                            {saving ? 'Saving...' :
                             isLastStep ? 'Complete Setup' : 'Continue'}
                        </button>
                    </div>

                    {/* Skip option */}
                    {!isLastStep && (
                        <button
                            onClick={onComplete}
                            className="w-full mt-3 text-xs text-gray-600 font-medium
                                       hover:text-gray-400 transition-colors"
                        >
                            Skip for now (you can complete this later)
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
