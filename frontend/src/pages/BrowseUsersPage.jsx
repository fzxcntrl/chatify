import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { SearchIcon, UserPlusIcon, CheckIcon, XIcon, ArrowLeftIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function BrowseUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { authUser } = useAuthStore();
  const { getAllContacts } = useChatStore();
  const {
    searchResults,
    incomingRequests,
    searchUsers,
    getIncomingRequests,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    isSearching,
    isFetchingRequests
  } = useFriendStore();

  useEffect(() => {
    getIncomingRequests();
  }, [getIncomingRequests]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const handleAccept = async (reqId) => {
    await acceptRequest(reqId);
    // Refresh the contacts list locally so the new friend pops up when they go back
    getAllContacts();
  };

  return (
    <div className="min-h-screen p-4 flex justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div 
        className="w-full max-w-4xl flex flex-col md:flex-row gap-6 animate-fade-in"
        style={{ height: 'calc(100vh - 2rem)', maxHeight: '860px' }}
      >
        {/* Left Column: Search */}
        <div 
          className="w-full md:w-2/3 flex flex-col overflow-hidden"
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
                No users found matching "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                Type a username above to start searching.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Incoming Requests */}
        <div 
          className="w-full md:w-1/3 flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Incoming Requests</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {incomingRequests.length} pending
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isFetchingRequests ? (
               <div className="flex justify-center p-6"><LoaderIcon className="w-6 h-6 animate-spin text-[var(--primary)]" /></div>
            ) : incomingRequests.length > 0 ? (
              incomingRequests.map((req) => (
                <div 
                  key={req._id}
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <img src={req.sender.profilePic || "/avatar.png"} alt={req.sender.username} className="w-10 h-10 rounded-full object-cover border border-[var(--border)]" />
                    <div>
                      <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{req.sender.fullName}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{req.sender.username}</p>
                    </div>
                  </div>
                  {req.sender.bio && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">"{req.sender.bio}"</p>
                  )}
                  <div className="flex gap-2 w-full mt-1">
                    <button 
                      onClick={() => handleAccept(req._id)}
                      className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-[var(--online)] text-white hover:opacity-90 transition-opacity"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => declineRequest(req._id)}
                      className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-[var(--danger)] text-white hover:opacity-90 transition-opacity"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  <UserPlusIcon className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm">No new requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseUsersPage;
