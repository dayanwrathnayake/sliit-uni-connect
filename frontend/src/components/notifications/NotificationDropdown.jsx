import { useEffect, useRef } from 'react';
import NotificationItem from './NotificationItem';

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  hasMore,
  loading,
  onMarkAllRead,
  onLoadMore,
  onMarkRead,
  onClose,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleMouseDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg z-50 overflow-hidden"
      style={{ maxHeight: '480px', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1">
        {loading && notifications.length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400 dark:text-slate-500">No notifications yet</span>
          </div>
        ) : (
          <>
            {notifications.map((notif, i) => (
              <div key={notif.id}>
                <NotificationItem notification={notif} onMarkRead={onMarkRead} />
                {i < notifications.length - 1 && (
                  <div className="border-b border-gray-50 dark:border-slate-700/50" />
                )}
              </div>
            ))}

            {hasMore && (
              <button
                onClick={onLoadMore}
                className="block w-full text-xs text-center text-indigo-600 dark:text-indigo-400 py-2 cursor-pointer hover:underline"
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
