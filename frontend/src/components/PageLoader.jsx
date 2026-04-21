function PageLoader() {
  return (
    <div
      className="flex h-screen h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="app-kicker">Chatify</div>
      <div className="animate-pulse-warm">
        <div
          className="flex h-12 w-12 items-center justify-center"
          style={{
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V13.5C20 14.8807 18.8807 16 17.5 16H10.5L6 20V16H6.5C5.11929 16 4 14.8807 4 13.5V6.5Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading your workspace…</p>
    </div>
  );
}
export default PageLoader;
