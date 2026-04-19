import { useState, useEffect } from "react";

import { useFriendStore } from "../store/useFriendStore";

import { SearchIcon, UserPlusIcon, ArrowLeftIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function BrowseUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    searchResults,
    searchUsers,
    sendFriendRequest,
    isSearching
  } = useFriendStore();
  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

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
          <div className="p-6 border-b border-[var(--border)] flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Find Users</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Search for friends by username</p>
            </div>
          </div>

          <div className="p-6 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search usernames..."
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

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
            {isSearching ? (
              <div className="flex justify-center items-center h-32">
                <LoaderIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)]">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {user.fullName} <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>@{user.username}</span>
                      </h4>
                      <p className="text-xs mt-0.5 line-clamp-1 max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                        {user.bio || "No bio available"}
                      </p>
                    </div>
                  </div>
                  
                  {user.requestStatus === "pending" && user.isSender ? (
                    <button disabled className="px-4 py-2 rounded-lg text-xs font-medium cursor-not-allowed" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                      Pending
                    </button>
                  ) : user.requestStatus === "pending" && !user.isSender ? (
                    <p className="text-xs text-[var(--primary)] font-medium">Requested you</p>
                  ) : (
                    <button 
                      onClick={() => sendFriendRequest(user._id)}
                      className="p-2 rounded-lg transition-transform hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                      title="Send Friend Request"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                No users found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                Type a username above to start searching.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseUsersPage;
