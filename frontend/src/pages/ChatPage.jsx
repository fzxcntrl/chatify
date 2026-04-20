import { useChatStore } from "../store/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import IncomingRequestsList from "../components/IncomingRequestsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import MapTrackerModal from "../components/MapTrackerModal";
import SettingsModal from "../components/SettingsModal";
import EditProfileModal from "../components/EditProfileModal";

function ChatPage() {
  const {
    activeTab,
    selectedUser,
    showMapTracker,
    setShowMapTracker,
    showSettingsModal,
    setShowSettingsModal,
    showEditProfileModal,
    setShowEditProfileModal,
  } = useChatStore();

  return (
    <div className="h-screen h-dvh flex items-center justify-center p-2 md:p-4">
      <div
        className="w-full max-w-6xl flex overflow-hidden animate-fade-in"
        style={{
          height: 'calc(100vh - 2rem)',
          maxHeight: '860px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className={`${
            selectedUser ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 flex-col flex-shrink-0`}
          style={{
            borderRight: '1px solid var(--border)',
          }}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {activeTab === "chats" && <ChatsList />}
            {activeTab === "contacts" && <ContactList />}
            {activeTab === "requests" && <IncomingRequestsList />}
          </div>
        </div>

        <div
          className={`${
            selectedUser ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col min-w-0 relative`}
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </div>

      {/* Modals rendered at page level so they overlay everything properly */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {showEditProfileModal && (
        <EditProfileModal onClose={() => setShowEditProfileModal(false)} />
      )}

      {showMapTracker && (
        <MapTrackerModal onClose={() => setShowMapTracker(false)} />
      )}
    </div>
  );
}
export default ChatPage;
