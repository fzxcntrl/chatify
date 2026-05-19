import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LockIcon, MailIcon, UserIcon, LoaderIcon, AtSign, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router";
import { ParallaxStarsBackground } from "../components/ParallaxStarsBackground";

function AuthIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]">
      <circle cx="200" cy="200" r="160" fill="var(--primary-subtle)" />
      <circle cx="200" cy="200" r="120" fill="var(--primary-muted)" />
      <circle cx="150" cy="160" r="28" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
      <circle cx="150" cy="153" r="10" fill="var(--primary)" opacity="0.6" />
      <path d="M135 170 Q150 180 165 170" stroke="var(--primary)" strokeWidth="2" opacity="0.4" fill="none" />
      <circle cx="270" cy="180" r="28" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
      <circle cx="270" cy="173" r="10" fill="var(--primary)" opacity="0.6" />
      <path d="M255 190 Q270 200 285 190" stroke="var(--primary)" strokeWidth="2" opacity="0.4" fill="none" />
      <circle cx="200" cy="280" r="28" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
      <circle cx="200" cy="273" r="10" fill="var(--primary)" opacity="0.6" />
      <path d="M185 290 Q200 300 215 290" stroke="var(--primary)" strokeWidth="2" opacity="0.4" fill="none" />
      <line x1="175" y1="170" x2="245" y2="180" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" strokeDasharray="6 4" />
      <line x1="155" y1="188" x2="195" y2="255" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" strokeDasharray="6 4" />
      <line x1="265" y1="208" x2="210" y2="255" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" strokeDasharray="6 4" />
      <circle cx="210" cy="210" r="16" fill="var(--primary)" opacity="0.85" />
      <line x1="204" y1="210" x2="216" y2="210" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="210" y1="204" x2="210" y2="216" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="120" r="4" fill="var(--primary)" opacity="0.1" />
      <circle cx="310" cy="130" r="6" fill="var(--primary)" opacity="0.08" />
      <circle cx="120" cy="320" r="5" fill="var(--primary)" opacity="0.12" />
      <circle cx="300" cy="300" r="3" fill="var(--primary)" opacity="0.1" />
    </svg>
  );
}

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isSigningUp, googleAuth, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <ParallaxStarsBackground
      title={"Create your space,\nthen make it yours"}
      speed={0.9}
      className="px-4"
    >
      <div className="auth-shell animate-fade-in-up">
        <div className="flex flex-col md:flex-row">
          <div className="auth-panel flex items-center justify-center p-6 sm:p-8 md:w-1/2 md:p-12">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <p className="app-kicker mb-3">Chatify</p>
                <h1 className="mb-2 text-3xl font-semibold font-heading sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                  Create your account
                </h1>
                <p className="text-sm sm:text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                  Set up your profile once and keep the experience consistent on phone and desktop.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div className="relative flex-1">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="app-input-field py-2.5 pl-10 pr-4 text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <label className="w-24 shrink-0 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Username
                  </label>
                  <div className="relative flex-1">
                    <AtSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
                      className="app-input-field py-2.5 pl-10 pr-4 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                      placeholder="john_doe"
                      maxLength={30}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-24 shrink-0"></div>
                  <p className="text-[10px] mt-1 flex-1" style={{ color: 'var(--text-muted)' }}>Lowercase letters, numbers, underscores and periods only</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <div className="relative flex-1">
                  <MailIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="app-input-field py-2.5 pl-10 pr-4 text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 shrink-0 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative flex-1">
                  <LockIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="app-input-field py-2.5 pl-10 pr-10 text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="app-icon-button absolute right-1 top-1/2 h-9 min-h-0 w-9 min-w-0 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSigningUp}
                className="app-primary-button w-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  "Create account"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Or continue with</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={googleAuth}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{" "}
                <Link to="/login" className="font-medium" style={{ color: 'var(--primary)' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-aside hidden items-center justify-center border-l p-10 md:flex md:w-1/2" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-sm text-center">
              <AuthIllustration />
              <h2 className="mt-6 mb-2 text-lg font-medium font-heading" style={{ color: 'var(--text-primary)' }}>
                Designed to feel personal
              </h2>
              <p className="mx-auto max-w-[280px] text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Choose your profile, theme, and presence details once, then keep every conversation looking consistent everywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ParallaxStarsBackground>
  );
}
export default SignUpPage;
