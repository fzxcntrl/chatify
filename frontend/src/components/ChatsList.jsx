import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, deleteConversation } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

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
          <div
            key={chat._id}
            className="w-full flex items-center gap-2 rounded-lg p-2 transition-all"
            style={{
              backgroundColor: isSelected ? "var(--primary-muted)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <button
              className="min-w-0 flex flex-1 items-center gap-3 rounded-lg p-1 text-left"
              onClick={() => setSelectedUser(chat)}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
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
                      backgroundColor: "var(--online)",
                      border: "2px solid var(--bg-surface)",
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-medium truncate"
                  style={{ color: isSelected ? "var(--primary)" : "var(--text-primary)" }}
                >
                  {chat.fullName}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] truncate">
                  <span style={{ color: "var(--text-muted)" }}>@{chat.username}</span>
                  <span style={{ color: "var(--border)" }}>•</span>
                  <span style={{ color: isOnline ? "var(--online)" : "var(--text-muted)" }}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </button>

            <div className="relative flex-shrink-0">
              <button
                type="button"
                className="app-icon-button"
                style={{ color: menuOpenFor === chat._id ? "var(--primary)" : "var(--text-secondary)" }}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpenFor((current) => (current === chat._id ? null : chat._id));
                }}
                title="Chat actions"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </button>

              {menuOpenFor === chat._id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpenFor(null)} />
                  <div className="app-card absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden animate-fade-in-up">
                    <button
                      type="button"
                      className="app-action-button flex w-full items-center gap-2 rounded-none px-4 py-3 text-left text-sm"
                      style={{ color: "var(--danger)" }}
                      onClick={() => {
                        setMenuOpenFor(null);
                        setChatToDelete(chat);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Delete whole chat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {chatToDelete && (
        <ConfirmationModal
          title="Delete This Chat?"
          description={`This will permanently delete your full conversation with ${chatToDelete.fullName}.`}
          confirmLabel="Delete Chat"
          onClose={() => {
            if (!isDeletingChat) {
              setChatToDelete(null);
            }
          }}
          onConfirm={async () => {
            setIsDeletingChat(true);
            const didDelete = await deleteConversation(chatToDelete);
            setIsDeletingChat(false);
            if (didDelete) {
              setChatToDelete(null);
            }
          }}
          isLoading={isDeletingChat}
        />
      )}
    </>
  );
}
export default ChatsList;
