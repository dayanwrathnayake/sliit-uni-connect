import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useClub } from '../hooks/useClub';
import { likePost, deletePost } from '../api/clubApi';
import { isStudent } from '../utils/roles';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';
import ToastContainer from '../components/common/ToastContainer';
import CategoryBadge from '../components/clubs/CategoryBadge';
import FollowButton from '../components/clubs/FollowButton';
import PostCard from '../components/clubs/PostCard';
import CreatePostModal from '../components/clubs/CreatePostModal';
import PageLayout from '../components/layout/PageLayout';

// ── Delete Club Modal ─────────────────────────────────────────────────────
function DeleteClubModal({ clubName, onConfirm, onCancel, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-500/30 p-6 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-lg font-bold text-white mb-2">Delete Club</h2>
        <p className="text-center text-sm text-slate-400 mb-1">
          You are about to permanently delete{' '}
          <span className="font-semibold text-white">"{clubName}"</span>.
        </p>
        <p className="text-center text-sm text-slate-500 mb-6">
          All posts and club data will be removed. This action{' '}
          <span className="text-red-400 font-semibold">cannot be undone</span>.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {loading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deleting…</>
            ) : 'Yes, Delete Club'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-slate-700 w-full" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-6 -mt-10 relative">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-slate-700 border-4 border-white dark:border-slate-800 -mt-14 flex-shrink-0" />
            <div className="pt-1 flex-1">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-28" />
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
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const userIsThisClubAdmin = club?.isAdmin === true;
  const userCanFollow = isStudent(store) && !club?.isAdmin;

  async function handleDeleteClub() {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await api.delete(`/api/clubs/${clubId}`);
      navigate('/clubs', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete club. Please try again.');
      setDeleteLoading(false);
    }
  }

  async function handleLikeToggle(postId) {
    try {
      await likePost(postId);
      await refetch();
    } catch {
      showToast('Failed to update like', 'error');
    }
  }

  async function handleDeletePost(post) {
    try {
      await deletePost(clubId, post.id);
      await refetch();
      showToast('Post deleted', 'success');
    } catch {
      showToast('Failed to delete post', 'error');
    }
  }

  if (loading) return <PageLayout><SkeletonLoader /></PageLayout>;
  if (error) return (
    <PageLayout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{error}</p>
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
          <img src={club.bannerUrl} alt="Club banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}
      </div>

      {/* ── Main content wrapper ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* ── Club header card ── */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm px-6 pt-0 pb-6 -mt-10 relative z-10">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            {/* Left: Avatar + text */}
            <div className="flex items-end gap-5">
              {club.profilePicUrl ? (
                <img
                  src={club.profilePicUrl}
                  alt={club.name}
                  className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-lg flex-shrink-0 -mt-10"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0 -mt-10">
                  <span className="text-3xl font-bold text-white">{firstLetter}</span>
                </div>
              )}

              <div className="pb-2 space-y-1 pt-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
                  {club.name}
                </h1>
                <CategoryBadge category={club.category} />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {club.followerCount ?? 0}{' '}
                  {club.followerCount === 1 ? 'follower' : 'followers'}
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-3 pb-2 flex-wrap sm:flex-nowrap">
              {userCanFollow && (
                <FollowButton
                  clubId={clubId}
                  initialIsFollowing={club.isFollowing}
                  followerCount={club.followerCount}
                  onToggle={() => refetch()}
                />
              )}

              {userIsThisClubAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/clubs/${clubId}/edit`)}
                    className="border border-indigo-500 dark:border-indigo-500/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Edit Club
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    + Create Post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-6 mt-6 border-b border-gray-200 dark:border-slate-700 mb-6">
          {['posts', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'posts' ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">No posts yet.</p>
                {userIsThisClubAdmin && (
                  <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
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
                  onEdit={userIsThisClubAdmin ? setEditingPost : undefined}
                  onDelete={userIsThisClubAdmin ? handleDeletePost : undefined}
                />
              ))
            )}
          </div>
        ) : (
          /* About tab */
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-3">About this club</h2>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-5 text-sm">{club.description}</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 dark:text-slate-500 w-28 flex-shrink-0">Category</span>
                  <CategoryBadge category={club.category} />
                </div>
                {club.createdAt && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 dark:text-slate-500 w-28 flex-shrink-0">Created</span>
                    <span className="text-gray-700 dark:text-slate-300">
                      {new Date(club.createdAt).toLocaleDateString('en-LK', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 dark:text-slate-500 w-28 flex-shrink-0">Managed by</span>
                  <span className="font-medium text-gray-900 dark:text-slate-200">{club.adminName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 dark:text-slate-500 w-28 flex-shrink-0">Followers</span>
                  <span className="text-gray-700 dark:text-slate-300">{club.followerCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone — club owner only */}
            {userIsThisClubAdmin && (
              <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-3">
                  Danger Zone
                </p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Delete this club</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Permanently removes the club and all its posts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDeleteError(''); setShowDeleteModal(true); }}
                    className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition"
                  >
                    Delete Club
                  </button>
                </div>
              </div>
            )}
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

      {editingPost && (
        <CreatePostModal
          clubId={clubId}
          initialPost={editingPost}
          onClose={() => setEditingPost(null)}
          onPostCreated={() => { setEditingPost(null); refetch(); }}
        />
      )}

      {showDeleteModal && (
        <DeleteClubModal
          clubName={club.name}
          loading={deleteLoading}
          error={deleteError}
          onConfirm={handleDeleteClub}
          onCancel={() => { setShowDeleteModal(false); setDeleteError(''); }}
        />
      )}
    </PageLayout>
  );
}
