import { useState, useRef, useEffect } from "react";
import EmojiPickerLib from "emoji-picker-react";
import { PlusIcon } from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function ReactionBar({ onReact, existingReactions, currentUserId, messageId }) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowCustomPicker(false);
      }
    };

    if (showCustomPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomPicker]);

  const myReaction = existingReactions?.find(
    (r) => (r.userId?._id || r.userId)?.toString() === currentUserId
  );

  return (
    <div className="reaction-bar animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="reaction-bar-inner">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`reaction-bar-btn ${
              myReaction?.emoji === emoji ? "reaction-bar-btn--active" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onReact(messageId, emoji);
            }}
            title={emoji}
          >
            <span className="reaction-bar-emoji">{emoji}</span>
          </button>
        ))}
        <button
          type="button"
          className="reaction-bar-btn reaction-bar-btn--plus"
          onClick={(e) => {
            e.stopPropagation();
            setShowCustomPicker((v) => !v);
          }}
          title="More emojis"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {showCustomPicker && (
        <div
          ref={pickerRef}
          className="reaction-custom-picker animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <EmojiPickerLib
            onEmojiClick={(emojiData) => {
              onReact(messageId, emojiData.emoji);
              setShowCustomPicker(false);
            }}
            theme="dark"
            width={280}
            height={320}
            searchPlaceHolder="Search..."
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={true}
            lazyLoadEmojis={true}
          />
        </div>
      )}
    </div>
  );
}

export function ReactionBadges({ reactions, currentUserId, onReact, messageId }) {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { emoji: r.emoji, count: 0, hasMyReaction: false, users: [] };
    }
    acc[r.emoji].count += 1;
    const userId = (r.userId?._id || r.userId)?.toString();
    acc[r.emoji].users.push(userId);
    if (userId === currentUserId) {
      acc[r.emoji].hasMyReaction = true;
    }
    return acc;
  }, {});

  return (
    <div className="reaction-badges" onClick={(e) => e.stopPropagation()}>
      {Object.values(grouped).map(({ emoji, count, hasMyReaction }) => (
        <button
          key={emoji}
          type="button"
          className={`reaction-badge ${hasMyReaction ? "reaction-badge--mine" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onReact(messageId, emoji);
          }}
          title={`${emoji} ${count}`}
        >
          <span className="reaction-badge-emoji">{emoji}</span>
          {count > 1 && <span className="reaction-badge-count">{count}</span>}
        </button>
      ))}
    </div>
  );
}

export default ReactionBar;
