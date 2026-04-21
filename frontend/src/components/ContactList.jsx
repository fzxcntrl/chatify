import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { UserMinusIcon } from "lucide-react";

function ContactList() {
  const {
    getAllContacts,
    allContacts,
    setSelectedUser,
    isUsersLoading,
    selectedUser,
    removeContact,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [contactToRemove, setContactToRemove] = useState(null);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => {
        const isOnline = onlineUsers.includes(contact._id);
        const isSelected = selectedUser?._id === contact._id;

        return (
          <div
            key={contact._id}
            className={`app-list-item flex items-center gap-3 p-3 sm:p-3.5 ${
              isSelected ? "app-list-item--active" : ""
            }`}
            style={{
              backgroundColor: isSelected ? "var(--primary-muted)" : undefined,
            }}
          >
            <button
              type="button"
              className="flex flex-1 items-center gap-3 min-w-0 text-left"
              onClick={() => setSelectedUser(contact)}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="h-11 w-11 overflow-hidden rounded-full"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--online)',
                      border: '2px solid var(--bg-surface)',
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className="text-sm font-medium truncate"
                    style={{ color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}
                  >
                    {contact.fullName}
                  </h4>
                  <span
                    className="hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline-flex"
                    style={{
                      backgroundColor: isOnline ? "rgba(107, 203, 119, 0.14)" : "var(--bg-hover)",
                      color: isOnline ? "var(--online)" : "var(--text-muted)",
                    }}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] truncate">
                   <span style={{ color: 'var(--text-muted)' }}>@{contact.username}</span>
                   <span style={{ color: 'var(--border)' }}>•</span>
                   <span style={{ color: isOnline ? 'var(--online)' : 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="app-icon-button flex-shrink-0"
              style={{ color: 'var(--danger)', backgroundColor: "rgba(224, 95, 95, 0.08)" }}
              onClick={(e) => {
                e.stopPropagation();
                setContactToRemove(contact);
              }}
              title={`Remove ${contact.fullName}`}
            >
              <UserMinusIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {contactToRemove && (
        <div
          className="app-modal-backdrop z-[120]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setContactToRemove(null);
          }}
        >
          <div
            className="app-modal-panel w-full max-w-sm animate-fade-in-up p-6"
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Remove Contact
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Remove {contactToRemove.fullName} from your contacts? You can add them again later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="app-secondary-button px-4 text-sm font-medium"
                onClick={() => setContactToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app-primary-button px-4 text-sm font-medium"
                style={{ background: "linear-gradient(135deg, #E05F5F, #C94D4D)" }}
                onClick={async () => {
                  const didRemove = await removeContact(contactToRemove);
                  if (didRemove) {
                    setContactToRemove(null);
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default ContactList;
