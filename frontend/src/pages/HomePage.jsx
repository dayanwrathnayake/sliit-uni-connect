import { useEffect, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import FeedPost from '../components/feed/FeedPost';
import FeedEmptyState from '../components/feed/FeedEmptyState';
import FeedLoadingSkeleton from '../components/feed/FeedLoadingSkeleton';
import AnnouncementBanner from '../components/feed/AnnouncementBanner';
import WelcomeCard from '../components/widgets/WelcomeCard';
import QuickStatsWidget from '../components/widgets/QuickStatsWidget';
import UpcomingEventsWidget from '../components/widgets/UpcomingEventsWidget';
import LeaderboardSnapshotWidget from '../components/widgets/LeaderboardSnapshotWidget';
import ShopSpotlightWidget from '../components/widgets/ShopSpotlightWidget';
import { useFeed } from '../hooks/useFeed';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';

export default function HomePage() {
  const feed = useFeed();
  const { events, loading: eventsLoading } = useUpcomingEvents();
  const sentinelRef = useRef(null);

  useEffect(() => {
    feed.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-4rem)]">

        {/* ─── LEFT SIDEBAR ───────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 dark:border-slate-800 p-4 space-y-4">
          <WelcomeCard />
          <QuickStatsWidget />
        </aside>

        {/* ─── CENTER FEED ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-6">

          {/* Announcement banner */}
          <AnnouncementBanner />

          {/* Error state */}
          {feed.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4 text-sm text-red-600 dark:text-red-400">
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

              <div ref={sentinelRef} className="h-4" />

              {feed.loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              )}

              {!feed.hasMore && feed.posts.length > 0 && !feed.loading && (
                <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">
                  You're all caught up!
                </p>
              )}
            </>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ──────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto border-l border-gray-200 dark:border-slate-800 p-4 space-y-4">
          <LeaderboardSnapshotWidget />
          <UpcomingEventsWidget events={events} loading={eventsLoading} />
          <ShopSpotlightWidget />
        </aside>

      </div>
    </PageLayout>
  );
}
