import { useState } from "react";
import { useAuthStore, applyTheme, CHAT_THEMES, CHAT_BACKGROUNDS, DEFAULT_CHAT_BACKGROUND } from "../store/useAuthStore";
import { DEFAULT_LOCATION_MARKER, LOCATION_MARKERS } from "../lib/locationMarkers";
import { getTrackerMarkerMarkup } from "../lib/trackerMarkerMarkup";
import {
  SaveIcon,
  MonitorIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  LoaderIcon,
  LockIcon,
  XIcon,
  MessageCircleIcon,
  MapPinnedIcon,
  Trash2Icon,
  TimerOffIcon,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

function SettingsModal({ onClose }) {
  const { authUser, updateProfile, changePassword, deleteAccount } = useAuthStore();
  const [activeTab, setActiveTab] = useState("display");

  const [selectedTheme, setSelectedTheme] = useState(authUser?.theme || "dark");
  const [selectedChatTheme, setSelectedChatTheme] = useState(authUser?.chatTheme || "default");
  const [selectedLocationMarker, setSelectedLocationMarker] = useState(authUser?.locationMarker || DEFAULT_LOCATION_MARKER);
  const [isUpdatingDisplay, setIsUpdatingDisplay] = useState(false);
  const [selectedDisappearingChatsEnabled, setSelectedDisappearingChatsEnabled] = useState(
    authUser?.disappearingChatsEnabled === true
  );

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteUsernameConfirmation, setDeleteUsernameConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const previewBgEntry = CHAT_BACKGROUNDS[DEFAULT_CHAT_BACKGROUND] || CHAT_BACKGROUNDS.default;

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    applyTheme(newTheme, selectedChatTheme);
  };

  const handleChatThemeChange = (themeKey) => {
    setSelectedChatTheme(themeKey);
    applyTheme(selectedTheme, themeKey);
  };

  const renderMarkerPreview = (markerKey) => (
    <div
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: getTrackerMarkerMarkup(markerKey, { preview: true }),
      }}
    />
  );

  const saveDisplaySettings = async () => {
    setIsUpdatingDisplay(true);
    await updateProfile({
      theme: selectedTheme,
      chatTheme: selectedChatTheme,
      locationMarker: selectedLocationMarker,
    });
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

  const hasDisplayChanges =
    selectedTheme !== (authUser?.theme || "dark") ||
    selectedChatTheme !== (authUser?.chatTheme || "default") ||
    selectedLocationMarker !== (authUser?.locationMarker || DEFAULT_LOCATION_MARKER);
  const hasPrivacyChanges =
    selectedDisappearingChatsEnabled !== (authUser?.disappearingChatsEnabled === true);

  return (
    <div
      className="app-modal-backdrop z-[100]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="app-modal-panel no-glass h-dvh w-full max-w-4xl flex flex-col md:h-[min(88vh,760px)] md:flex-row gap-0 overflow-hidden animate-fade-in-up"
      >

        {/* Sidebar */}
        <div
          className="no-glass w-full md:w-56 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r"
          style={{
            backgroundColor: 'var(--bg-base)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <button
              onClick={onClose}
              className="app-icon-button"
              style={{ color: 'var(--text-secondary)' }}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 p-3 md:block md:space-y-1">
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
          className="no-glass flex-1 min-h-0 flex flex-col overflow-hidden relative"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          {activeTab === "display" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Display &amp; Theme</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Change how your app looks and how your live location marker appears to other people.
              </p>

              {/* Theme Mode */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>App Theme</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Choose whether the app uses a dark look or a light look.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTheme === "dark" ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTheme === "dark" ? 'var(--primary-muted)' : 'transparent',
                      width: '100px'
                    }}
                  >
                    <div className="p-3 rounded-full shadow-md" style={{ backgroundColor: '#0F1419', color: 'white' }}>
                      <MoonIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Dark</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: selectedTheme === "light" ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTheme === "light" ? 'var(--primary-muted)' : 'transparent',
                      width: '100px'
                    }}
                  >
                    <div className="p-3 rounded-full shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                      <SunIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Light</span>
                  </button>
                </div>
              </div>

              {/* Chat Color Theme (Bubble Colors) */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircleIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Chat Bubble Color</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  This changes the color style of the message bubbles inside chat.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(CHAT_THEMES).map(([key, ct]) => {
                    const isSelected = selectedChatTheme === key;
                    const isDark = selectedTheme === 'dark';
                    const previewBg = isDark ? previewBgEntry.dark : previewBgEntry.light;
                    const variant = isDark ? ct.dark : ct.light;
                    return (
                      <button
                        key={key}
                        onClick={() => handleChatThemeChange(key)}
                        className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? ct.sentBg : 'var(--border)',
                          backgroundColor: isSelected ? `${ct.sentBg}15` : 'transparent',
                        }}
                      >
                        {/* Chat preview */}
                        <div
                          className="w-full rounded-lg py-3 px-2 flex flex-col gap-1.5"
                          style={{ backgroundColor: previewBg }}
                        >
                          {/* Received */}
                          <div className="flex justify-start">
                            <div
                              className="px-3 py-1.5 rounded-xl rounded-bl-sm text-[10px] font-medium"
                              style={{ backgroundColor: variant.receivedBg, color: variant.receivedText, boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.08)' }}
                            >
                              Hey!
                              <span className="block text-[7px] mt-0.5" style={{ opacity: 0.6 }}>10:30</span>
                            </div>
                          </div>
                          {/* Sent */}
                          <div className="flex justify-end">
                            <div
                              className="px-3 py-1.5 rounded-xl rounded-br-sm text-[10px] font-medium"
                              style={{ backgroundColor: ct.sentBg, color: ct.sentText }}
                            >
                              Sounds good
                              <span className="block text-[7px] mt-0.5" style={{ opacity: 0.7 }}>10:31</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: isSelected ? ct.sentBg : 'var(--text-primary)' }}>
                          {ct.name}
                        </span>

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

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <MapPinnedIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Live Location Marker</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Pick the symbol people will see for you on the live location map.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(LOCATION_MARKERS).map(([key, marker]) => {
                    const isSelected = selectedLocationMarker === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedLocationMarker(key)}
                        className="flex items-center gap-4 p-4 rounded-xl border transition-all text-left"
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: isSelected ? 'var(--primary-muted)' : 'transparent',
                          boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                        }}
                      >
                        <div className="w-14 h-16 flex items-center justify-center flex-shrink-0">
                          {renderMarkerPreview(key)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {marker.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {marker.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Account Security</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Update your password to keep your account secure, or permanently delete your account if you need to leave Chatify.
              </p>

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

              <div
                className="mt-10 max-w-md rounded-3xl border p-5"
                style={{
                  borderColor: hasPrivacyChanges ? "var(--primary)" : "var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--primary-muted)", color: "var(--primary)" }}
                  >
                    <TimerOffIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Disappearing Chats When Offline
                    </h3>
                    <p className="mt-1 text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
                      When this is turned on, all chats involving your account will be permanently deleted as soon as you go offline.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedDisappearingChatsEnabled((current) => !current)}
                      className="mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors"
                      style={{
                        borderColor: selectedDisappearingChatsEnabled ? "var(--primary)" : "var(--border)",
                        backgroundColor: selectedDisappearingChatsEnabled ? "var(--primary-muted)" : "transparent",
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {selectedDisappearingChatsEnabled ? "Enabled" : "Disabled"}
                        </div>
                        <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          {selectedDisappearingChatsEnabled
                            ? "Chats will disappear after you go offline."
                            : "Chats will stay unless you delete them manually."}
                        </div>
                      </div>
                      <div
                        className="flex h-7 w-12 items-center rounded-full px-1 transition-all"
                        style={{
                          backgroundColor: selectedDisappearingChatsEnabled ? "var(--primary)" : "var(--border)",
                          justifyContent: selectedDisappearingChatsEnabled ? "flex-end" : "flex-start",
                        }}
                      >
                        <span className="block h-5 w-5 rounded-full bg-white" />
                      </div>
                    </button>

                    {hasPrivacyChanges && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsUpdatingPrivacy(true);
                            await updateProfile({
                              disappearingChatsEnabled: selectedDisappearingChatsEnabled,
                            });
                            setIsUpdatingPrivacy(false);
                          }}
                          disabled={isUpdatingPrivacy}
                          className="app-primary-button flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium disabled:opacity-50"
                        >
                          {isUpdatingPrivacy ? (
                            <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <SaveIcon className="h-3.5 w-3.5" />
                          )}
                          Save Chat Privacy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="mt-10 max-w-md rounded-3xl border p-5"
                style={{
                  borderColor: "rgba(220, 38, 38, 0.25)",
                  backgroundColor: "rgba(220, 38, 38, 0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(220, 38, 38, 0.14)", color: "var(--danger)" }}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Delete Account
                    </h3>
                    <p className="mt-1 text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
                      This permanently deletes your ID, profile, friends, and chat history. You will need to type your username before the delete button is enabled.
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: "var(--danger)", color: "white" }}
                      onClick={() => {
                        setDeleteUsernameConfirmation("");
                        setShowDeleteAccountModal(true);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Permanently Delete My ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating save bar for display changes */}
          {activeTab === "display" && hasDisplayChanges && (
            <div
              className="absolute bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 py-3 px-4 sm:px-6 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-fade-in-up border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              <div className="text-sm font-medium text-center sm:text-left" style={{ color: 'var(--text-primary)' }}>Unsaved changes</div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    const origTheme = authUser?.theme || "dark";
                    const origChatTheme = authUser?.chatTheme || "default";
                    const origLocationMarker = authUser?.locationMarker || DEFAULT_LOCATION_MARKER;
                    setSelectedTheme(origTheme);
                    setSelectedChatTheme(origChatTheme);
                    setSelectedLocationMarker(origLocationMarker);
                    applyTheme(origTheme, origChatTheme);
                  }}
                  disabled={isUpdatingDisplay}
                  className="app-secondary-button rounded-full px-4 text-xs font-medium"
                  style={{ minHeight: '36px' }}
                >
                  Discard
                </button>
                <button
                  onClick={saveDisplaySettings}
                  disabled={isUpdatingDisplay}
                  className="app-primary-button flex items-center gap-1 rounded-full px-4 text-xs font-medium disabled:opacity-50"
                  style={{ minHeight: '36px' }}
                >
                  {isUpdatingDisplay ? <LoaderIcon className="w-3 h-3 animate-spin"/> : <SaveIcon className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {showDeleteAccountModal && (
        <ConfirmationModal
          title="Delete Your ID?"
          description="Are you sure you want to permanently delete your ID? This action cannot be undone."
          confirmLabel="Delete My ID"
          inputLabel="Confirm your username"
          inputPlaceholder={`Type ${authUser?.username}`}
          inputValue={deleteUsernameConfirmation}
          onInputChange={setDeleteUsernameConfirmation}
          requiredConfirmationValue={authUser?.username || ""}
          onClose={() => {
            if (!isDeletingAccount) {
              setShowDeleteAccountModal(false);
              setDeleteUsernameConfirmation("");
            }
          }}
          onConfirm={async () => {
            const didDelete = await deleteAccount(deleteUsernameConfirmation, setIsDeletingAccount);
            if (didDelete) {
              setShowDeleteAccountModal(false);
              onClose();
            }
          }}
          isLoading={isDeletingAccount}
        />
      )}
    </div>
  );
}

export default SettingsModal;
