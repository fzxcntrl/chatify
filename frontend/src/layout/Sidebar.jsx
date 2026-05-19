import { NavLink, useNavigate, useLocation } from "react-router";
import { MessageCircle, Search, User, Settings, LogOut, Volume2Icon, VolumeOffIcon, Heart } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";

function Sidebar() {
  const { authUser, logout } = useAuthStore();
  const { setShowSettingsModal, isSoundEnabled, toggleSound, activeTab, setActiveTab } = useChatStore();
  const { incomingRequests } = useFriendStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, path, tabName) => {
    e.preventDefault();
    if (tabName) {
      if (location.pathname === path && activeTab === tabName) {
        useChatStore.getState().setSelectedUser(null);
      }
      setActiveTab(tabName);
    }
    navigate(path);
  };

  const navItems = [
    { name: "Home", path: "/", icon: MessageCircle, tab: "chats" },
    { name: "Search", path: "/browse", icon: Search, tab: null },
    { name: "Requests", path: "/", icon: Heart, tab: "requests", badge: incomingRequests.length },
  ];

  return (
    <div className="flex flex-col h-full w-16 md:w-[240px] lg:w-[280px] border-r border-[var(--border)] bg-[var(--app-shell-sidebar-bg)] p-3 backdrop-blur-md shrink-0">
      <div className="mb-8 hidden md:block pt-4 px-3">
        <h1 className="text-2xl font-bold font-heading italic" style={{ color: 'var(--text-primary)' }}>Chatify</h1>
      </div>
      <div className="mb-8 block md:hidden pt-4 text-center">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white font-bold flex items-center justify-center mx-auto italic text-lg">C</div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            (item.tab ? (location.pathname === item.path && activeTab === item.tab) : (location.pathname === item.path));

          return (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path, item.tab)}
              className={`relative flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                isActive
                  ? "font-semibold text-[var(--text-primary)] bg-[var(--bg-hover)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="relative shrink-0">
                <Icon className="w-[26px] h-[26px] transition-transform group-hover:scale-105" strokeWidth={2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-base">{item.name}</span>
            </a>
          );
        })}
      </nav>

      <div className="pt-4 mt-auto space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? "font-semibold text-[var(--text-primary)] bg-[var(--bg-hover)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            }`
          }
        >
          <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" className="w-[26px] h-[26px] rounded-full border border-[var(--border)] object-cover shrink-0 transition-transform group-hover:scale-105" />
          <span className="hidden md:block text-base">Profile</span>
        </NavLink>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] w-full text-left"
        >
          <Settings className="w-[26px] h-[26px] shrink-0 transition-transform group-hover:scale-105" strokeWidth={2} />
          <span className="hidden md:block text-base">Settings</span>
        </button>

        <button
          onClick={toggleSound}
          className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] w-full text-left"
        >
          {isSoundEnabled ? (
            <Volume2Icon className="w-[26px] h-[26px] shrink-0 transition-transform group-hover:scale-105" strokeWidth={2} />
          ) : (
            <VolumeOffIcon className="w-[26px] h-[26px] shrink-0 transition-transform group-hover:scale-105" strokeWidth={2} />
          )}
          <span className="hidden md:block text-base">Sound: {isSoundEnabled ? "On" : "Off"}</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-[var(--danger)] hover:bg-[var(--bg-hover)] w-full text-left"
        >
          <LogOut className="w-[26px] h-[26px] shrink-0 transition-transform group-hover:scale-105" strokeWidth={2} />
          <span className="hidden md:block text-base">Log out</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
