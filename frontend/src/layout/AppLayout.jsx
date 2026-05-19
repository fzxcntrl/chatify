import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import { Suspense, lazy } from "react";
import PageLoader from "../components/PageLoader";
import { useChatStore } from "../store/useChatStore";

const MapTrackerModal = lazy(() => import("../components/MapTrackerModal"));
const SettingsModal = lazy(() => import("../components/SettingsModal"));
const EditProfileModal = lazy(() => import("../components/EditProfileModal"));

function AppLayout() {
  const {
    showMapTracker,
    setShowMapTracker,
    showSettingsModal,
    setShowSettingsModal,
    showEditProfileModal,
    setShowEditProfileModal,
  } = useChatStore();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-transparent">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">
        <Outlet />
      </main>

      {showSettingsModal && (
        <Suspense fallback={<PageLoader />}>
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        </Suspense>
      )}

      {showEditProfileModal && (
        <Suspense fallback={<PageLoader />}>
          <EditProfileModal onClose={() => setShowEditProfileModal(false)} />
        </Suspense>
      )}

      {showMapTracker && (
        <Suspense fallback={<PageLoader />}>
          <MapTrackerModal onClose={() => setShowMapTracker(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default AppLayout;
