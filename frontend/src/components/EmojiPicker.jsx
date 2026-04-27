import { useState, useRef, useEffect } from "react";
import EmojiPickerLib from "emoji-picker-react";
import { SmileIcon, XIcon } from "lucide-react";

function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="emoji-picker-toggle rounded-full p-3 transition-colors flex-shrink-0"
        style={{
          backgroundColor: "var(--app-shell-input-bg)",
          color: isOpen ? "var(--primary)" : "var(--text-muted)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-focus)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
        title="Emoji"
      >
        {isOpen ? (
          <XIcon className="w-[18px] h-[18px]" />
        ) : (
          <SmileIcon className="w-[18px] h-[18px]" />
        )}
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="emoji-picker-popover animate-fade-in-up"
        >
          <EmojiPickerLib
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji);
            }}
            theme="dark"
            width="100%"
            height={360}
            searchPlaceHolder="Search emojis..."
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={false}
            lazyLoadEmojis={true}
          />
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
