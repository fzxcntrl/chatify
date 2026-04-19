import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, PaperclipIcon, FileTextIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null); // "image" or "pdf"

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: filePreview,
    });
    setText("");
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      toast.error("Please select an image or PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setFileType(isImage ? "image" : "pdf");

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="p-3 md:p-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {filePreview && (
        <div className="max-w-2xl mx-auto mb-3 flex items-center">
          <div className="relative">
            {fileType === "image" ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              />
            ) : (
              <div
                className="w-16 h-16 flex flex-col items-center justify-center gap-1"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-hover)',
                }}
              >
                <FileTextIcon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>PDF</span>
              </div>
            )}
            <button
              onClick={removeFile}
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
          className="flex-1 py-2.5 px-4 text-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          placeholder="Type a message..."
        />

        <input
          type="file"
          accept="image/*,application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-lg transition-colors flex-shrink-0"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: filePreview ? 'var(--primary)' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          title="Attach image or PDF"
        >
          <PaperclipIcon className="w-[18px] h-[18px]" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !filePreview}
          className="p-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
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
