import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { CameraIcon, UploadIcon, TrashIcon, LoaderIcon, XIcon, PencilIcon } from "lucide-react";

function EditProfileModal({ onClose }) {
  const { authUser, updateProfile } = useAuthStore();

  const [editUsername, setEditUsername] = useState(authUser?.username || "");
  const [editBio, setEditBio] = useState(authUser?.bio || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const avatarInputRef = useRef(null);
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
      className="app-modal-backdrop z-[100]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="app-modal-panel w-full max-w-md overflow-hidden animate-fade-in-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <PencilIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button"
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
                className="app-icon-button absolute bottom-0 right-0 rounded-full shadow-lg"
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
                  className="app-card relative z-50 mt-2 w-56 overflow-hidden animate-fade-in-up"
                >
                  <button
                    className="app-action-button flex w-full items-center gap-2 rounded-none px-4 py-3 text-left text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => { avatarInputRef.current?.click(); setShowAvatarMenu(false); }}
                  >
                    <UploadIcon className="w-4 h-4" /> Upload Photo
                  </button>
                  <button
                    className="app-action-button flex w-full items-center gap-2 rounded-none border-t px-4 py-3 text-left text-sm"
                    style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}
                    onClick={handleRemovePhoto}
                  >
                    <TrashIcon className="w-4 h-4" /> Remove Photo
                  </button>
                </div>
              </>
            )}

            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              className="app-input-field py-2.5 px-3 text-sm"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
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
              className="app-textarea-field h-20 px-3 py-2.5 text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
              placeholder="Tell us about yourself..."
            />
            <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{editBio.length}/150</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            className="app-secondary-button px-4 text-sm font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfileInfo}
            disabled={isUpdatingProfile || !hasChanges}
            className="app-primary-button flex items-center gap-2 px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
