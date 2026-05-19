import { lazy, Suspense } from "react";
import { useChatStore } from "../store/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import IncomingRequestsList from "../components/IncomingRequestsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import PageLoader from "../components/PageLoader";

const MapTrackerModal = lazy(() => import("../components/MapTrackerModal"));
const SettingsModal = lazy(() => import("../components/SettingsModal"));
const EditProfileModal = lazy(() => import("../components/EditProfileModal"));

function ChatPage() {
  const {
    activeTab,
    selectedUser,
  } = useChatStore();

  return (
    <div className="flex h-full w-full overflow-hidden animate-fade-in bg-transparent">
      {/* Left List Panel */}
      <div
        className={`${
          selectedUser ? 'hidden md:flex' : 'flex'
        } relative z-10 w-full md:w-[360px] lg:w-[380px] flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--app-shell-sidebar-bg)] backdrop-blur-xl`}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Messages</h2>
          <ActiveTabSwitch />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2 space-y-1">
          {activeTab === "chats" && <ChatsList />}
          {activeTab === "contacts" && <ContactList />}
          {activeTab === "requests" && <IncomingRequestsList />}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div
        className={`${
          selectedUser ? 'flex' : 'hidden md:flex'
        } relative z-10 flex-1 flex-col min-w-0 bg-[var(--app-shell-panel-bg)] backdrop-blur-xl`}
      >
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </div>
    </div>
  );
}
export default ChatPage;
