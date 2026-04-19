import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();
  const navigate = useNavigate();

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
        className="flex-1 py-1.5 text-xs font-medium transition-all"
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
        className="flex-1 py-1.5 text-xs font-medium transition-all"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeTab === "contacts" ? 'var(--bg-elevated)' : 'transparent',
          color: activeTab === "contacts" ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: activeTab === "contacts" ? 'var(--shadow-sm)' : 'none',
        }}
      >
        Contacts
      </button>

      <button
        onClick={() => navigate('/browse')}
        className="flex-1 py-1.5 text-xs font-medium transition-all"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          boxShadow: 'none',
        }}
      >
        Browse
      </button>

      <button
        onClick={() => setActiveTab("requests")}
        className="flex-1 py-1.5 text-xs font-medium transition-all"
        style={{
          borderRadius: 'var(--radius-sm)',
          backgroundColor: activeTab === "requests" ? 'var(--bg-elevated)' : 'transparent',
          color: activeTab === "requests" ? 'var(--primary)' : 'var(--text-muted)',
          boxShadow: activeTab === "requests" ? 'var(--shadow-sm)' : 'none',
        }}
      >
        Requests
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
