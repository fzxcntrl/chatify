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
      className="px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="app-card mb-3 p-3 sm:p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="h-11 w-11 overflow-hidden rounded-full sm:h-12 sm:w-12"
              style={{ border: '2px solid var(--border)' }}
            >
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full"
              style={{
                backgroundColor: 'var(--online)',
                border: '2px solid var(--bg-surface)',
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="app-kicker mb-1">Your profile</p>
            <h3 className="truncate text-sm font-semibold sm:text-base" style={{ color: 'var(--text-primary)' }}>
              {authUser.fullName}
            </h3>
            <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
              @{authUser.username}
            </p>
          </div>

          <button
            onClick={() => setShowEditProfileModal(true)}
            className="app-secondary-button inline-flex items-center gap-2 px-3 text-sm"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
        <button
          className="app-action-button flex flex-col items-center justify-center gap-1 px-2 py-2.5"
          style={{ color: 'var(--text-secondary)' }}
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
          className="app-action-button flex flex-col items-center justify-center gap-1 px-2 py-2.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Settings</span>
        </button>

        <button
          className="app-action-button flex flex-col items-center justify-center gap-1 px-2 py-2.5"
          style={{ color: 'var(--danger)' }}
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOutIcon className="w-4 h-4" />
          <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--danger)' }}>Log out</span>
        </button>
      </div>
      </div>

      {showLogoutModal && typeof document !== "undefined"
        ? createPortal(
            <div
              className="app-modal-backdrop z-[160]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowLogoutModal(false);
              }}
            >
              <div
                className="app-modal-panel w-full max-w-sm p-6 animate-fade-in-up"
              >
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Log out
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to log out? You will need to sign back in to access your chats.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    className="app-secondary-button px-4 text-sm font-medium"
                    onClick={() => setShowLogoutModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="app-primary-button flex items-center gap-2 px-4 text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #E05F5F, #C94D4D)' }}
                    onClick={() => {
                      setShowLogoutModal(false);
                      logout();
                    }}
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
