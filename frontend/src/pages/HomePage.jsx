import { useEffect, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import FeedPost from '../components/feed/FeedPost';
import FeedEmptyState from '../components/feed/FeedEmptyState';
import FeedLoadingSkeleton from '../components/feed/FeedLoadingSkeleton';
import UpcomingEventsWidget from '../components/widgets/UpcomingEventsWidget';
import QuickStatsWidget from '../components/widgets/QuickStatsWidget';
import { useFeed } from '../hooks/useFeed';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h5M20 20v-5h-5M4.93 15A9 9 0 1 0 6.7 6.7L4 4" />
    </svg>
  );
}

export default function HomePage() {
  const feed = useFeed();
  const { events, loading: eventsLoading } = useUpcomingEvents();
  const sentinelRef = useRef(null);

  // Load initial feed on mount
  useEffect(() => {
    feed.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll — IntersectionObserver on sentinel div
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && feed.hasMore && !feed.loading) {
          feed.loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [feed]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">

            {/* ─── LEFT: Feed ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Feed header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-800">Your Feed</h1>
                <button
                  onClick={feed.refresh}
                  disabled={feed.loading}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  title="Refresh feed"
                >
                  <RefreshIcon />
                  Refresh
                </button>
              </div>

              {/* Error state */}
              {feed.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
                  {feed.error}
                </div>
              )}

              {/* Feed content */}
              {feed.loading && feed.posts.length === 0 ? (
                <FeedLoadingSkeleton />
              ) : !feed.loading && feed.posts.length === 0 ? (
                <FeedEmptyState />
              ) : (
                <>
                  <div className="space-y-4">
                    {feed.posts.map((post) => (
                      <FeedPost key={post.postId} post={post} />
                    ))}
                  </div>

                  {/* Sentinel for infinite scroll */}
                  <div ref={sentinelRef} className="h-4" />

                  {/* Loading more spinner */}
                  {feed.loading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                  )}

                  {/* End of feed */}
                  {!feed.hasMore && feed.posts.length > 0 && !feed.loading && (
                    <p className="text-center text-sm text-gray-400 py-6">
                      You're all caught up! 🎉
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ─── RIGHT: Sidebar ─────────────────────────────────────── */}
            <aside className="w-full md:w-80 flex-shrink-0 space-y-4">
              <QuickStatsWidget />
              <UpcomingEventsWidget events={events} loading={eventsLoading} />
            </aside>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
