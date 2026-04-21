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
  const { signup, isSigningUp } = useAuthStore();

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
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div className="relative">
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Username
                </label>
                <div className="relative">
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
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Lowercase letters, numbers, underscores and periods only</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </label>
                <div className="relative">
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
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
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
                className="app-primary-button w-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  "Create account"
                )}
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
