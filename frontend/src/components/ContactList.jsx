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
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{
              backgroundColor: isSelected ? 'var(--primary-muted)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <button
              type="button"
              className="flex flex-1 items-center gap-3 min-w-0 text-left"
              onClick={() => setSelectedUser(contact)}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden"
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
                <h4
                  className="text-sm font-medium truncate"
                  style={{ color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}
                >
                  {contact.fullName}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] truncate">
                   <span style={{ color: 'var(--text-muted)' }}>@{contact.username}</span>
                   <span style={{ color: 'var(--border)' }}>•</span>
                   <span style={{ color: isOnline ? 'var(--online)' : 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="flex-shrink-0 p-2 rounded-lg transition-colors"
              style={{ color: 'var(--danger)' }}
              onClick={(e) => {
                e.stopPropagation();
                setContactToRemove(contact);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(224, 95, 95, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
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
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setContactToRemove(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-fade-in-up"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
                onClick={() => setContactToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
                style={{
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                }}
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
