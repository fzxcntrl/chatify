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
      className="app-surface flex flex-col gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
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
      <div className="flex w-full flex-shrink-0 sm:ml-3 sm:w-auto sm:justify-end">
        {user.requestStatus === "pending" && user.isSender ? (
          <button disabled className="app-secondary-button w-full px-4 text-xs font-medium cursor-not-allowed sm:w-auto">
            Pending
          </button>
        ) : user.requestStatus === "pending" && !user.isSender && user.requestId ? (
          <div className="flex w-full gap-1.5 sm:w-auto">
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
              className="app-primary-button flex-1 px-3 sm:flex-none"
              style={{ background: "linear-gradient(135deg, #6BCB77, #4FB65D)" }}
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
              className="app-secondary-button flex-1 px-3 sm:flex-none"
              style={{ color: "var(--danger)", borderColor: "rgba(224, 95, 95, 0.22)" }}
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
            className="app-primary-button w-full px-3 sm:w-auto"
            title="Send Friend Request"
          >
            <UserPlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen min-h-dvh flex justify-center p-0 md:p-4">
      <div
        className="h-dvh min-h-dvh w-full max-w-5xl animate-fade-in md:h-[calc(100dvh-2rem)] md:min-h-0 md:max-h-[900px]"
      >
        <div
          className="app-shell mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-none md:rounded-[28px]"
        >
          <div className="flex items-center gap-4 border-b border-[var(--border)] p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
            <Link to="/" className="app-icon-button text-[var(--text-secondary)]">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>Browse</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Discover people and send requests</p>
            </div>
          </div>

          <div className="p-4 pb-2 sm:p-6 sm:pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="app-input-field pl-10 pr-4 py-3 text-sm"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {!isSearchMode && !isLoading && displayUsers.length > 0 && (
            <div className="px-4 pt-3 pb-1 flex items-center gap-2 sm:px-6">
              <SparklesIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Suggested for you
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 sm:p-6 sm:pt-2">
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
