import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { XIcon } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-4 md:px-6 overflow-y-auto py-6">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-2xl mx-auto space-y-3">
            {messages.map((msg) => {
              const isSent = msg.senderId === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className="max-w-[75%] md:max-w-[65%]"
                    style={{
                      backgroundColor: isSent ? 'var(--bubble-sent)' : 'var(--bubble-received)',
                      color: isSent ? 'var(--bubble-sent-text)' : 'var(--bubble-received-text)',
                      borderRadius: isSent
                        ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                        : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
                      padding: '10px 14px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg w-full max-h-52 object-cover mb-2 cursor-pointer transition-transform hover:scale-[1.02]"
                        style={{ borderRadius: 'var(--radius-md)' }}
                        onClick={() => setPreviewImage(msg.image)}
                      />
                    )}
                    {msg.text && (
                      <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    )}
                    <p
                      className="text-[11px] mt-1.5"
                      style={{ opacity: isSent ? 0.7 : 0.5 }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
            onClick={() => setPreviewImage(null)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <XIcon className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default ChatContainer;
