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
          background: 'linear-gradient(180deg, rgba(10, 15, 23, 0.84) 0%, rgba(13, 19, 30, 0.76) 100%)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(circle at 16% 18%, rgba(224, 122, 95, 0.08) 0%, transparent 24%), radial-gradient(circle at 80% 10%, rgba(130, 168, 255, 0.10) 0%, transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
          }}
        />

        <div
          className={`${
            selectedUser ? 'hidden md:flex' : 'flex'
          } relative z-10 w-full md:w-80 lg:w-[340px] flex-col flex-shrink-0 border-b md:border-b-0 md:border-r`}
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'rgba(12, 17, 27, 0.58)',
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
            backgroundColor: 'rgba(18, 24, 37, 0.48)',
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
