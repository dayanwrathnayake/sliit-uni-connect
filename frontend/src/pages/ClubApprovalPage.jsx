import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getPendingClubs, approveClub, rejectClub } from '../api/clubApi';
import { canApproveClubs, isSystemAdmin, isFacultyManager } from '../utils/roles';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';
import CategoryBadge from '../components/clubs/CategoryBadge';
import PageLayout from '../components/layout/PageLayout';

function CheckIcon() {
  return (
    <svg className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PendingCard({ club, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleApprove() {
    setApproving(true);
    await onApprove(club.id, setRemoving);
    setApproving(false);
  }

  async function handleConfirmReject() {
    if (!reason.trim()) return;
    setConfirming(true);
    await onReject(club.id, reason.trim(), setRemoving);
    setConfirming(false);
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all duration-500 ${
        removing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Club avatar */}
        {club.profilePicUrl ? (
          <img src={club.profilePicUrl} alt={club.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-bold text-white">{(club.name || '?')[0].toUpperCase()}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-base font-semibold text-gray-900">{club.name}</h3>
            <CategoryBadge category={club.category} />
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Requested by: <span className="font-medium text-gray-700">{club.adminName}</span>
          </p>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{club.description}</p>

          {/* Action buttons */}
          {!rejecting ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {approving && <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                Approve
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection (required)…"
                rows={2}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent w-full resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setRejecting(false); setReason(''); }}
                  className="border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!reason.trim() || confirming}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {confirming && <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClubApprovalPage() {
  const navigate = useNavigate();
  const store = useAuthStore();
  const { showToast, toast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canApproveClubs(store)) {
      navigate('/unauthorized', { replace: true });
      return;
    }
    async function load() {
      try {
        const data = await getPendingClubs();
        setClubs(data);
      } catch {
        setError('Failed to load pending clubs.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [store, navigate]);

  async function handleApprove(clubId, setRemoving) {
    try {
      await approveClub(clubId);
      setRemoving(true);
      showToast('Club approved successfully!', 'success');
      setTimeout(() => setClubs((prev) => prev.filter((c) => c.id !== clubId)), 500);
    } catch {
      showToast('Failed to approve club.', 'error');
    }
  }

  async function handleReject(clubId, reason, setRemoving) {
    try {
      await rejectClub(clubId, reason);
      setRemoving(true);
      showToast('Club request rejected.', 'success');
      setTimeout(() => setClubs((prev) => prev.filter((c) => c.id !== clubId)), 500);
    } catch {
      showToast('Failed to reject club.', 'error');
    }
  }

  const subtitle = isSystemAdmin(store)
    ? 'Showing all pending club requests across all faculties'
    : isFacultyManager(store) && store.faculty
    ? `Showing pending requests from ${store.faculty} faculty`
    : '';

  return (
    <PageLayout>
      <ToastContainer toast={toast} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Club Approval Requests</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-32" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20">
            <CheckIcon />
            <h3 className="text-base font-semibold text-gray-700 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-400">No pending club requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clubs.map((club) => (
              <PendingCard
                key={club.id}
                club={club}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}


