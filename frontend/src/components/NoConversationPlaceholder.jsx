const NoConversationPlaceholder = () => {
  return (
    <div className="app-empty-state flex h-full flex-col items-center justify-center p-6 text-center animate-fade-in sm:p-10">
      <div className="app-kicker mb-3">Chatify</div>
      <svg viewBox="0 0 120 120" fill="none" className="mb-6 h-24 w-24">
        <circle cx="60" cy="60" r="56" fill="var(--primary-subtle)" />
        <circle cx="60" cy="60" r="40" fill="var(--primary-muted)" />
        <rect x="35" y="42" width="50" height="28" rx="8" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
        <rect x="43" y="51" width="24" height="4" rx="2" fill="var(--primary)" opacity="0.4" />
        <rect x="43" y="59" width="16" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
        <circle cx="60" cy="90" r="4" fill="var(--primary)" opacity="0.2" />
        <line x1="60" y1="74" x2="60" y2="86" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" strokeDasharray="3 3" />
      </svg>

      <h3 className="mb-2 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        Select a conversation
      </h3>
      <p className="max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
        Pick a chat from the sidebar to continue an ongoing conversation or start a new one from your contacts.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
