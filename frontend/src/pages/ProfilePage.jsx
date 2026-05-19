import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { Pencil, UserPlus, LoaderIcon, Sparkles } from "lucide-react";
import UserProfileModal from "../components/UserProfileModal";
import { useNavigate } from "react-router";

function ProfilePage() {
  const { authUser } = useAuthStore();
  const { setShowEditProfileModal, setActiveTab, allContacts } = useChatStore();
  const { suggestions, getSuggestions, isFetchingSuggestions, sendFriendRequest, acceptRequest, declineRequest } = useFriendStore();
  const [profileUser, setProfileUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSuggestions();
  }, [getSuggestions]);

  const markUserRequestState = (userId, updates) => {
    const updateUser = (user) => (user._id === userId ? { ...user, ...updates } : user);
    useFriendStore.setState({
      suggestions: useFriendStore.getState().suggestions.map(updateUser),
    });
  };

  const handleContactsClick = () => {
    setActiveTab("contacts");
    navigate("/");
  };

  const renderUserCard = (user) => (
    <div key={user._id} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-4 flex flex-col items-center text-center gap-3 relative transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <button className="absolute inset-0 z-0 rounded-xl" onClick={() => setProfileUser(user)} />
      <img src={user.profilePic || "/avatar.png"} alt={user.username} className="w-20 h-20 rounded-full object-cover border border-[var(--border)] relative z-10" />
      <div className="relative z-10 w-full px-2">
        <h4 className="font-semibold text-[var(--text-primary)] text-sm truncate">{user.username}</h4>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">{user.fullName}</p>
      </div>
      
      <div className="w-full relative z-10 mt-auto pt-2">
        {user.requestStatus === "pending" && user.isSender ? (
           <button disabled className="w-full py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] cursor-not-allowed">
             Pending
           </button>
        ) : user.requestStatus === "pending" && !user.isSender && user.requestId ? (
           <div className="flex gap-2">
             <button onClick={() => { acceptRequest(user.requestId); markUserRequestState(user._id, { requestStatus: "accepted" }); }} className="flex-1 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">Accept</button>
             <button onClick={() => { declineRequest(user.requestId); markUserRequestState(user._id, { requestStatus: "declined" }); }} className="flex-1 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] text-xs font-medium hover:bg-[var(--bg-hover)] transition-colors">Decline</button>
           </div>
        ) : user.requestStatus === "accepted" ? (
           <button disabled className="w-full py-1.5 rounded-lg bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-medium">
             Friends
           </button>
        ) : (
           <button onClick={() => sendFriendRequest(user._id)} className="w-full py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
             <UserPlus className="w-3.5 h-3.5" /> Add Friend
           </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 animate-fade-in flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-[var(--border)] pb-8 pt-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[var(--border)] shrink-0">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                {authUser?.username}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-medium transition-colors text-[var(--text-primary)]"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleContactsClick}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-sm font-medium transition-colors text-[var(--text-primary)]"
                >
                  <span className="font-semibold">{allContacts.length > 0 ? allContacts.length : (authUser?.friends?.length || 0)}</span>
                  Contacts
                </button>
              </div>
            </div>

            <div className="text-[var(--text-primary)]">
              <p className="font-semibold mb-1">{authUser?.fullName}</p>
              <p className="whitespace-pre-wrap max-w-lg text-sm text-[var(--text-secondary)]">
                {authUser?.bio || "Available"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-0 flex justify-center border-t border-[var(--border)] -mt-[1px]">
          <div className="border-t border-[var(--text-primary)] pt-4 -mt-[1px] inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[var(--text-primary)] uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Account Suggestions
          </div>
        </div>

        <div className="mt-6">
          {isFetchingSuggestions ? (
            <div className="flex justify-center items-center h-32">
              <LoaderIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {suggestions.map(renderUserCard)}
            </div>
          ) : (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              No suggestions available right now.
            </div>
          )}
        </div>
      </div>

      {profileUser && (
        <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
}

export default ProfilePage;
