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
      <div className="app-empty-state py-12 text-center" style={{ color: 'var(--text-muted)' }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <UserPlusIcon className="h-6 w-6 opacity-40" />
        </div>
        <h3 className="text-base font-medium" style={{ color: "var(--text-primary)" }}>No pending requests</h3>
        <p className="mt-1 text-sm">New connection requests will show up here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {incomingRequests.map((req) => (
        <div 
          key={req._id}
          className="app-card mx-1 flex flex-col gap-3 p-4 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <img src={req.sender.profilePic || "/avatar.png"} alt={req.sender.username} className="h-11 w-11 rounded-full object-cover border border-[var(--border)]" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{req.sender.fullName}</h4>
              <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{req.sender.username}</p>
            </div>
          </div>
          {req.sender.bio && (
            <p className="line-clamp-2 text-xs" style={{ color: "var(--text-secondary)" }}>{req.sender.bio}</p>
          )}
          <div className="mt-1 grid w-full grid-cols-2 gap-2">
            <button 
              onClick={() => handleAccept(req._id)}
              className="app-primary-button flex items-center justify-center gap-2 px-4 text-sm"
              style={{ background: "linear-gradient(135deg, #6BCB77, #4FB65D)" }}
            >
              <CheckIcon className="w-4 h-4" />
              Accept
            </button>
            <button 
              onClick={() => declineRequest(req._id)}
              className="app-secondary-button flex items-center justify-center gap-2 px-4 text-sm"
              style={{ color: "var(--danger)", borderColor: "rgba(224, 95, 95, 0.22)" }}
            >
              <XIcon className="w-4 h-4" />
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomingRequestsList;
