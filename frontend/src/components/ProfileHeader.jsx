import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, SettingsIcon, LoaderIcon, CheckIcon, CameraIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound, setShowSettingsModal } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div
      className="p-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="w-11 h-11 rounded-full overflow-hidden relative cursor-default"
              style={{ border: '2px solid var(--border)' }}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="w-full h-full object-cover"
              />

            </button>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
              style={{
                backgroundColor: 'var(--online)',
                border: '2px solid var(--bg-surface)',
              }}
            />

          </div>
          <div>
            <h3 className="font-medium text-sm max-w-[150px] truncate" style={{ color: 'var(--text-primary)' }}>
              {authUser.fullName}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              @{authUser.username}
            </p>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <Link
            to="/browse"
            className="p-1.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors border border-transparent"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <SearchIcon className="w-[18px] h-[18px]" />
            <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Find</span>
          </Link>
          <button
            className="p-1.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors border border-transparent"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch(() => {});
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="w-[18px] h-[18px]" />
            ) : (
              <VolumeOffIcon className="w-[18px] h-[18px]" />
            )}
            <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Sound</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors border border-transparent"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
            <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Settings</span>
          </button>
          <button
            className="p-1.5 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors border border-transparent"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOutIcon className="w-[18px] h-[18px]" />
            <span className="text-[10px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>Log Out</span>
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[100] p-4" 
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up"
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
        </div>
      )}
    </div>
  );
}
export default ProfileHeader;
