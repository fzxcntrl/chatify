import { AlertTriangleIcon, LoaderIcon, XIcon } from "lucide-react";

function ConfirmationModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClose,
  onConfirm,
  isLoading = false,
  tone = "danger",
  inputLabel,
  inputPlaceholder,
  inputValue = "",
  onInputChange,
  requiredConfirmationValue,
}) {
  const isDanger = tone === "danger";
  const isConfirmDisabled =
    isLoading ||
    (requiredConfirmationValue !== undefined &&
      inputValue.trim().toLowerCase() !== requiredConfirmationValue.trim().toLowerCase());

  return (
    <div
      className="app-modal-backdrop z-[130]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="app-modal-panel no-glass w-full max-w-md p-0 overflow-hidden animate-fade-in-up">
        <div
          className="flex items-start justify-between gap-4 p-5 border-b"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDanger ? "rgba(220, 38, 38, 0.12)" : "var(--primary-muted)",
                color: isDanger ? "var(--danger)" : "var(--primary)",
              }}
            >
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </h2>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="app-icon-button" disabled={isLoading}>
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {(inputLabel || inputPlaceholder) && (
          <div className="px-5 pt-5">
            {inputLabel && (
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {inputLabel}
              </label>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(event) => onInputChange?.(event.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                outline: "none",
              }}
            />
            {requiredConfirmationValue !== undefined && (
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Type <span className="font-semibold">{requiredConfirmationValue}</span> to continue.
              </p>
            )}
          </div>
        )}

        <div
          className="flex items-center justify-end gap-3 px-5 py-5 mt-5 border-t"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="app-secondary-button rounded-full px-4 py-2 text-sm"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDanger ? "var(--danger)" : "var(--primary)",
              color: "white",
            }}
          >
            {isLoading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
