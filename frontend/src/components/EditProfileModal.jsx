import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { CameraIcon, UploadIcon, TrashIcon, LoaderIcon, XIcon, PencilIcon } from "lucide-react";

function EditProfileModal({ onClose }) {
  const { authUser, updateProfile } = useAuthStore();

  const [editUsername, setEditUsername] = useState(authUser?.username || "");
  const [editBio, setEditBio] = useState(authUser?.bio || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const avatarInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setIsUpdatingProfile(true);
      await updateProfile({ profilePic: reader.result });
      setIsUpdatingProfile(false);
      setShowAvatarMenu(false);
    };
  };

  const handleRemovePhoto = async () => {
    setIsUpdatingProfile(true);
    await updateProfile({ profilePic: "" });
    setIsUpdatingProfile(false);
    setShowAvatarMenu(false);
  };

  const handleSaveProfileInfo = async () => {
    if (editUsername === authUser?.username && editBio === authUser?.bio) return;
    if (!editUsername) return;
    setIsUpdatingProfile(true);
    await updateProfile({ username: editUsername, bio: editBio });
    setIsUpdatingProfile(false);
  };

  const hasChanges = editUsername !== authUser?.username || editBio !== authUser?.bio;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div
                className="w-24 h-24 rounded-full overflow-hidden"
                style={{ border: '3px solid var(--border)' }}
              >
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="User"
                  className="w-full h-full object-cover"
                />
                {isUpdatingProfile && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <LoaderIcon className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                disabled={isUpdatingProfile}
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>

            {showAvatarMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAvatarMenu(false)}
                />
                <div
                  className="relative z-50 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden animate-fade-in-up"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <button
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => { avatarInputRef.current?.click(); setShowAvatarMenu(false); }}
                  >
                    <UploadIcon className="w-4 h-4" /> Upload Photo
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border)' }}
                    onClick={() => { cameraInputRef.current?.click(); setShowAvatarMenu(false); }}
                  >
                    <CameraIcon className="w-4 h-4" /> Take Picture
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors hover:bg-red-500/10"
                    style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}
                    onClick={handleRemovePhoto}
                  >
                    <TrashIcon className="w-4 h-4" /> Remove Photo
                  </button>
                </div>
              </>
            )}

            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
            <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              className="w-full py-2.5 px-3 text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="john_doe"
              maxLength={30}
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>3-30 characters. Lowercase letters, numbers, underscores and periods only.</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value.slice(0, 150))}
              className="w-full py-2.5 px-3 text-sm transition-all resize-none h-20"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="Tell us about yourself..."
            />
            <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{editBio.length}/150</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfileInfo}
            disabled={isUpdatingProfile || !hasChanges}
            className="px-5 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {isUpdatingProfile ? <LoaderIcon className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
