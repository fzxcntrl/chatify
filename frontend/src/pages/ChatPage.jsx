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
    <div className="min-h-screen min-h-dvh flex items-stretch justify-center p-0 sm:p-3 md:p-4">
      <div
        className="relative flex h-dvh min-h-dvh w-full overflow-hidden rounded-none animate-fade-in backdrop-blur-2xl sm:h-[calc(100dvh-1.5rem)] sm:min-h-0 sm:max-h-[860px] sm:rounded-lg md:h-[calc(100dvh-2rem)]"
        style={{
          maxWidth: '1152px',
          background: 'var(--app-shell-bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background: 'var(--app-shell-highlight)',
          }}
        />

        <div
          className={`${
            selectedUser ? 'hidden md:flex' : 'flex'
          } relative z-10 w-full md:w-80 lg:w-[340px] flex-col flex-shrink-0 border-b md:border-b-0 md:border-r`}
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--app-shell-sidebar-bg)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2 space-y-1 sm:px-4">
            {activeTab === "chats" && <ChatsList />}
            {activeTab === "contacts" && <ContactList />}
            {activeTab === "requests" && <IncomingRequestsList />}
          </div>
        </div>

        <div
          className={`${
            selectedUser ? 'flex' : 'hidden md:flex'
          } relative z-10 flex-1 flex-col min-w-0`}
          style={{
            backgroundColor: 'var(--app-shell-panel-bg)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
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
