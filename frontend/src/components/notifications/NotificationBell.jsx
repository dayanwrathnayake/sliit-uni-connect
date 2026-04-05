import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { isStudent } from '../../utils/roles';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

function BellIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export default function NotificationBell() {
  const store = useAuthStore();
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  // Only render for authenticated students
  if (!store.isAuthenticated || !isStudent(store)) return null;

  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          hasMore={hasMore}
          loading={loading}
          onMarkAllRead={markAllRead}
          onLoadMore={loadMore}
          onMarkRead={markRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
