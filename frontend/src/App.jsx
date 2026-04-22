import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useAuthStore } from "./store/useAuthStore";
import useUiSounds from "./hooks/useUiSounds";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";
import { ParallaxStarsBackdrop } from "./components/ParallaxStarsBackground";

const ChatPage = lazy(() => import("./pages/ChatPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const BrowseUsersPage = lazy(() => import("./pages/BrowseUsersPage"));

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const { playRandomTapSound } = useUiSounds();
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    () => JSON.parse(localStorage.getItem("isSoundEnabled")) === true
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const syncSoundPreference = () => {
      setIsSoundEnabled(JSON.parse(localStorage.getItem("isSoundEnabled")) === true);
    };

    window.addEventListener("storage", syncSoundPreference);
    window.addEventListener("chatify:sound-preference-changed", syncSoundPreference);

    return () => {
      window.removeEventListener("storage", syncSoundPreference);
      window.removeEventListener("chatify:sound-preference-changed", syncSoundPreference);
    };
  }, []);

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
            gradientTopColor="var(--space-gradient-top)"
            gradientBottomColor="var(--space-gradient-bottom)"
            starRgb="var(--space-star-rgb)"
          />
          <div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              background: 'var(--space-glow-overlay)',
            }}
          />
        </>
      ) : null}

      <div className="relative z-20">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
            <Route path="/browse" element={authUser ? <BrowseUsersPage /> : <Navigate to={"/login"} />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
          </Routes>
        </Suspense>
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
