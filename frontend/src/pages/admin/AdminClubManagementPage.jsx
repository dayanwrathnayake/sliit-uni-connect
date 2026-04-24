import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import CategoryBadge from '../../components/clubs/CategoryBadge';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import {
  getAllClubsAdmin,
  approveClub,
  rejectClub,
  updateClub,
} from '../../api/clubApi';
import api from '../../api/axios';

// ── Icons ─────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
    PENDING:  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${config[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ── Edit Club Modal ───────────────────────────────────────────────────────────

function EditClubModal({ club, onClose, onSaved }) {
  const [description, setDescription]   = useState(club.description ?? '');
  const [profilePicUrl, setProfilePicUrl] = useState(club.profilePicUrl ?? '');
  const [bannerUrl, setBannerUrl]         = useState(club.bannerUrl ?? '');
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateClub(club.id, {
        description: description || undefined,
        profilePicUrl: profilePicUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save changes.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Edit Club Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <XIcon />
          </button>
        </div>

        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">
          {club.name}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Club description…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Profile Picture URL</label>
            <input
              type="text"
              value={profilePicUrl}
              onChange={(e) => setProfilePicUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Banner URL</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {saving ? <><SpinnerIcon /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Club Modal ─────────────────────────────────────────────────────────

function DeleteClubModal({ club, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/clubs/${club.id}`);
      onDeleted(club.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete club.');
      setLoading(false);
    }
  }

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
          <span className="font-semibold text-white">"{club.name}"</span>.
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
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {loading ? <><SpinnerIcon /> Deleting…</> : 'Yes, Delete Club'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject Reason Inline ──────────────────────────────────────────────────────

function RejectPanel({ clubId, onCancel, onRejected }) {
  const [reason, setReason]     = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await rejectClub(clubId, reason.trim());
      onRejected(clubId);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection (required)…"
        rows={2}
        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-lg px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!reason.trim() || loading}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading && <SpinnerIcon />}
          Confirm Reject
        </button>
      </div>
    </div>
  );
}

// ── Club Row ──────────────────────────────────────────────────────────────────

function ClubRow({ club, onEdit, onDelete, onApproved, onRejected }) {
  const navigate       = useNavigate();
  const [approving, setApproving] = useState(false);
  const [showReject, setShowReject] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      await approveClub(club.id);
      onApproved(club.id);
    } catch {
      setApproving(false);
    }
  }

  const firstLetter = (club.name || '?')[0].toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {club.profilePicUrl ? (
          <img src={club.profilePicUrl} alt={club.name} className="h-11 w-11 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-bold text-white">{firstLetter}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <button
              onClick={() => navigate(`/clubs/${club.id}`)}
              className="text-base font-semibold text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
            >
              {club.name}
            </button>
            <CategoryBadge category={club.category} />
            <StatusBadge status={club.status} />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-3 flex-wrap">
            <span>Admin: <span className="font-medium text-gray-700 dark:text-slate-300">{club.adminName}</span></span>
            <span>{club.followerCount ?? 0} followers</span>
            {club.faculty && <span>Faculty: {club.faculty}</span>}
            {club.status === 'REJECTED' && club.rejectionReason && (
              <span className="text-red-500 dark:text-red-400">Reason: {club.rejectionReason}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Club */}
            <button
              onClick={() => navigate(`/clubs/${club.id}`)}
              className="flex items-center gap-1.5 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <EyeIcon /> View Club
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(club)}
              className="flex items-center gap-1.5 border border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <PencilIcon /> Edit Details
            </button>

            {/* Approve — pending only */}
            {club.status === 'PENDING' && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
              >
                {approving ? <SpinnerIcon /> : <CheckIcon />} Approve
              </button>
            )}

            {/* Reject — pending only */}
            {club.status === 'PENDING' && !showReject && (
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <XIcon /> Reject
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(club)}
              className="flex items-center gap-1.5 border border-red-300 dark:border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <TrashIcon /> Delete
            </button>
          </div>

          {/* Reject panel */}
          {showReject && (
            <RejectPanel
              clubId={club.id}
              onCancel={() => setShowReject(false)}
              onRejected={(id) => { setShowReject(false); onRejected(id); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = ['All', 'Approved', 'Pending', 'Rejected'];

export default function AdminClubManagementPage() {
  const { showToast, toast } = useToast();
  const [clubs, setClubs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [editingClub, setEditingClub]   = useState(null);
  const [deletingClub, setDeletingClub] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllClubsAdmin();
      setClubs(data);
    } catch {
      setError('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  }

  function handleApproved(clubId) {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: 'APPROVED' } : c))
    );
    showToast('Club approved successfully!', 'success');
  }

  function handleRejected(clubId) {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: 'REJECTED' } : c))
    );
    showToast('Club request rejected.', 'info');
  }

  function handleDeleted(clubId) {
    setClubs((prev) => prev.filter((c) => c.id !== clubId));
    showToast('Club deleted.', 'success');
  }

  const filteredClubs = useMemo(() => {
    let result = clubs;
    if (activeTab !== 'All') {
      result = result.filter((c) => c.status === activeTab.toUpperCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.adminName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clubs, activeTab, search]);

  const countByStatus = useMemo(() => ({
    All:      clubs.length,
    Approved: clubs.filter((c) => c.status === 'APPROVED').length,
    Pending:  clubs.filter((c) => c.status === 'PENDING').length,
    Rejected: clubs.filter((c) => c.status === 'REJECTED').length,
  }), [clubs]);

  return (
    <AdminLayout>
      <ToastContainer toast={toast} />
      <div className="h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Club Management</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Manage all clubs — approve requests, edit details, or delete clubs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs…"
                className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-52"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                {tab}
                {countByStatus[tab] > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {countByStatus[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse h-24" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🏛️</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                {search ? 'No clubs match your search.' : `No ${activeTab.toLowerCase()} clubs.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClubs.map((club) => (
                <ClubRow
                  key={club.id}
                  club={club}
                  onEdit={setEditingClub}
                  onDelete={setDeletingClub}
                  onApproved={handleApproved}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editingClub && (
        <EditClubModal
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onSaved={() => {
            showToast('Club details updated!', 'success');
            load();
          }}
        />
      )}

      {deletingClub && (
        <DeleteClubModal
          club={deletingClub}
          onClose={() => setDeletingClub(null)}
          onDeleted={handleDeleted}
        />
      )}
    </AdminLayout>
  );
}
