const NoChatHistoryPlaceholder = ({ name }) => {
  const prompts = ["Say hello", "Break the ice", "Plan a catch-up"];

  return (
    <div className="app-empty-state flex h-full flex-col items-center justify-center p-6 text-center animate-fade-in-up sm:p-8">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center"
        style={{
          backgroundColor: 'var(--primary-muted)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V13.5C20 14.8807 18.8807 16 17.5 16H10.5L6 20V16H6.5C5.11929 16 4 14.8807 4 13.5V6.5Z"
            fill="var(--primary)"
            opacity="0.8"
          />
        </svg>
      </div>

      <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Start your conversation with {name}
      </h3>

      <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        This is the beginning of your chat. Send a message to say hello!
      </p>

      <div
        className="w-16 h-px mb-5"
        style={{ backgroundColor: 'var(--border)' }}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((prompt) => (
          <span
            key={prompt}
            className="px-3.5 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--primary-muted)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {prompt}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
