import { useState } from "react";
import { createPortal } from "react-dom";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, SettingsIcon, PencilIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

function ProfileHeader() {
  const { logout, authUser } = useAuthStore();
  const { isSoundEnabled, toggleSound, setShowSettingsModal, setShowEditProfileModal } = useChatStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div
      className="p-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Row 1: Avatar + Name + Edit Profile */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ border: '2px solid var(--border)' }}
          >
            <img
              src={authUser.profilePic || "/avatar.png"}
              alt="User image"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: 'var(--online)',
              border: '2px solid var(--bg-surface)',
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {authUser.fullName}
          </h3>
          <button
            onClick={() => setShowEditProfileModal(true)}
            className="flex items-center gap-1 mt-0.5 transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            <PencilIcon className="w-3 h-3" />
            <span className="text-[11px] font-medium">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Row 2: Action buttons — evenly spaced */}
      <div className="flex items-center justify-between gap-1">
        <button
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onClick={() => {
            toggleSound();
          }}
        >
          {isSoundEnabled ? (
            <Volume2Icon className="w-4 h-4" />
          ) : (
            <VolumeOffIcon className="w-4 h-4" />
          )}
          <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Sound</span>
        </button>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Settings</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(224, 95, 95, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOutIcon className="w-4 h-4" />
          <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--danger)' }}>Log Out</span>
        </button>
      </div>

      {showLogoutModal && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[160] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowLogoutModal(false);
              }}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-xl animate-fade-in-up"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Log Out
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to log out? You will need to sign back in to access your chats.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    onClick={() => setShowLogoutModal(false)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity flex items-center gap-2"
                    style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}
                    onClick={() => {
                      setShowLogoutModal(false);
                      logout();
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Confirm
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
export default ProfileHeader;
