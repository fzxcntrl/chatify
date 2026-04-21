import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-fade-in">
      <div
        className="w-12 h-12 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--primary-muted)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V13.5C20 14.8807 18.8807 16 17.5 16H10.5L6 20V16H6.5C5.11929 16 4 14.8807 4 13.5V6.5Z"
            fill="var(--primary)"
            opacity="0.6"
          />
        </svg>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          No conversations yet
        </h4>
        <p className="text-xs px-4" style={{ color: 'var(--text-secondary)' }}>
          Start chatting by selecting a contact
        </p>
      </div>

      <button
        onClick={() => setActiveTab("contacts")}
        className="app-secondary-button px-4 text-xs font-medium"
        style={{ color: "var(--primary)", borderColor: "rgba(224,122,95,0.18)" }}
      >
        Browse contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
