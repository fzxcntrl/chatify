import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import BrowseUsersPage from "./pages/BrowseUsersPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { useChatStore } from "./store/useChatStore";
import useUiSounds from "./hooks/useUiSounds";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const { isSoundEnabled } = useChatStore();
  const { playRandomTapSound } = useUiSounds();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div
      className="min-h-screen min-h-dvh relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
      onPointerDownCapture={(event) => {
        if (!isSoundEnabled) return;

        const interactiveTarget = event.target.closest(
          'button, a[href], [role="button"], [data-ui-sound="tap"]'
        );

        if (!interactiveTarget) return;
        if (interactiveTarget.hasAttribute("data-skip-ui-sound")) return;

        playRandomTapSound();
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(224,122,95,0.04) 0%, transparent 70%)',
        }}
      />

      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
        <Route path="/browse" element={authUser ? <BrowseUsersPage /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#6BCB77',
              secondary: 'var(--bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: '#E05F5F',
              secondary: 'var(--bg-elevated)',
            },
          },
        }}
      />
    </div>
  );
}
export default App;
