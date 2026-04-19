function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[...Array(5)].map((_, index) => {
        const isSent = index % 2 !== 0;
        return (
          <div
            key={index}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-pulse-warm`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div
              className={`${isSent ? 'w-40' : 'w-48'} h-10`}
              style={{
                backgroundColor: isSent ? 'rgba(224,122,95,0.15)' : 'var(--bg-elevated)',
                borderRadius: isSent
                  ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                  : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
export default MessagesLoadingSkeleton;
