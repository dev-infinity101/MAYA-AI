import AuthLoginForm from "@/components/ui/auth-login-form"

function App() {
  const handleLogin = (data) => {
    console.log("Login submitted:", data)
  }

  const handleSocialLogin = (providerId) => {
    console.log("Social login:", providerId)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-sm">
        <AuthLoginForm
          onSubmit={handleLogin}
          onSocialLogin={handleSocialLogin}
        />
      </div>
    </div>
  )
}

export default App
