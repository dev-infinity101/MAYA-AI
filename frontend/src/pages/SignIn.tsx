import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <SignIn
                routing="path"
                path="/sign-in"
                fallbackRedirectUrl="/chat"
                appearance={{
                    variables: {
                        colorPrimary: '#C4610A',
                        colorBackground: '#FFFCF5',
                        colorText: '#1C1007',
                        colorInputBackground: '#FFFFFF',
                        colorInputText: '#1C1007',
                        borderRadius: '12px',
                    },
                    elements: {
                        card: 'shadow-[0_4px_32px_rgba(150,80,0,0.12)] border border-[rgba(196,97,10,0.12)]',
                        headerTitle: 'text-text-primary font-display',
                        headerSubtitle: 'text-text-secondary',
                        socialButtonsBlockButton: 'border border-[rgba(196,97,10,0.15)] hover:bg-primary/5',
                        dividerLine: 'bg-[rgba(196,97,10,0.12)]',
                        dividerText: 'text-text-muted',
                        formFieldInput: 'border-[rgba(196,97,10,0.15)] focus:border-primary/50',
                        footerActionLink: 'text-primary hover:text-primary-light',
                    }
                }}
            />
        </div>
    );
}
