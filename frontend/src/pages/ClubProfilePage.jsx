import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useClub } from '../hooks/useClub';
import { likePost } from '../api/clubApi';
import { isClubAdmin, isStudent } from '../utils/roles';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';
import CategoryBadge from '../components/clubs/CategoryBadge';
import FollowButton from '../components/clubs/FollowButton';
import PostCard from '../components/clubs/PostCard';
import CreatePostModal from '../components/clubs/CreatePostModal';
import PageLayout from '../components/layout/PageLayout';

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-300 w-full" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 -mt-10 relative">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-300 border-4 border-white -mt-14 flex-shrink-0" />
            <div className="pt-1 flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubProfilePage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const store = useAuthStore();
  const { club, posts, loading, error, refetch } = useClub(clubId);
  const { showToast, toast } = useToast();
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // True only if this user is the admin OF THIS specific club
  const userIsThisClubAdmin = isClubAdmin(store) && store.userId === club?.adminId;
  // Regular student (not a club admin) — can follow
  const userCanFollow = isStudent(store) && !isClubAdmin(store);

  async function handleLikeToggle(postId) {
    try {
      await likePost(postId);
      await refetch();
    } catch {
      showToast('Failed to update like', 'error');
    }
  }

  if (loading) return <PageLayout><SkeletonLoader /></PageLayout>;
  if (error) return (
    <PageLayout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    </PageLayout>
  );
  if (!club) return null;

  const firstLetter = (club.name || '?')[0].toUpperCase();

  return (
    <PageLayout>
      <ToastContainer toast={toast} />

      {/* ── Banner ── */}
      <div className="h-52 w-full overflow-hidden">
        {club.bannerUrl ? (
          <img
            src={club.bannerUrl}
            alt="Club banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}
      </div>

      {/* ── Main content wrapper ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* ── Club header card — white bg so text is always readable ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 pt-0 pb-5 -mt-10 relative z-10">

          {/* Row: Avatar + Info + Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

            {/* Left: Avatar + text */}
            <div className="flex items-end gap-4">
              {/* Avatar — pulled up to overlap the banner */}
              {club.profilePicUrl ? (
                <img
                  src={club.profilePicUrl}
                  alt={club.name}
                  className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md flex-shrink-0 -mt-10"
                />
              ) : (
                <div className="h-20 w-20 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center shadow-md flex-shrink-0 -mt-10">
                  <span className="text-3xl font-bold text-white">{firstLetter}</span>
                </div>
              )}

              {/* Name, badge, followers */}
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {club.name}
                </h1>
                <div className="mt-1 mb-1">
                  <CategoryBadge category={club.category} />
                </div>
                <p className="text-sm text-gray-500">
                  {club.followerCount ?? 0}{' '}
                  {club.followerCount === 1 ? 'follower' : 'followers'}
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 pb-1 flex-wrap">
              {/* Follow — only plain students (not club admins) */}
              {userCanFollow && (
                <FollowButton
                  clubId={clubId}
                  initialIsFollowing={club.isFollowing}
                  followerCount={club.followerCount}
                  onToggle={() => refetch()}
                />
              )}

              {/* Edit + Create Post — only the admin of THIS club */}
              {userIsThisClubAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/clubs/${clubId}/edit`)}
                    className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Edit Club
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    + Create Post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-6 mt-6 border-b border-gray-200 mb-6">
          {['posts', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 text-sm font-medium">No posts yet.</p>
                {userIsThisClubAdmin && (
                  <p className="text-gray-400 text-xs mt-1">
                    Click "Create Post" to share your first update!
                  </p>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  clubId={clubId}
                  onLikeToggle={handleLikeToggle}
                />
              ))
            )}
          </div>
        ) : (
          /* About tab */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
            <h2 className="text-base font-semibold text-gray-900 mb-3">About this club</h2>
            <p className="text-gray-700 leading-relaxed mb-5 text-sm">{club.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">Category</span>
                <CategoryBadge category={club.category} />
              </div>
              {club.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-28 flex-shrink-0">Created</span>
                  <span className="text-gray-700">
                    {new Date(club.createdAt).toLocaleDateString('en-LK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">Managed by</span>
                <span className="font-medium text-gray-900">{club.adminName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">Followers</span>
                <span className="text-gray-700">{club.followerCount ?? 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreatePost && (
        <CreatePostModal
          clubId={clubId}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={refetch}
        />
      )}
    </PageLayout>
  );
}
