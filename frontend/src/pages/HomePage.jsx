import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import FeedPost from '../components/feed/FeedPost';
import FeedEmptyState from '../components/feed/FeedEmptyState';
import FeedLoadingSkeleton from '../components/feed/FeedLoadingSkeleton';
import UpcomingEventsWidget from '../components/widgets/UpcomingEventsWidget';
import QuickStatsWidget from '../components/widgets/QuickStatsWidget';
import QuickLinksWidget from '../components/widgets/QuickLinksWidget';
import { useFeed } from '../hooks/useFeed';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';
import { useAuthStore } from '../store/authStore';

/* ── Inline SVG icons ────────────────────────────────────────── */
function RefreshIcon({ spinning }) {
  return (
    <svg
      className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h5M20 20v-5h-5M4.93 15A9 9 0 1 0 6.7 6.7L4 4"
      />
    </svg>
  );
}

/* ── Greeting helper ─────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(displayName) {
  if (!displayName) return '';
  return displayName.split(' ')[0];
}

/* ══════════════════════════════════════════════════════════════ */
/*  HomePage                                                     */
/* ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const feed = useFeed();
  const { events, loading: eventsLoading } = useUpcomingEvents();
  const { displayName } = useAuthStore();
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
    <PageLayout wide noPadding>
      {/* ── Welcome Banner ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {getGreeting()}, {getFirstName(displayName) || 'there'}!
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Stay updated with your clubs, events, and campus life.
              </p>
            </div>
            <Link
              to="/clubs"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-lg transition-all self-start sm:self-auto"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Clubs
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content area ───────────────────────────────── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ─── LEFT: Feed column ──────────────────────────── */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              {/* Feed header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-800">Your Feed</h2>
                </div>
                <button
                  onClick={feed.refresh}
                  disabled={feed.loading}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
                  title="Refresh feed"
                >
                  <RefreshIcon spinning={feed.loading && feed.posts.length === 0} />
                  Refresh
                </button>
              </div>

              {/* Error state */}
              {feed.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600 flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
                    <div className="flex justify-center py-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        Loading more posts...
                      </div>
                    </div>
                  )}

                  {/* End of feed */}
                  {!feed.hasMore && feed.posts.length > 0 && !feed.loading && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-sm text-gray-500 shadow-sm">
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        You're all caught up!
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ─── RIGHT: Sidebar ──────────────────────────────── */}
            <aside className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
              <div className="lg:sticky lg:top-20 space-y-4">
                <QuickLinksWidget />
                <QuickStatsWidget />
                <UpcomingEventsWidget events={events} loading={eventsLoading} />
              </div>
            </aside>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
