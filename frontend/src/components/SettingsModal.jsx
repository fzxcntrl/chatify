import { useState, useRef } from "react";
import { useAuthStore, applyTheme } from "../store/useAuthStore";
import { SaveIcon, MonitorIcon, ShieldIcon, SunIcon, MoonIcon, UploadIcon, LoaderIcon, LockIcon, XIcon } from "lucide-react";

const PRESET_WALLPAPERS = [
  { id: "none", name: "Solid Dark", value: "none" },
  { id: "ocean", name: "Ocean Blur", value: "linear-gradient(to right, #0f2027, #203a43, #2c5364)" },
  { id: "sunset", name: "Warm Sunset", value: "linear-gradient(to right, #2b1055, #7597de)" },
  { id: "aurora", name: "Aurora", value: "linear-gradient(to bottom, #111424, #1E1236, #0D263B)" }
];

function SettingsModal({ onClose }) {
  const { authUser, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState("display");

  const [selectedTheme, setSelectedTheme] = useState(authUser?.theme || "dark");
  const [selectedWallpaper, setSelectedWallpaper] = useState(authUser?.wallpaper || "none");
  const [isUpdatingDisplay, setIsUpdatingDisplay] = useState(false);

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const fileInputRef = useRef(null);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    applyTheme(newTheme, selectedWallpaper);
  };

  const handleWallpaperChange = (newValue) => {
    setSelectedWallpaper(newValue);
    applyTheme(selectedTheme, newValue);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      handleWallpaperChange(reader.result);
    };
  };

  const saveDisplaySettings = async () => {
    setIsUpdatingDisplay(true);
    await updateProfile({ theme: selectedTheme, wallpaper: selectedWallpaper });
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

  const hasDisplayChanges = selectedTheme !== authUser?.theme || selectedWallpaper !== authUser?.wallpaper;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="no-glass w-full max-w-4xl flex flex-col md:flex-row gap-0 md:gap-0 overflow-hidden rounded-2xl animate-fade-in-up"
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

              {/* Background Wallpaper */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Background Wallpaper</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Choose a preset background or upload your own image.</p>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {PRESET_WALLPAPERS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleWallpaperChange(preset.value)}
                      className="group relative rounded-xl overflow-hidden border-2 transition-all aspect-video"
                      style={{
                        borderColor: selectedWallpaper === preset.value ? 'var(--primary)' : 'transparent',
                        background: preset.value === "none" ? 'var(--bg-base)' : preset.value,
                        boxShadow: selectedWallpaper === preset.value ? 'var(--shadow-glow)' : 'none'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                        Select
                      </div>
                      {preset.value === "none" && <span className="absolute bottom-2 left-3 text-xs" style={{ color: 'var(--text-secondary)' }}>Solid</span>}
                    </button>
                  ))}

                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="relative rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all aspect-video hover:bg-[var(--bg-hover)]"
                    style={{
                      borderColor: selectedWallpaper.startsWith("data:") || selectedWallpaper.startsWith("http") ? 'var(--primary)' : 'var(--border)',
                      borderStyle: selectedWallpaper.startsWith("data:") || selectedWallpaper.startsWith("http") ? 'solid' : 'dashed',
                      background: selectedWallpaper.startsWith("data:") || selectedWallpaper.startsWith("http") ? `url(${selectedWallpaper}) center/cover no-repeat` : 'transparent',
                    }}
                  >
                    <div className="p-2 rounded-full backdrop-blur-md bg-black/30 text-white">
                      <UploadIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium backdrop-blur-md bg-black/30 px-2 py-0.5 rounded text-white">Upload</span>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  </button>
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
                    handleWallpaperChange(authUser?.wallpaper || "none");
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
