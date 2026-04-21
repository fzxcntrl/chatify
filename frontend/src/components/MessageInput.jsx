import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:p-4"
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'rgba(10, 15, 23, 0.46)',
      }}
    >
      {imagePreview && (
        <div className="max-w-2xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 object-cover"
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
              type="button"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="min-w-0 flex-1 rounded-full py-3 px-4 text-sm transition-all"
          style={{
            backgroundColor: 'rgba(18, 24, 37, 0.76)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          placeholder="Type a message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full p-3 transition-colors flex-shrink-0"
          style={{
            backgroundColor: 'rgba(18, 24, 37, 0.76)',
            color: imagePreview ? 'var(--primary)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          title="Attach image"
        >
          <ImageIcon className="w-[18px] h-[18px]" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="rounded-full p-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-inverse)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
          }}
        >
          <SendIcon className="w-[18px] h-[18px]" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
