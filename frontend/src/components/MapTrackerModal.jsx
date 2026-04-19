import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { XIcon, MapPinIcon, NavigationIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapTrackerModal({ onClose }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef({});
  const watchIdRef = useRef(null);

  const { socket, authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Chatify Tracker"
    }).addTo(mapRef.current);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setHasPermission(true);
          const { latitude, longitude } = position.coords;
          
          if (socket && selectedUser) {
             socket.emit("send-location", {
               receiverId: selectedUser._id,
               latitude,
               longitude
             });
          }

          const myId = authUser._id;
          if (markersRef.current[myId]) {
             markersRef.current[myId].setLatLng([latitude, longitude]);
          } else {
             markersRef.current[myId] = L.marker([latitude, longitude])
               .bindTooltip("You", { permanent: true, offset: [10, 0] })
               .addTo(mapRef.current);
          }
          
          if (!mapRef.current._pannedOnce) {
             mapRef.current.setView([latitude, longitude], 16);
             mapRef.current._pannedOnce = true;
          }
        },
        (error) => {
          console.error(error);
          setHasPermission(false);
          setErrorMsg(error.message || "Location access denied.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setHasPermission(false);
      setErrorMsg("Geolocation not supported by browser.");
    }

    const handleReceiveLocation = (data) => {
       const { id, latitude, longitude } = data;
       if (!mapRef.current) return;

       if (markersRef.current[id]) {
           markersRef.current[id].setLatLng([latitude, longitude]);
       } else {
           if (id === selectedUser._id) {
               markersRef.current[id] = L.marker([latitude, longitude])
                 .bindTooltip(selectedUser.fullName, { permanent: true, offset: [10, 0] })
                 .addTo(mapRef.current);
           }
       }
    };

    if (socket) {
      socket.on("receive-location", handleReceiveLocation);
    }

    return () => {
       if (watchIdRef.current !== null && navigator.geolocation) {
           navigator.geolocation.clearWatch(watchIdRef.current);
       }
       if (socket) {
           socket.off("receive-location", handleReceiveLocation);
       }
       if (mapRef.current) {
           mapRef.current.remove();
           mapRef.current = null;
       }
    };
  }, [socket, selectedUser, authUser]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col glass animate-fade-in" style={{ backgroundColor: 'var(--bg-surface)' }}>
       <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg text-white" style={{ backgroundColor: 'var(--primary)' }}>
               <NavigationIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Live Tracker</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sharing location with {selectedUser?.fullName}</p>
            </div>
          </div>
          <button 
             onClick={onClose}
             className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
             style={{ color: 'var(--text-secondary)' }}
          >
             <XIcon className="w-5 h-5" />
          </button>
       </div>

       <div className="flex-1 relative">
         {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] p-6 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }}>
               <MapPinIcon className="w-12 h-12 mb-3 text-[var(--danger)]" />
               <h4 className="text-lg font-semibold mb-1">Tracker Disabled</h4>
               <p className="text-sm opacity-80">{errorMsg}</p>
               <p className="text-xs opacity-60 mt-4">Please allow browser location permissions to track your chat partner.</p>
            </div>
         )}
         <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#e5e5e5' }}></div>
       </div>
    </div>
  );
}

export default MapTrackerModal;
