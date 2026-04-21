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
        backgroundColor: 'var(--app-shell-header-bg)',
      }}
    >
      {imagePreview && (
        <div className="mx-auto mb-3 flex max-w-3xl items-center">
          <div className="app-card relative p-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-16 object-cover"
              style={{
                borderRadius: 'var(--radius-md)',
              }}
            />
            <button
              onClick={removeImage}
              className="app-icon-button absolute -right-2 -top-2 h-7 min-h-0 w-7 min-w-0 rounded-full"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
              }}
              type="button"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="mx-auto flex max-w-3xl items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="app-input-field min-w-0 flex-1 rounded-full px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--app-shell-input-bg)',
            color: 'var(--text-primary)',
          }}
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
          className="app-icon-button flex-shrink-0 rounded-full"
          style={{
            backgroundColor: 'var(--app-shell-input-bg)',
            color: imagePreview ? 'var(--primary)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
          title="Attach image"
        >
          <ImageIcon className="w-[18px] h-[18px]" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="app-primary-button flex-shrink-0 rounded-full p-3 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <SendIcon className="w-[18px] h-[18px]" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
