import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import NotificationItem from '../../components/notifications/NotificationItem';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const sentinelRef = useRef(null);

  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  // Infinite scroll — must be declared before any conditional return
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading && notifications.length === 0 ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-gray-400">No notifications yet</span>
            </div>
          ) : (
            <>
              {notifications.map((notif, i) => (
                <div key={notif.id}>
                  <NotificationItem notification={notif} onMarkRead={markRead} />
                  {i < notifications.length - 1 && (
                    <div className="border-b border-gray-100" />
                  )}
                </div>
              ))}

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-2" />

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              )}

              {!hasMore && notifications.length > 0 && !loading && (
                <p className="text-center text-xs text-gray-400 py-4">
                  You're all caught up!
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
