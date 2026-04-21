const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
      <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24 mb-6">
        <circle cx="60" cy="60" r="56" fill="var(--primary-subtle)" />
        <circle cx="60" cy="60" r="40" fill="var(--primary-muted)" />
        <rect x="35" y="42" width="50" height="28" rx="8" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
        <rect x="43" y="51" width="24" height="4" rx="2" fill="var(--primary)" opacity="0.4" />
        <rect x="43" y="59" width="16" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
        <circle cx="60" cy="90" r="4" fill="var(--primary)" opacity="0.2" />
        <line x1="60" y1="74" x2="60" y2="86" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" strokeDasharray="3 3" />
      </svg>

      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Select a conversation
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        Choose someone from the sidebar to start chatting, or browse your contacts to begin a new conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
