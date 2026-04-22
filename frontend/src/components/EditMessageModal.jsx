import { LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

function EditMessageModal({ message, onClose, onSave, isSaving }) {
  const [text, setText] = useState(message?.text || "");

  useEffect(() => {
    setText(message?.text || "");
  }, [message]);

  return (
    <div
      className="app-modal-backdrop z-[130]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div className="app-modal-panel no-glass w-full max-w-lg p-0 overflow-hidden animate-fade-in-up">
        <div
          className="flex items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--primary-muted)", color: "var(--primary)" }}
            >
              <PencilIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Edit Message
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Update the text for this message.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="app-icon-button" disabled={isSaving}>
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            autoFocus
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              outline: "none",
            }}
            placeholder="Edit your message..."
          />
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Message text only. Images stay unchanged.
          </p>
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-5 py-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="app-secondary-button rounded-full px-4 py-2 text-sm"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(text)}
            disabled={isSaving || !text.trim()}
            className="app-primary-button rounded-full px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMessageModal;
