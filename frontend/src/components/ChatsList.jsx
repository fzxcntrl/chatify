import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        const isSelected = selectedUser?._id === chat._id;

        return (
          <button
            key={chat._id}
            className={`app-list-item flex items-center gap-3 p-3 text-left sm:p-3.5 ${
              isSelected ? "app-list-item--active" : ""
            }`}
            style={{
              backgroundColor: isSelected ? "var(--primary-muted)" : undefined,
            }}
            onClick={() => setSelectedUser(chat)}
          >
            <div className="relative flex-shrink-0">
              <div
                className="h-11 w-11 overflow-hidden rounded-full"
                style={{ border: '1px solid var(--border)' }}
              >
                <img
                  src={chat.profilePic || "/avatar.png"}
                  alt={chat.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOnline && (
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--online)',
                    border: '2px solid var(--bg-surface)',
                  }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h4
                  className="text-sm font-medium truncate"
                  style={{ color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}
                >
                {chat.fullName}
                </h4>
                <span
                  className="hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline-flex"
                  style={{
                    backgroundColor: isOnline ? "rgba(107, 203, 119, 0.14)" : "var(--bg-hover)",
                    color: isOnline ? "var(--online)" : "var(--text-muted)",
                  }}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] truncate">
                <span style={{ color: 'var(--text-muted)' }}>@{chat.username}</span>
                <span style={{ color: 'var(--border)' }}>•</span>
                <span style={{ color: isOnline ? 'var(--online)' : 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}
export default ChatsList;
