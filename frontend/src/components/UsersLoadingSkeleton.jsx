function UsersLoadingSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="p-3 rounded-lg animate-pulse-warm"
          style={{
            animationDelay: `${item * 100}ms`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-3.5 rounded w-3/4"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              />
              <div
                className="h-3 rounded w-1/2"
                style={{ backgroundColor: 'var(--bg-elevated)', opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
