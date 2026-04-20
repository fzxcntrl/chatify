import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { XIcon, MapPinIcon, NavigationIcon } from "lucide-react";
import { DEFAULT_LOCATION_MARKER } from "../lib/locationMarkers";
import { getTrackerMarkerDimensions, getTrackerMarkerMarkup } from "../lib/trackerMarkerMarkup";
import "leaflet/dist/leaflet.css";

const createTrackerIcon = (variant, markerKey, label) => {
  const { iconSize, iconAnchor } = getTrackerMarkerDimensions(markerKey, {
    hasLabel: Boolean(label),
  });

  return L.divIcon({
    className: "",
    html: getTrackerMarkerMarkup(markerKey, { variant, label }),
    iconSize,
    iconAnchor,
  });
};

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

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Chatify Tracker"
    }).addTo(mapRef.current);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(mapRef.current);

    const updateMarker = ({ id, latitude, longitude, label, variant, markerKey }) => {
      if (!mapRef.current) return;

      if (markersRef.current[id]) {
        markersRef.current[id].setLatLng([latitude, longitude]);
        markersRef.current[id].setIcon(createTrackerIcon(variant, markerKey, label));
        return;
      }

      markersRef.current[id] = L.marker([latitude, longitude], {
        icon: createTrackerIcon(variant, markerKey, label),
        zIndexOffset: variant === "friend" ? 1200 : 1000,
      }).addTo(mapRef.current);
    };

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
          updateMarker({
            id: myId,
            latitude,
            longitude,
            label: authUser.username || "you",
            variant: "me",
            markerKey: authUser.locationMarker || DEFAULT_LOCATION_MARKER,
          });

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
       if (id !== selectedUser._id) return;

       updateMarker({
         id,
         latitude,
         longitude,
         label: selectedUser.username || selectedUser.fullName,
         variant: "friend",
         markerKey: selectedUser.locationMarker || DEFAULT_LOCATION_MARKER,
       });

       const bounds = L.latLngBounds(
         Object.values(markersRef.current).map((marker) => marker.getLatLng())
       );

       if (bounds.isValid()) {
         mapRef.current.fitBounds(bounds, {
           padding: [70, 70],
           maxZoom: 16,
         });
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
       markersRef.current = {};
    };
  }, [socket, selectedUser, authUser]);

  return (
    <div
      className="fixed inset-0 z-[180] flex flex-col glass animate-fade-in"
      style={{ backgroundColor: 'rgba(10, 14, 26, 0.96)' }}
    >
       <div
         className="flex items-center justify-between px-4 py-4 border-b"
         style={{
           borderColor: 'var(--border)',
           backgroundColor: 'rgba(20, 25, 38, 0.92)',
           paddingTop: 'max(1rem, env(safe-area-inset-top))',
         }}
       >
          <div className="flex items-center gap-2">
            <span
              className="p-2 rounded-xl text-white shadow-[0_0_30px_rgba(224,122,95,0.35)]"
              style={{ backgroundColor: 'var(--primary)' }}
            >
               <NavigationIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Live Tracker</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Sharing location with {selectedUser?.fullName}
              </p>
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

       <div className="flex-1 relative min-h-0">
         {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] p-6 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }}>
               <MapPinIcon className="w-12 h-12 mb-3 text-[var(--danger)]" />
               <h4 className="text-lg font-semibold mb-1">Tracker Disabled</h4>
               <p className="text-sm opacity-80">{errorMsg}</p>
               <p className="text-xs opacity-60 mt-4">Please allow browser location permissions to track your chat partner.</p>
            </div>
         )}
         <div ref={mapContainerRef} className="w-full h-full tracker-map" style={{ background: '#e5e5e5' }}></div>
       </div>
    </div>
  );
}

export default MapTrackerModal;
