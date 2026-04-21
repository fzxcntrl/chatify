import { useState, useEffect } from "react";
import { XIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

function UserProfileModal({ user, onClose }) {
  const { onlineUsers } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const isOnline = onlineUsers.includes(user._id);
  const [contacts, setContacts] = useState([]);
  const [contactCount, setContactCount] = useState(0);
  const [showContacts, setShowContacts] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    // Fetch the user's public profile to get contact count
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/friends/profile/${user._id}`);
        setContactCount(res.data.contactCount);
      } catch {
        setContactCount(0);
      }
    };
    fetchProfile();
  }, [user._id]);

  const handleShowContacts = async () => {
    if (showContacts) {
      setShowContacts(false);
      return;
    }
    setIsLoadingContacts(true);
    try {
      const res = await axiosInstance.get(`/friends/profile/${user._id}/contacts`);
      setContacts(res.data);
      setShowContacts(true);
    } catch {
      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleMessage = () => {
    setSelectedUser(user);
    onClose();
  };

  return (
    <div
      className="app-modal-backdrop z-[100]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="app-modal-panel no-glass w-full max-w-sm overflow-hidden animate-fade-in-up"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        {/* Header with close */}
        <div className="relative flex justify-end p-3">
          <button
            onClick={onClose}
            className="app-icon-button"
            style={{ color: 'var(--text-secondary)' }}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center pb-6 px-6 -mt-2">
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full overflow-hidden"
              style={{ border: '3px solid var(--border)' }}
            >
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full"
              style={{
                backgroundColor: isOnline ? 'var(--online)' : 'var(--offline)',
                border: '2.5px solid var(--bg-base)',
              }}
            />
          </div>

          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {user.fullName}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            @{user.username}
          </p>

          {user.bio && (
            <p
              className="text-sm text-center mt-3 px-4 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {user.bio}
            </p>
          )}

          {/* Contact Count */}
          <button
            onClick={handleShowContacts}
            className="app-secondary-button mt-4 flex items-center gap-2 px-4"
            style={{
              backgroundColor: showContacts ? 'var(--primary-muted)' : 'var(--bg-hover)',
              color: showContacts ? 'var(--primary)' : 'var(--text-primary)',
            }}
          >
            <UsersIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{contactCount} {contactCount === 1 ? "Contact" : "Contacts"}</span>
          </button>

          {/* Message button */}
          <button
            onClick={handleMessage}
            className="app-primary-button mt-3 flex items-center gap-2 px-6 text-sm font-medium"
          >
            <MessageCircleIcon className="w-4 h-4" />
            Message
          </button>
        </div>

        {/* Contacts List (Expandable) */}
        {showContacts && (
          <div
            className="border-t max-h-60 overflow-y-auto animate-fade-in"
            style={{ borderColor: 'var(--border)' }}
          >
            {isLoadingContacts ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : contacts.length > 0 ? (
              <div className="p-3 space-y-1">
                {contacts.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                      <img src={c.profilePic || "/avatar.png"} alt={c.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.fullName}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>@{c.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>No contacts yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfileModal;
