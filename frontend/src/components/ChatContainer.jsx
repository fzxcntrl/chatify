import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import AudioPlayer from "./AudioPlayer";
import ReactionBar, { ReactionBadges } from "./ReactionBar";
import {
  XIcon,
  DownloadIcon,
  CheckIcon,
  CheckCheckIcon,
  PencilIcon,
  Trash2Icon,
  MicIcon,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import EditMessageModal from "./EditMessageModal";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    markMessagesAsRead,
    updateMessage,
    deleteMessage,
    toggleReaction,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeMessageActionId, setActiveMessageActionId] = useState(null);
  const [reactionMessageId, setReactionMessageId] = useState(null);
  const [messageBeingEdited, setMessageBeingEdited] = useState(null);
  const [messageBeingDeleted, setMessageBeingDeleted] = useState(null);
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Long press handling for mobile
  const longPressTimerRef = useRef(null);
  const longPressMessageIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadChat = async () => {
      await getMessagesByUserId(selectedUser._id);
      if (isMounted) {
        await markMessagesAsRead(selectedUser._id);
      }
    };

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [selectedUser, getMessagesByUserId, markMessagesAsRead]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleReaction = async (messageId, emoji) => {
    setReactionMessageId(null);
    await toggleReaction(messageId, emoji);
  };

  const handleLongPressStart = (msgId) => {
    longPressMessageIdRef.current = msgId;
    longPressTimerRef.current = setTimeout(() => {
      setReactionMessageId(msgId);
      setActiveMessageActionId(null);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const renderMessageStatus = (message) => {
    if (message.isOptimistic) {
      return <span className="text-[10px]">Sending...</span>;
    }

    if (message.readAt) {
      return <CheckCheckIcon className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} />;
    }

    if (message.deliveredAt) {
      return <CheckCheckIcon className="w-3.5 h-3.5" />;
    }

    return <CheckIcon className="w-3.5 h-3.5" />;
  };

  const isSameCalendarDay = (leftDate, rightDate) =>
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate();

  const getMessageDayLabel = (value) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const fullDateLabel = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (isSameCalendarDay(date, today)) {
      return `Today | ${fullDateLabel}`;
    }

    if (isSameCalendarDay(date, yesterday)) {
      return `Yesterday | ${fullDateLabel}`;
    }

    return fullDateLabel;
  };

  return (
    <>
      <ChatHeader />
      <div
        className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-6 md:py-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.04) 100%)",
        }}
        onClick={() => {
          setReactionMessageId(null);
          setActiveMessageActionId(null);
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-75"
          style={{
            background: 'var(--app-shell-chat-overlay)',
          }}
        />

        {messages.length > 0 && !isMessagesLoading ? (
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            {messages.map((msg, index) => {
              const isSent = msg.senderId === authUser._id;
              const canEdit = isSent && Boolean(msg.text) && !msg.isOptimistic;
              const canDelete = isSent && !msg.isOptimistic;
              const isActionPanelOpen = activeMessageActionId === msg._id;
              const isReactionBarOpen = reactionMessageId === msg._id;
              const previousMessage = messages[index - 1];
              const shouldShowDaySeparator =
                !previousMessage ||
                !isSameCalendarDay(new Date(previousMessage.createdAt), new Date(msg.createdAt));

              return (
                <div key={msg._id} className="space-y-3">
                  {shouldShowDaySeparator && (
                    <div className="flex justify-center animate-fade-in">
                      <div
                        className="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        {getMessageDayLabel(msg.createdAt)}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className="relative max-w-[85%] sm:max-w-[78%] md:max-w-[65%] message-bubble-wrap">
                      {/* Reaction bar — appears above the bubble */}
                      {isReactionBarOpen && (
                        <div
                          className={`absolute z-50 ${isSent ? 'right-0' : 'left-0'}`}
                          style={{ bottom: "100%", marginBottom: "6px" }}
                        >
                          <ReactionBar
                            onReact={handleReaction}
                            existingReactions={msg.reactions}
                            currentUserId={authUser._id}
                            messageId={msg._id}
                          />
                        </div>
                      )}

                      <div
                        className="message-bubble"
                        style={{
                          backgroundColor: isSent ? 'var(--bubble-sent)' : 'var(--bubble-received)',
                          color: isSent ? 'var(--bubble-sent-text)' : 'var(--bubble-received-text)',
                          borderRadius: isSent
                            ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                            : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
                          padding: '10px 14px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSent && (canEdit || canDelete)) {
                            setActiveMessageActionId((current) => (current === msg._id ? null : msg._id));
                            setReactionMessageId(null);
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (!msg.isOptimistic) {
                            setReactionMessageId((current) => (current === msg._id ? null : msg._id));
                            setActiveMessageActionId(null);
                          }
                        }}
                        onTouchStart={() => handleLongPressStart(msg._id)}
                        onTouchEnd={handleLongPressEnd}
                        onTouchMove={handleLongPressEnd}
                      >
                        {msg.image && (
                          <div className="relative group mb-2">
                            <img
                              src={msg.image}
                              alt="Shared"
                              className="rounded-lg w-full max-h-52 object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                              style={{ borderRadius: 'var(--radius-md)' }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewImage(msg.image);
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(msg.image, `chatify-image-${msg._id}.jpg`);
                              }}
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                              title="Download"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {msg.audio && (
                          <div className="mb-1">
                            <AudioPlayer
                              src={msg.audio}
                              duration={msg.audioDuration}
                              isSent={isSent}
                            />
                          </div>
                        )}

                        {!msg.text && msg.audio && (
                          <div className="flex items-center gap-1.5 mb-0.5" style={{ opacity: 0.7 }}>
                            <MicIcon className="w-3 h-3" />
                            <span className="text-[11px] font-medium">Voice note</span>
                          </div>
                        )}

                        {msg.text && (
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        )}
                        <div
                          className="mt-1.5 flex items-center justify-end gap-1.5 text-[11px]"
                          style={{ opacity: isSent ? 0.7 : 0.5 }}
                        >
                          {msg.editedAt && <span className="text-[10px]">edited</span>}
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isSent && renderMessageStatus(msg)}
                        </div>

                        {isActionPanelOpen && (canEdit || canDelete) && (
                          <div
                            className="mt-3 flex items-center justify-end gap-2 border-t pt-3"
                            style={{ borderColor: "rgba(255,255,255,0.15)" }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {canEdit && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.16)",
                                  color: "inherit",
                                }}
                                onClick={() => {
                                  setActiveMessageActionId(null);
                                  setMessageBeingEdited(msg);
                                }}
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                                style={{
                                  backgroundColor: "rgba(220,38,38,0.15)",
                                  color: "#FCA5A5",
                                }}
                                onClick={() => {
                                  setActiveMessageActionId(null);
                                  setMessageBeingDeleted(msg);
                                }}
                              >
                                <Trash2Icon className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reaction badges below the bubble */}
                      <ReactionBadges
                        reactions={msg.reactions}
                        currentUserId={authUser._id}
                        onReact={handleReaction}
                        messageId={msg._id}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <div className="relative z-10">
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          </div>
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
          >
            <XIcon className="w-6 h-6" />
          </button>
          <button
            className="absolute top-4 left-4 p-2 rounded-full transition-colors z-10 flex items-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(previewImage, `chatify-image.jpg`);
            }}
          >
            <DownloadIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Download</span>
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {messageBeingEdited && (
        <EditMessageModal
          message={messageBeingEdited}
          isSaving={isUpdatingMessage}
          onClose={() => {
            if (!isUpdatingMessage) {
              setMessageBeingEdited(null);
            }
          }}
          onSave={async (nextText) => {
            setIsUpdatingMessage(true);
            const didUpdate = await updateMessage(messageBeingEdited._id, nextText);
            setIsUpdatingMessage(false);
            if (didUpdate) {
              setMessageBeingEdited(null);
            }
          }}
        />
      )}

      {messageBeingDeleted && (
        <ConfirmationModal
          title="Delete This Message?"
          description="This will permanently remove the selected message from the chat."
          confirmLabel="Delete Message"
          onClose={() => {
            if (!isDeletingMessage) {
              setMessageBeingDeleted(null);
            }
          }}
          onConfirm={async () => {
            setIsDeletingMessage(true);
            const didDelete = await deleteMessage(messageBeingDeleted._id);
            setIsDeletingMessage(false);
            if (didDelete) {
              setMessageBeingDeleted(null);
            }
          }}
          isLoading={isDeletingMessage}
        />
      )}
    </>
  );
}

export default ChatContainer;
