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
      title={"Real-time chats\nfor every orbit"}
      speed={1.1}
      className="px-4"
    >
      <div
        className="w-full max-w-[960px] flex flex-col md:flex-row overflow-hidden animate-fade-in-up backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div
                className="w-10 h-10 flex items-center justify-center mb-5"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V13.5C20 14.8807 18.8807 16 17.5 16H10.5L6 20V16H6.5C5.11929 16 4 14.8807 4 13.5V6.5Z" fill="white"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-1 font-heading" style={{ color: 'var(--text-primary)' }}>
                Welcome back
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sign in to continue to Chatify
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
                    className="w-full py-2.5 pl-10 pr-4 text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
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
                    className="w-full py-2.5 pl-10 pr-10 text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  color: 'var(--text-inverse)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                }}
                onMouseEnter={(e) => { if (!isLoggingIn) e.target.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
              >
                {isLoggingIn ? (
                  <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
        <div
          className="hidden md:flex md:w-1/2 items-center justify-center p-10"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <div className="text-center">
            <AuthIllustration />
            <h2 className="text-lg font-medium mt-6 mb-2 font-heading" style={{ color: 'var(--text-primary)' }}>
              Connect anytime, anywhere
            </h2>
            <p className="text-sm max-w-[260px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Real-time messaging that feels natural and effortless.
            </p>
          </div>
        </div>
      </div>
    </ParallaxStarsBackground>
  );
}
export default LoginPage;
