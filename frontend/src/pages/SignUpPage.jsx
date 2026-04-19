import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

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
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-4">
      <div
        className="w-full max-w-[960px] flex flex-col md:flex-row overflow-hidden animate-fade-in-up"
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
              <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Create your account
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Get started with Chatify in seconds
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
                    placeholder="Your name"
                  />
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
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    placeholder="Create a password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  color: 'var(--text-inverse)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                }}
                onMouseEnter={(e) => { if (!isSigningUp) e.target.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                Sign in
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
            <h2 className="text-lg font-medium mt-6 mb-2" style={{ color: 'var(--text-primary)' }}>
              Join the conversation
            </h2>
            <p className="text-sm max-w-[260px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Connect with friends and start messaging instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignUpPage;
