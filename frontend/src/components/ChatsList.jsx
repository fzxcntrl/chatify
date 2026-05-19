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
  const { onlineUsers, authUser } = useAuthStore();
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const formatPreviewText = (chat) => {
    if (!chat.lastMessage) return "Start chatting";

    const senderPrefix = chat.lastMessage.senderId === authUser?._id ? "You: " : "";

    if (chat.lastMessage.audio && !chat.lastMessage.text) {
      return `${senderPrefix}🎤 Voice note`;
    }

    if (chat.lastMessage.image && !chat.lastMessage.text) {
      return `${senderPrefix}sent a photo`;
    }

    return `${senderPrefix}${chat.lastMessage.text || "New message"}`;
  };

  const formatChatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

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
              onClick={() => isSelected ? setSelectedUser(null) : setSelectedUser(chat)}
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
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className="min-w-0 flex-1 truncate text-sm font-medium"
                    style={{ color: isSelected ? "var(--primary)" : "var(--text-primary)" }}
                  >
                    {chat.fullName}
                  </h4>
                  <span
                    className="flex-shrink-0 text-[10px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatChatTime(chat.lastMessageAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                  <span
                    className="min-w-0 flex-1 truncate"
                    style={{ color: chat.unreadCount > 0 ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {formatPreviewText(chat)}
                  </span>
                  {chat.unreadCount > 0 ? (
                    <span
                      className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: "var(--danger)",
                        color: "#FFFFFF",
                        boxShadow: "0 2px 6px rgba(224, 95, 95, 0.4)",
                      }}
                    >
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </span>
                  ) : (
                    <>
                      <span style={{ color: "var(--border)" }}>•</span>
                      <span style={{ color: isOnline ? "var(--online)" : "var(--text-muted)" }}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </>
                  )}
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
                      Remove from my profile
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
          title="Remove This Chat?"
          description={`This will remove the chat from your profile only. ${chatToDelete.fullName} will still keep their messages.`}
          confirmLabel="Remove Chat"
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
