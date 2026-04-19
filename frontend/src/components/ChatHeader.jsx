
import { XIcon, ArrowLeftIcon, MapPinIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, showMapTracker, setShowMapTracker } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center px-4 md:px-6 py-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <div className="relative">
          <div
            className="w-9 h-9 rounded-full overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: isOnline ? 'var(--online)' : 'var(--offline)',
              border: '2px solid var(--bg-surface)',
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {selectedUser.fullName}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
             <span style={{ color: 'var(--text-muted)' }}>@{selectedUser.username}</span>
             <span style={{ color: 'var(--border)' }}>•</span>
             <span style={{ color: isOnline ? 'var(--online)' : 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
         <button
          className="p-1.5 rounded-lg transition-colors flex items-center gap-1"
          style={{ 
            color: showMapTracker ? 'white' : 'var(--text-secondary)',
            backgroundColor: showMapTracker ? 'var(--primary)' : 'transparent' 
          }}
          onMouseEnter={(e) => {
            if (!showMapTracker) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!showMapTracker) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => setShowMapTracker(!showMapTracker)}
          title="Share Live Location"
         >
           <MapPinIcon className="w-[18px] h-[18px]" />
           {showMapTracker && <span className="text-[10px] pr-1 font-medium select-none">Tracking</span>}
         </button>

         <button
           className="hidden md:flex p-1.5 rounded-lg transition-colors"
           style={{ color: 'var(--text-secondary)' }}
           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
           onClick={() => setSelectedUser(null)}
         >
           <XIcon className="w-[18px] h-[18px]" />
         </button>
      </div>
    </div>
  );
}
export default ChatHeader;
