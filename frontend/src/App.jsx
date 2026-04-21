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
import { ParallaxStarsBackdrop } from "./components/ParallaxStarsBackground";

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
      {authUser ? (
        <>
          <ParallaxStarsBackdrop
            speed={0.55}
            className="fixed inset-0 z-0"
            gradientTopColor="#05070C"
            gradientBottomColor="#162334"
          />
          <div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 18% 22%, rgba(98, 129, 255, 0.10) 0%, transparent 26%), radial-gradient(circle at 78% 12%, rgba(224, 122, 95, 0.12) 0%, transparent 24%), radial-gradient(circle at 50% 85%, rgba(122, 162, 247, 0.08) 0%, transparent 28%)",
            }}
          />
        </>
      ) : null}

      <div className="relative z-20">
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
          <Route path="/browse" element={authUser ? <BrowseUsersPage /> : <Navigate to={"/login"} />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
        </Routes>
      </div>

      <div className="relative z-30">
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
    </div>
  );
}
export default App;
