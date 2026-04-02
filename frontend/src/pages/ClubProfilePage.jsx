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
      <div className="h-48 bg-gray-200 rounded-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 w-16 rounded-full bg-gray-300 -mt-8 mb-4 border-4 border-white" />
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-32" />
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

  const userIsClubAdmin = isClubAdmin(store) && store.userId === club?.adminId;
  const userIsStudent = isStudent(store);

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
      <div className="text-center py-20 text-gray-500">{error}</div>
    </PageLayout>
  );
  if (!club) return null;

  const firstLetter = (club.name || '?')[0].toUpperCase();

  return (
    <PageLayout>
      <ToastContainer toast={toast} />

      {/* Banner */}
      <div className="relative h-48 w-full">
        {club.bannerUrl ? (
          <img src={club.bannerUrl} alt="Club banner" className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Club info row */}
        <div className="flex items-end justify-between gap-4 -mt-8 pb-5 border-b border-gray-100 flex-wrap">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            {club.profilePicUrl ? (
              <img
                src={club.profilePicUrl}
                alt={club.name}
                className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-2xl font-bold text-white">{firstLetter}</span>
              </div>
            )}

            <div className="mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-gray-900">{club.name}</h1>
                <CategoryBadge category={club.category} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {club.followerCount ?? 0} {club.followerCount === 1 ? 'follower' : 'followers'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-1">
            {userIsStudent && (
              <FollowButton
                clubId={clubId}
                initialIsFollowing={club.isFollowing}
                followerCount={club.followerCount}
                onToggle={() => refetch()}
              />
            )}
            {userIsClubAdmin && (
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
                  Create Post
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4 border-b border-gray-100 mb-6">
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

        {/* Tab content */}
        {activeTab === 'posts' ? (
          <div className="space-y-4 pb-10">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 text-sm">No posts yet. {userIsClubAdmin ? 'Create the first post!' : ''}</p>
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
          <div className="pb-10 max-w-2xl">
            <p className="text-gray-700 leading-relaxed mb-4">{club.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CategoryBadge category={club.category} />
              </div>
              {club.createdAt && (
                <p>Created: {new Date(club.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
              <p>Managed by: <span className="font-medium text-gray-700">{club.adminName}</span></p>
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

