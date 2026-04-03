import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <SignUp
                routing="path"
                path="/sign-up"
                fallbackRedirectUrl="/chat"
                appearance={{
                    variables: {
                        colorPrimary: '#10b981',
                        colorBackground: '#0a0a0a',
                        colorText: '#e2e8f0',
                        colorInputBackground: '#1a1a1a',
                        colorInputText: '#e2e8f0',
                        borderRadius: '12px',
                    },
                    elements: {
                        card: 'shadow-2xl border border-white/10',
                        headerTitle: 'text-white',
                        headerSubtitle: 'text-gray-400',
                        socialButtonsBlockButton: 'border border-white/10 hover:bg-white/5',
                        dividerLine: 'bg-white/10',
                        dividerText: 'text-gray-500',
                        formFieldInput: 'border-white/10 focus:border-emerald-500',
                        footerActionLink: 'text-emerald-400 hover:text-emerald-300',
                    }
                }}
            />
        </div>
    );
}
