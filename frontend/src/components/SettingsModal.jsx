import { useState } from "react";
import { useAuthStore, applyTheme, CHAT_THEMES } from "../store/useAuthStore";
import { SaveIcon, MonitorIcon, ShieldIcon, SunIcon, MoonIcon, LoaderIcon, LockIcon, XIcon, MessageCircleIcon } from "lucide-react";

function SettingsModal({ onClose }) {
  const { authUser, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState("display");

  const [selectedTheme, setSelectedTheme] = useState(authUser?.theme || "dark");
  const [selectedChatTheme, setSelectedChatTheme] = useState(authUser?.chatTheme || "default");
  const [isUpdatingDisplay, setIsUpdatingDisplay] = useState(false);

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    applyTheme(newTheme, selectedChatTheme);
  };

  const handleChatThemeChange = (themeKey) => {
    setSelectedChatTheme(themeKey);
    applyTheme(selectedTheme, themeKey);
  };

  const saveDisplaySettings = async () => {
    setIsUpdatingDisplay(true);
    await updateProfile({ theme: selectedTheme, chatTheme: selectedChatTheme });
    setIsUpdatingDisplay(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwords.newPassword.length < 6) {
      return setPasswordError("New password must be at least 6 characters.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordError("New passwords do not match.");
    }

    const success = await changePassword({
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword
    }, setIsUpdatingPassword);

    if (success) {
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const hasDisplayChanges = selectedTheme !== authUser?.theme || selectedChatTheme !== (authUser?.chatTheme || "default");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="no-glass w-full max-w-4xl flex flex-col md:flex-row gap-0 overflow-hidden rounded-2xl animate-fade-in-up"
        style={{
          height: 'calc(100vh - 4rem)',
          maxHeight: '700px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >

        {/* Sidebar */}
        <div
          className="no-glass w-full md:w-56 flex-shrink-0 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-base)',
            borderRight: '1px solid var(--border)',
          }}
        >
          <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("display")}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-sm"
              style={{
                backgroundColor: activeTab === "display" ? 'var(--bg-hover)' : 'transparent',
                color: activeTab === "display" ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: activeTab === "display" ? '600' : '400'
              }}
            >
              <MonitorIcon className="w-5 h-5" />
              <span>Display &amp; Theme</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-sm"
              style={{
                backgroundColor: activeTab === "security" ? 'var(--bg-hover)' : 'transparent',
                color: activeTab === "security" ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: activeTab === "security" ? '600' : '400'
              }}
            >
              <ShieldIcon className="w-5 h-5" />
              <span>Account Security</span>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div
          className="no-glass flex-1 flex flex-col overflow-hidden relative"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          {activeTab === "display" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Display &amp; Theme</h2>

              {/* Theme Mode */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Theme Mode</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTheme === "dark" ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTheme === "dark" ? 'var(--primary-muted)' : 'transparent',
                      width: '110px'
                    }}
                  >
                    <div className="p-3 rounded-full shadow-md" style={{ backgroundColor: '#0F1419', color: 'white' }}>
                      <MoonIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTheme === "light" ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTheme === "light" ? 'var(--primary-muted)' : 'transparent',
                      width: '110px'
                    }}
                  >
                    <div className="p-3 rounded-full shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                      <SunIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Light</span>
                  </button>
                </div>
              </div>

              {/* Chat Color Theme */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircleIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Chat Color Theme</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Choose a color palette for your chat bubbles and message text.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(CHAT_THEMES).map(([key, ct]) => {
                    const isSelected = selectedChatTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleChatThemeChange(key)}
                        className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? ct.sentBg : 'var(--border)',
                          backgroundColor: isSelected ? `${ct.sentBg}12` : 'transparent',
                        }}
                      >
                        {/* Chat preview mini bubbles */}
                        <div className="w-full flex flex-col gap-1.5 py-2 px-1">
                          {/* Received bubble */}
                          <div className="flex justify-start">
                            <div
                              className="px-3 py-1.5 rounded-xl rounded-bl-sm text-[10px] font-medium max-w-[85%]"
                              style={{ backgroundColor: ct.receivedBg, color: ct.receivedText }}
                            >
                              Hey there!
                              <span className="block text-[8px] mt-0.5" style={{ opacity: 0.6 }}>10:30</span>
                            </div>
                          </div>
                          {/* Sent bubble */}
                          <div className="flex justify-end">
                            <div
                              className="px-3 py-1.5 rounded-xl rounded-br-sm text-[10px] font-medium max-w-[85%]"
                              style={{ backgroundColor: ct.sentBg, color: ct.sentText }}
                            >
                              Hi! 👋
                              <span className="block text-[8px] mt-0.5" style={{ opacity: 0.7 }}>10:31</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: isSelected ? ct.sentBg : 'var(--text-primary)' }}>
                          {ct.name}
                        </span>

                        {/* Selected checkmark */}
                        {isSelected && (
                          <div
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: ct.sentBg, color: ct.sentText }}
                          >
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Account Security</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Update your password to keep your account secure.</p>

              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Old Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                      className="w-full py-2.5 pl-10 pr-4 text-sm transition-all"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full py-2.5 pl-10 pr-4 text-sm transition-all"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full py-2.5 pl-10 pr-4 text-sm transition-all"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{passwordError}</p>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingPassword || !passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword}
                  className="py-2.5 px-6 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', borderRadius: 'var(--radius-md)' }}
                >
                  {isUpdatingPassword ? <LoaderIcon className="w-5 h-5 mx-auto animate-spin" /> : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* Floating save bar for display changes */}
          {activeTab === "display" && hasDisplayChanges && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 py-3 px-6 rounded-full shadow-2xl flex items-center gap-4 animate-fade-in-up border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Unsaved changes</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleThemeChange(authUser?.theme || "dark");
                    handleChatThemeChange(authUser?.chatTheme || "default");
                  }}
                  disabled={isUpdatingDisplay}
                  className="px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Discard
                </button>
                <button
                  onClick={saveDisplaySettings}
                  disabled={isUpdatingDisplay}
                  className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {isUpdatingDisplay ? <LoaderIcon className="w-3 h-3 animate-spin"/> : <SaveIcon className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
