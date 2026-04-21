import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MailIcon, LoaderIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router";
import { ParallaxStarsBackground } from "../components/ParallaxStarsBackground";

function AuthIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]">
      <circle cx="200" cy="200" r="160" fill="var(--primary-subtle)" />
      <circle cx="200" cy="200" r="120" fill="var(--primary-muted)" />
      <rect x="100" y="130" width="180" height="80" rx="20" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
      <rect x="110" y="148" width="100" height="8" rx="4" fill="var(--primary)" opacity="0.4" />
      <rect x="110" y="164" width="140" height="8" rx="4" fill="var(--text-muted)" opacity="0.3" />
      <rect x="110" y="180" width="60" height="8" rx="4" fill="var(--text-muted)" opacity="0.2" />
      <rect x="140" y="230" width="160" height="60" rx="20" fill="var(--primary)" opacity="0.85" />
      <rect x="158" y="250" width="90" height="8" rx="4" fill="white" opacity="0.8" />
      <rect x="158" y="266" width="50" height="8" rx="4" fill="white" opacity="0.5" />
      <circle cx="320" cy="120" r="6" fill="var(--primary)" opacity="0.15" />
      <circle cx="340" cy="150" r="4" fill="var(--primary)" opacity="0.1" />
      <circle cx="80" cy="300" r="8" fill="var(--primary)" opacity="0.12" />
      <circle cx="60" cy="270" r="5" fill="var(--primary)" opacity="0.08" />
      <path d="M200 310 L200 360" stroke="var(--primary)" strokeWidth="2" opacity="0.15" strokeDasharray="4 4" />
      <circle cx="200" cy="370" r="6" fill="var(--primary)" opacity="0.2" />
    </svg>
  );
}

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <ParallaxStarsBackground
      title={"Stay in touch,\nwithout the noise"}
      speed={1.1}
      className="px-4"
    >
      <div className="auth-shell animate-fade-in-up">
        <div className="flex flex-col md:flex-row">
          <div className="auth-panel flex items-center justify-center p-6 sm:p-8 md:w-1/2 md:p-12">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <p className="app-kicker mb-3">Chatify</p>
                <h1 className="mb-2 text-3xl font-semibold font-heading sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                  Welcome back
                </h1>
                <p className="text-sm sm:text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                  Sign in to pick up your conversations across desktop and mobile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
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
                disabled={isLoggingIn}
                className="app-primary-button w-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-medium" style={{ color: 'var(--primary)' }}>
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-aside hidden items-center justify-center border-l p-10 md:flex md:w-1/2" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-sm text-center">
              <AuthIllustration />
              <h2 className="mt-6 mb-2 text-lg font-medium font-heading" style={{ color: 'var(--text-primary)' }}>
                A calmer way to chat
              </h2>
              <p className="mx-auto max-w-[280px] text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Clean threads, live presence, and a layout that feels at home on both small screens and wide monitors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ParallaxStarsBackground>
  );
}
export default LoginPage;
