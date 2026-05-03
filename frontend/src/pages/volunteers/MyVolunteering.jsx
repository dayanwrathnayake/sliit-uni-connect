import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  getMyApplications,
  getMyTasks,
  getMyCertificates,
  getMyPoints,
  completeTask,
  requestCertificate,
  downloadCertificatePdf,
} from '../../api/volunteerService';
import { getEventById } from '../../api/eventService';
import PageLayout from '../../components/layout/PageLayout';
import VolunteerBadge from '../../components/volunteers/VolunteerBadge';
import PointsChip from '../../components/volunteers/PointsChip';
import ConfirmModal from '../../components/common/ConfirmModal';
import EventLeaderboard from '../../components/events/EventLeaderboard';

// ── Helpers ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'applications', label: '📋 Applications' },
  { id: 'tasks',        label: '✅ My Tasks'       },
  { id: 'points',       label: '🏆 Points & Leaderboard' },
  { id: 'certs',        label: '🎓 Certificates'   },
];

const RATING_COLORS = {
  EXCELLENT: 'text-amber-500',
  GOOD:      'text-green-500',
  POOR:      'text-red-400',
};

const STATUS_PILL = {
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  APPROVED:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyVolunteering() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [activeTab, setActiveTab] = useState('applications');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [applications, setApplications] = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [points,       setPoints]       = useState([]);
  const [certs,        setCerts]        = useState([]);
  const [eventNames,   setEventNames]   = useState({}); // eventId → title cache

  const [confirmModal,   setConfirmModal]   = useState({ open: false, taskId: null });
  const [certModal,      setCertModal]      = useState({ open: false, eventId: null });
  const [leaderboard,    setLeaderboard]    = useState({ open: false, eventId: null, status: '' });
  const [downloadingId,  setDownloadingId]  = useState(null);
  const [certRequesting, setCertRequesting] = useState(false);

  // ── Fetch all event names for a list of IDs ──────────────────────────────
  const enrichEventNames = useCallback(async (ids) => {
    const missing = ids.filter((id) => id && !eventNames[id]);
    if (!missing.length) return;
    const results = await Promise.allSettled(missing.map((id) => getEventById(id)));
    const newNames = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') newNames[missing[i]] = r.value?.title ?? missing[i];
      else newNames[missing[i]] = missing[i];
    });
    setEventNames((prev) => ({ ...prev, ...newNames }));
  }, [eventNames]);

  const eventName = (id) => eventNames[id] ?? id ?? '—';

  // ── Load data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, myTasks, myPoints, myCerts] = await Promise.all([
        getMyApplications(),
        getMyTasks(),
        getMyPoints(),
        getMyCertificates(),
      ]);
      setApplications(apps);
      setTasks(myTasks);
      setPoints(myPoints);
      setCerts(myCerts);

      // Collect all unique event IDs to fetch names
      const allIds = [
        ...new Set([
          ...apps.map((a) => a.eventId),
          ...myTasks.map((t) => t.eventId),
          ...myPoints.map((p) => p.eventId),
          ...myCerts.map((c) => c.eventId),
        ]),
      ];
      await enrichEventNames(allIds);
    } catch (err) {
      setError('Failed to load your volunteering data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      fetchData();
    } catch {
      alert('Failed to mark task as complete');
    }
  };

  const handleRequestCertificate = async (eventId) => {
    setCertRequesting(true);
    try {
      await requestCertificate(eventId);
      setCertModal({ open: false, eventId: null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to request certificate');
    } finally {
      setCertRequesting(false);
    }
  };

  const handleDownloadCert = async (certId) => {
    setDownloadingId(certId);
    try {
      await downloadCertificatePdf(certId);
    } catch {
      alert('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalPoints    = points.reduce((s, p) => s + (Number(p.points) || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const certsGenerated = certs.filter((c) => c.status === 'GENERATED').length;

  // ── Points grouped by event ───────────────────────────────────────────────
  const pointsByEvent = points.reduce((acc, p) => {
    if (!acc[p.eventId]) acc[p.eventId] = { eventId: p.eventId, total: 0, entries: [] };
    acc[p.eventId].total   += (Number(p.points) || 0);
    acc[p.eventId].entries.push(p);
    return acc;
  }, {});

  // ── UI ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading your volunteer hub...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Volunteering Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your applications, tasks, points, and certificates.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Stats Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Applications',    value: applications.length,   icon: '📋', color: 'from-blue-500 to-indigo-600' },
            { label: 'Tasks Done',      value: completedTasks,        icon: '✅', color: 'from-green-500 to-emerald-600' },
            { label: 'Total Points',    value: totalPoints,           icon: '⭐', color: 'from-amber-500 to-orange-500' },
            { label: 'Certificates',    value: certsGenerated,        icon: '🎓', color: 'from-violet-500 to-purple-600' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-sm opacity-80 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit py-2.5 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Commitment</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5">
                        <button
                          onClick={() => navigate(`/events/${app.eventId}`)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                        >
                          {eventName(app.eventId)}
                        </button>
                        <div className="text-xs text-slate-400 mt-0.5">{app.faculty}</div>
                      </td>
                      <td className="p-5 text-slate-600 dark:text-slate-400 font-medium">{app.category?.replace('_', ' ')}</td>
                      <td className="p-5 text-slate-600 dark:text-slate-400">{app.hoursType?.replace('_', ' ')}</td>
                      <td className="p-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_PILL[app.status] || 'bg-slate-100 text-slate-500'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-5 text-right text-slate-400 text-xs">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-400 italic">
                      No applications yet. Find an event and click "Volunteer for this Event"!
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="p-6 space-y-4">
              {tasks.length === 0 && (
                <div className="py-12 text-center text-slate-400 italic">
                  No tasks assigned yet. Tasks appear here once your application is approved and a duty is assigned.
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                      {task.taskDescription}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>📅 {eventName(task.eventId)}</span>
                      {task.completedAt && (
                        <span>· Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => setConfirmModal({ open: true, taskId: task.id })}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md shadow-green-500/20 transition-all flex items-center gap-1.5"
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                    {task.status === 'COMPLETED' && (
                      <span className="text-green-500 text-sm font-bold">Done!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* POINTS & LEADERBOARD TAB */}
          {activeTab === 'points' && (
            <div className="p-6 space-y-6">
              {/* Total points hero */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-sm opacity-80 font-semibold uppercase tracking-widest">Total Points Earned</div>
                  <div className="text-5xl font-black mt-1">{totalPoints}</div>
                </div>
                <div className="text-6xl">⭐</div>
              </div>

              {/* Points by event */}
              {Object.keys(pointsByEvent).length === 0 ? (
                <p className="text-slate-400 italic text-center py-8">
                  No points yet. Complete your assigned tasks to earn points!
                </p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Points by Event</h3>
                  {Object.values(pointsByEvent).map((grp) => (
                    <div key={grp.eventId} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {/* Event header */}
                      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{eventName(grp.eventId)}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{grp.entries.length} point award{grp.entries.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <PointsChip points={grp.total} />
                          <button
                            onClick={() => setLeaderboard({ open: true, eventId: grp.eventId, status: 'CLOSED' })}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/20 transition-all"
                          >
                            👑 Leaderboard
                          </button>
                        </div>
                      </div>
                      {/* Individual entries */}
                      <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {grp.entries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                            <div>
                              <span className={`text-xs font-bold uppercase ${RATING_COLORS[entry.rating] || 'text-slate-400'}`}>
                                {entry.rating} rating
                              </span>
                              <div className="text-[11px] text-slate-400">
                                {entry.awardedAt ? new Date(entry.awardedAt).toLocaleDateString() : '—'}
                              </div>
                            </div>
                            <PointsChip points={entry.points} size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certs' && (
            <div className="p-6 space-y-4">
              {certs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">
                  No certificates yet. Once you're in the top 10 of a closed event's leaderboard, you can request one!
                </div>
              ) : (
                certs.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">🎓</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {eventName(cert.eventId)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Requested: {cert.requestedAt ? new Date(cert.requestedAt).toLocaleDateString() : '—'}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cert.status === 'GENERATED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {cert.status === 'GENERATED' ? '✅ Approved' : '⏳ Pending Approval'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {cert.status === 'GENERATED' ? (
                      <button
                        onClick={() => handleDownloadCert(cert.id)}
                        disabled={downloadingId === cert.id}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                      >
                        {downloadingId === cert.id ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            Downloading...
                          </>
                        ) : (
                          '⬇️ Download PDF'
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-medium">
                        Awaiting club admin approval
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Complete Task Modal ───────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, taskId: null })}
        onConfirm={() => { handleCompleteTask(confirmModal.taskId); setConfirmModal({ open: false, taskId: null }); }}
        title="Mark Task as Complete?"
        message="Are you sure you have finished this task? The club admin will review and award points."
        confirmText="Yes, Complete It"
        type="info"
      />

      {/* ── Certificate Request Confirm ───────────────────────────────── */}
      <ConfirmModal
        isOpen={certModal.open}
        onClose={() => setCertModal({ open: false, eventId: null })}
        onConfirm={() => handleRequestCertificate(certModal.eventId)}
        title="Request Certificate?"
        message="This will send a certificate request to the club admin for approval. You can only request once per event."
        confirmText={certRequesting ? 'Requesting...' : 'Request Certificate'}
        type="info"
      />

      {/* ── Event Leaderboard Modal ───────────────────────────────────── */}
      <EventLeaderboard
        isOpen={leaderboard.open}
        onClose={() => setLeaderboard({ open: false, eventId: null, status: '' })}
        eventId={leaderboard.eventId}
        eventStatus={leaderboard.status}
      />
    </PageLayout>
  );
}
