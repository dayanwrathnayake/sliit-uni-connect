import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import { avatarColour, initials } from '../components/profile/ProfileCard';
import { getMyCertificates, getMyTasks } from '../api/volunteerService';
import shopApi from '../api/shopApi';

// ── Delete Account Modal ──────────────────────────────────────────────────
function DeleteAccountModal({ onConfirm, onCancel, isClubAdmin, clubName, loading, error }) {
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

        <h2 className="text-center text-lg font-bold text-white mb-2">Delete Account</h2>

        {isClubAdmin && clubName ? (
          <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
            <p className="text-sm text-amber-300 font-medium mb-1">You own a club</p>
            <p className="text-sm text-amber-200/80">
              Deleting your account will also permanently delete the club{' '}
              <span className="font-semibold text-amber-300">"{clubName}"</span>{' '}
              and all its posts, members, and data.
            </p>
          </div>
        ) : null}

        <p className="text-center text-sm text-slate-400 mb-6">
          This action <span className="text-red-400 font-semibold">cannot be undone</span>.
          Your account and all associated data will be permanently removed.
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
            ) : 'Yes, Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Faculty / Role display maps ───────────────────────────────────────────
const FACULTY_LABEL = {
  COMPUTING: 'Faculty of Computing',
  ENGINEERING: 'Faculty of Engineering',
  BUSINESS: 'Faculty of Business',
  HUMANITIES_AND_SCIENCE: 'Faculty of Humanities & Science',
};
const FACULTY_STYLE = {
  COMPUTING: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  ENGINEERING: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  BUSINESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  HUMANITIES_AND_SCIENCE: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};
const ROLE_LABEL = {
  SYSTEM_ADMIN: 'System Admin', FACULTY_MANAGER: 'Faculty Manager',
  DEPT_LEADER: 'Dept. Leader', CLUB_ADMIN: 'Club Admin',
};
const ROLE_STYLE = {
  SYSTEM_ADMIN: 'bg-red-500/15 text-red-400 border-red-500/20',
  FACULTY_MANAGER: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  DEPT_LEADER: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  CLUB_ADMIN: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
};

// ── Skeleton loader ───────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-center">
        <Skeleton className="h-36 w-36 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

// ── Stat box ─────────────────────────────────────────────────────────────
function StatBox({ label, value, emoji }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-500">{emoji} {label}</p>
    </div>
  );
}

function ShopOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopApi.getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(err => console.error("Failed to fetch orders", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4 pt-2">
      {[1, 2].map(i => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}
    </div>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-slate-600 italic py-4">You haven't placed any orders yet.</p>;
  }

  return (
    <div className="space-y-3 pt-2">
      {orders.map(order => (
        <div key={order.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-400">#{order.id.slice(-6).toUpperCase()}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                  order.status === 'READY' ? 'bg-indigo-500/10 text-indigo-500' :
                    order.status === 'COLLECTED' ? 'bg-green-500/10 text-green-500' :
                      'bg-slate-700 text-slate-400'
                }`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-slate-200 truncate truncate-2">
              {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-sm font-bold text-white whitespace-nowrap">Rs. {order.totalAmount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { userId: rawUserId } = useParams();
  const { userId: myId, role, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  // Resolve "me" alias
  const userId = rawUserId === 'me' ? myId : rawUserId;
  const isOwnProfile = userId === myId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [myClub, setMyClub] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');

    api.get(`/api/users/${userId}/profile`)
      .then(({ data }) => setProfile(data))
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load profile.');
      })
      .finally(() => setLoading(false));

    // If it's the logged-in user, fetch volunteer data
    if (isOwnProfile) {
      getMyCertificates().then(setCertificates).catch(() => { });
      getMyTasks().then(setVolunteerTasks).catch(() => { });
    }
  }, [userId, navigate, isOwnProfile]);

  // Fetch club info if the viewer is a club admin (for delete warning)
  useEffect(() => {
    if (!isOwnProfile || role !== 'CLUB_ADMIN') return;
    api.get('/api/clubs/my-club')
      .then(({ data }) => setMyClub(data))
      .catch(() => { });
  }, [isOwnProfile, role]);

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await api.delete('/api/users/me');
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const colour = avatarColour(profile?.displayName || '');
  const abbr = initials(profile?.displayName || '?');

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {loading && <ProfileSkeleton />}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <Link to="/" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">← Go home</Link>
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-6">

            {/* ── Header ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Avatar */}
                <div className={`h-36 w-36 rounded-full flex-shrink-0 overflow-hidden ring-4 ring-slate-700 flex items-center justify-center ${colour}`}>
                  {profile.profilePicUrl ? (
                    <img src={profile.profilePicUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl font-bold text-white">{abbr}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{profile.displayName}</h1>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.faculty && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${FACULTY_STYLE[profile.faculty] ?? 'bg-slate-700 text-slate-300'}`}>
                        {FACULTY_LABEL[profile.faculty] ?? profile.faculty}
                      </span>
                    )}
                    {profile.role && profile.role !== 'STUDENT' && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[profile.role] ?? 'bg-slate-700 text-slate-300'}`}>
                        {ROLE_LABEL[profile.role] ?? profile.role}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm font-mono mb-1">{profile.studentId}</p>
                  <p className="text-slate-500 text-xs">Member since {formatDate(profile.createdAt)}</p>

                  {isOwnProfile && (
                    <Link
                      to="/profile/edit"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-600/30 px-4 py-2 text-sm font-medium text-indigo-300 transition-all"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Bio ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">About</h2>
              {profile.bio ? (
                <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
              ) : isOwnProfile ? (
                <Link to="/profile/edit" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  + Add a bio
                </Link>
              ) : (
                <p className="text-slate-600 text-sm italic">No bio yet.</p>
              )}
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Points earned" value={profile.points ?? 0} emoji="🏆" />
              <StatBox label="Events attended" value={0} emoji="📅" />
              <StatBox label="Volunteer sessions" value={isOwnProfile ? volunteerTasks.length : 0} emoji="🤝" />
            </div>

            {/* ── Certificates (own profile only) ── */}
            {isOwnProfile && certificates.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Certificates</h2>
                  <Link to="/my-volunteering" className="text-xs text-indigo-400 hover:underline font-bold uppercase transition-all">View All Hub</Link>
                </div>
                <div className="space-y-3">
                  {certificates.slice(0, 3).map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📜</span>
                        <span className="text-sm font-medium text-slate-200">Volunteer Certificate</span>
                      </div>
                      {cert.status === 'GENERATED' && (
                        <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── My Shop Orders (own profile only) ── */}
            {isOwnProfile && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">My Shop Orders</h2>
                  <Link to="/shop" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Go to E-Shop →</Link>
                </div>
                <ShopOrdersList />
              </div>
            )}

            {/* ── Referral code (own profile only) ── */}
            {isOwnProfile && profile.referralCode && (
              <div className="bg-gradient-to-br from-indigo-600/10 to-violet-600/5 border border-indigo-500/20 rounded-2xl p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-1">Your Referral Code</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Share this code with friends — you both earn bonus points when they volunteer.
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-indigo-300 tracking-widest text-center">
                    {profile.referralCode}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${copied
                        ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                  >
                    {copied ? (
                      <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!</>
                    ) : (
                      <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Danger Zone (own profile only) ── */}
            {isOwnProfile && (
              <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-3">
                  Danger Zone
                </p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Delete Account</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {role === 'CLUB_ADMIN'
                        ? 'Permanently deletes your account and your club.'
                        : 'Permanently deletes your account and all data.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDeleteError(''); setShowDeleteModal(true); }}
                    className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {showDeleteModal && (
          <DeleteAccountModal
            isClubAdmin={role === 'CLUB_ADMIN'}
            clubName={myClub?.name}
            loading={deleteLoading}
            error={deleteError}
            onConfirm={handleDeleteAccount}
            onCancel={() => { setShowDeleteModal(false); setDeleteError(''); }}
          />
        )}
      </div>
    </PageLayout>
  );
}
