import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { SearchIcon, UserPlusIcon, ArrowLeftIcon, LoaderIcon, SparklesIcon, CheckIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import UserProfileModal from "../components/UserProfileModal";

function BrowseUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const {
    searchResults,
    suggestions,
    searchUsers,
    getSuggestions,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    isSearching,
    isFetchingSuggestions,
  } = useFriendStore();

  // Load suggestions on mount
  useEffect(() => {
    getSuggestions();
  }, [getSuggestions]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const isSearchMode = searchQuery.length > 0;
  const displayUsers = isSearchMode ? searchResults : suggestions;
  const isLoading = isSearchMode ? isSearching : isFetchingSuggestions;

  const renderUserCard = (user) => (
    <div
      key={user._id}
      className="flex items-center justify-between p-4 rounded-xl transition-colors"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* Clickable profile area */}
      <button
        className="flex items-center gap-4 text-left transition-opacity hover:opacity-80 min-w-0 flex-1"
        onClick={() => setProfileUser(user)}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)] flex-shrink-0">
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {user.fullName}{" "}
            <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>@{user.username}</span>
          </h4>
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {user.bio || "No bio available"}
          </p>
        </div>
      </button>

      {/* Action button */}
      <div className="flex-shrink-0 ml-3">
        {user.requestStatus === "pending" && user.isSender ? (
          <button disabled className="px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
            Pending
          </button>
        ) : user.requestStatus === "pending" && !user.isSender && user.requestId ? (
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                acceptRequest(user.requestId);
                // Update local state
                const updateUser = (u) => u._id === user._id ? { ...u, requestStatus: "accepted" } : u;
                useFriendStore.setState({
                  suggestions: useFriendStore.getState().suggestions.map(updateUser),
                  searchResults: useFriendStore.getState().searchResults.map(updateUser),
                });
              }}
              className="p-2 rounded-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--online)', color: 'white' }}
              title="Accept"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                declineRequest(user.requestId);
                const updateUser = (u) => u._id === user._id ? { ...u, requestStatus: "declined" } : u;
                useFriendStore.setState({
                  suggestions: useFriendStore.getState().suggestions.map(updateUser),
                  searchResults: useFriendStore.getState().searchResults.map(updateUser),
                });
              }}
              className="p-2 rounded-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--danger)', color: 'white' }}
              title="Decline"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : user.requestStatus === "accepted" ? (
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}>Friends</span>
        ) : user.requestStatus === "declined" ? (
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>Declined</span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); sendFriendRequest(user._id); }}
            className="p-2 rounded-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            title="Send Friend Request"
          >
            <UserPlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 flex justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div
        className="w-full max-w-4xl flex flex-col md:flex-row gap-6 animate-fade-in"
        style={{ height: 'calc(100vh - 2rem)', maxHeight: '860px' }}
      >
        <div
          className="w-full flex flex-col overflow-hidden mx-auto max-w-3xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)] flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Browse</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Discover people and send requests</p>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Section label */}
          {!isSearchMode && !isLoading && displayUsers.length > 0 && (
            <div className="px-6 pt-3 pb-1 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Suggested for you
              </span>
            </div>
          )}

          {/* Users list */}
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoaderIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            ) : displayUsers.length > 0 ? (
              displayUsers.map(renderUserCard)
            ) : isSearchMode ? (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                No users found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                No suggestions available right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile modal */}
      {profileUser && (
        <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
}

export default BrowseUsersPage;
