import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, requestCount, unreadChatCount } = useChatStore();
  const navigate = useNavigate();

  const tabs = [
    { id: "chats", label: "Chats", badge: unreadChatCount, action: () => { setActiveTab("chats"); } },
    { id: "requests", label: "Requests", badge: requestCount, action: () => setActiveTab("requests") },
    { id: "browse", label: "Browse", badge: 0, action: () => navigate('/browse') },
    { id: "contacts", label: "Contacts", badge: 0, action: () => setActiveTab("contacts") },
  ];

  return (
    <div
      className="mx-3 mt-1 grid grid-cols-4 gap-1 rounded-2xl p-1.5 sm:mx-4"
      style={{
        backgroundColor: 'var(--app-shell-tab-bg)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === "browse" ? false : activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              tab.action();
              // Clear unread chat count when switching to chats
              if (tab.id === "chats") useChatStore.setState({ unreadChatCount: 0 });
            }}
            className={`app-tab-button relative min-w-0 px-1 py-2 text-[11px] font-medium sm:text-xs ${
              isActive ? "app-tab-button--active" : ""
            }`}
            style={{
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {tab.label}

            {/* Badge */}
            {tab.badge > 0 && (
              <span
                className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 animate-fade-in"
                style={{
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  boxShadow: '0 2px 6px rgba(224, 95, 95, 0.4)',
                }}
              >
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
export default ActiveTabSwitch;
