import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { CheckIcon, XIcon, LoaderIcon, UserPlusIcon } from "lucide-react";

function IncomingRequestsList() {
  const { incomingRequests, getIncomingRequests, isFetchingRequests, acceptRequest, declineRequest } = useFriendStore();

  useEffect(() => {
    getIncomingRequests();
  }, [getIncomingRequests]);

  const handleAccept = async (reqId) => {
    await acceptRequest(reqId);
  };

  if (isFetchingRequests) {
    return (
      <div className="flex justify-center p-6 mt-10">
        <LoaderIcon className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (incomingRequests.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)]">
          <UserPlusIcon className="w-6 h-6 opacity-30" />
        </div>
        <p className="text-sm">No new requests</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {incomingRequests.map((req) => (
        <div 
          key={req._id}
          className="p-3 mx-2 rounded-xl flex flex-col gap-3 animate-fade-in"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <img src={req.sender.profilePic || "/avatar.png"} alt={req.sender.username} className="w-10 h-10 rounded-full object-cover border border-[var(--border)]" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{req.sender.fullName}</h4>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{req.sender.username}</p>
            </div>
          </div>
          {req.sender.bio && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">&quot;{req.sender.bio}&quot;</p>
          )}
          <div className="flex gap-2 w-full mt-1">
            <button 
              onClick={() => handleAccept(req._id)}
              className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-[var(--online)] text-white hover:opacity-90 transition-opacity"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => declineRequest(req._id)}
              className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-[var(--danger)] text-white hover:opacity-90 transition-opacity"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomingRequestsList;
