import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div
      className="mx-3 mt-3 flex p-1"
      style={{
        backgroundColor: 'var(--bg-base)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <button
        onClick={() => setActiveTab("chats")}
        className="flex-1 py-2 text-sm font-medium transition-all"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeTab === "chats" ? 'var(--bg-elevated)' : 'transparent',
          color: activeTab === "chats" ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: activeTab === "chats" ? 'var(--shadow-sm)' : 'none',
        }}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className="flex-1 py-2 text-sm font-medium transition-all"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeTab === "contacts" ? 'var(--bg-elevated)' : 'transparent',
          color: activeTab === "contacts" ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: activeTab === "contacts" ? 'var(--shadow-sm)' : 'none',
        }}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
