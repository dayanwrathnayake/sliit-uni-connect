import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getManagedEvents } from '../../api/eventService';
import {
  getEventApplications,
  updateApplicationStatus,
  assignTask,
  awardPoints,
  approveCertificate,
  getEventTasks,
  getEventCertificateRequests,
} from '../../api/volunteerService';
import PageLayout from '../../components/layout/PageLayout';
import VolunteerBadge from '../../components/volunteers/VolunteerBadge';
import PointsChip from '../../components/volunteers/PointsChip';

// ── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'applications', label: '👥 Applications' },
  { id: 'tasks',        label: '📋 Tasks & Points' },
  { id: 'certificates', label: '🎓 Certificates'   },
];

const RATING_OPTIONS = [
  { label: '😔 Poor',      value: 'POOR',      points: 10, color: 'bg-red-500 hover:bg-red-600 shadow-red-500/30'       },
  { label: '👍 Good',      value: 'GOOD',      points: 20, color: 'bg-green-500 hover:bg-green-600 shadow-green-500/30' },
  { label: '🌟 Excellent', value: 'EXCELLENT', points: 30, color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function VolunteerManagement() {
  const { clubId } = useParams();

  const [events,          setEvents]          = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [activeTab,       setActiveTab]       = useState('applications');
  const [loading,         setLoading]         = useState(true);

  const [applications, setApplications] = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [certRequests, setCertRequests] = useState([]);

  const [subLoading, setSubLoading] = useState(false);

  // Task assign modal
  const [taskModal,  setTaskModal]  = useState({ open: false, app: null, description: '' });
  // Award points modal
  const [awardModal, setAwardModal] = useState({ open: false, task: null });

  // ── Load events ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const managed = await getManagedEvents();
        setEvents(managed);
        if (managed.length > 0) setSelectedEventId(managed[0].id);
      } catch (e) {
        console.error('Failed to load managed events', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId]);

  // ── Load tab data whenever event or tab changes ───────────────────────────
  const refreshTabData = useCallback(async () => {
    if (!selectedEventId) return;
    setSubLoading(true);
    try {
      if (activeTab === 'applications') {
        setApplications(await getEventApplications(selectedEventId));
      } else if (activeTab === 'tasks') {
        setTasks(await getEventTasks(selectedEventId));
      } else if (activeTab === 'certificates') {
        setCertRequests(await getEventCertificateRequests(selectedEventId));
      }
    } catch (e) {
      console.error('Failed to load tab data', e);
    } finally {
      setSubLoading(false);
    }
  }, [selectedEventId, activeTab]);

  useEffect(() => { refreshTabData(); }, [refreshTabData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status) => {
    try { await updateApplicationStatus(id, status); refreshTabData(); }
    catch { alert('Failed to update status'); }
  };

  const handleAssignTask = async () => {
    if (!taskModal.description.trim()) return;
    try {
      await assignTask(taskModal.app.id, taskModal.description);
      setTaskModal({ open: false, app: null, description: '' });
      refreshTabData();
    } catch { alert('Failed to assign task'); }
  };

  const handleAwardPoints = async (task, rating, points) => {
    try {
      await awardPoints(task.id, points, rating);
      setAwardModal({ open: false, task: null });
      refreshTabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to award points');
    }
  };

  const handleApproveCert = async (id) => {
    try { await approveCertificate(id); refreshTabData(); }
    catch { alert('Failed to approve certificate'); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const pendingApps    = applications.filter((a) => a.status === 'PENDING');
  const approvedApps   = applications.filter((a) => a.status === 'APPROVED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const pendingTasks   = tasks.filter((t) => t.status === 'PENDING');

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading management dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              🛠️ Volunteer Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review applications, assign duties, award points, and issue certificates.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            >
              {events.length === 0 && <option>No events found</option>}
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        </header>

        {/* ── Summary Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Apps',  value: pendingApps.length,    icon: '⏳', color: 'from-amber-500 to-orange-500'    },
            { label: 'Approved',      value: approvedApps.length,   icon: '✅', color: 'from-green-500 to-emerald-600'   },
            { label: 'Tasks Active',  value: pendingTasks.length,   icon: '📋', color: 'from-blue-500 to-indigo-600'     },
            { label: 'Tasks Done',    value: completedTasks.length, icon: '🌟', color: 'from-violet-500 to-purple-600'   },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-sm opacity-80 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-6 rounded-xl text-sm font-bold capitalize transition-all ${
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
          {subLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── APPLICATIONS TAB ─────────────────────────────────── */}
              {activeTab === 'applications' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Volunteer</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-5">
                            <div className="font-bold text-slate-900 dark:text-white">{app.userName || 'Unknown User'}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{app.userStudentId || app.registrationNumber || app.userId?.substring(0, 8)} | {app.faculty}</div>
                          </td>
                          <td className="p-5 space-y-0.5">
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {app.category?.replace('_', ' ')} · {app.hoursType?.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-slate-500">Year {app.year} | Sem {app.semester}</div>
                            {app.description && (
                              <div className="text-xs text-slate-400 italic">"{app.description}"</div>
                            )}
                          </td>
                          <td className="p-5 text-center">
                            <VolunteerBadge status={app.status} />
                          </td>
                          <td className="p-5 text-right">
                            {app.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                  className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-red-200 dark:border-red-800"
                                >
                                  ✕ Reject
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                                  className="px-3 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md shadow-green-500/20 transition-all"
                                >
                                  ✓ Approve
                                </button>
                              </div>
                            )}
                            {app.status === 'APPROVED' && (
                              <button
                                onClick={() => setTaskModal({ open: true, app, description: '' })}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/20 transition-all"
                              >
                                📋 Assign Task
                              </button>
                            )}
                            {app.status === 'REJECTED' && (
                              <span className="text-xs text-slate-400 italic">Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">
                          No applications for this event yet.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── TASKS TAB ────────────────────────────────────────── */}
              {activeTab === 'tasks' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Volunteer</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Task</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Award Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {tasks.map((task) => (
                        <tr key={task.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${task.status === 'COMPLETED' ? 'bg-green-50/30 dark:bg-green-900/5' : ''}`}>
                          <td className="p-5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {task.userName || 'Unknown User'}
                            </div>
                            <div className="font-mono text-xs text-slate-500 mt-0.5">
                              {task.userStudentId || task.assignedTo?.substring(0, 8)}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {task.taskDescription}
                            </div>
                            {task.completedAt && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                Completed: {new Date(task.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              task.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            {task.status === 'COMPLETED' ? (
                              <button
                                onClick={() => setAwardModal({ open: true, task })}
                                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-500/20 transition-all"
                              >
                                ⭐ Award Points
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Waiting for volunteer</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {tasks.length === 0 && (
                        <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">
                          No tasks assigned yet. Approve an application first, then assign tasks.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── CERTIFICATES TAB ─────────────────────────────────── */}
              {activeTab === 'certificates' && (
                <div className="p-6 space-y-4">
                  {certRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic">
                      No certificate requests for this event yet.
                    </div>
                  ) : (
                    certRequests.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            🎓 Certificate Request
                          </div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                            {cert.userName || 'Unknown User'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            ID: <span className="font-mono">{cert.userStudentId || cert.userId?.substring(0, 8)}</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Requested: {cert.requestedAt ? new Date(cert.requestedAt).toLocaleDateString() : '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            cert.status === 'GENERATED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {cert.status === 'GENERATED' ? '✅ Issued' : '⏳ Pending'}
                          </span>
                          {cert.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveCert(cert.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/20 transition-all"
                            >
                              ✅ Approve & Issue
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Assign Task Modal ─────────────────────────────────────────── */}
      {taskModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setTaskModal({ open: false, app: null, description: '' })}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Assign Duty</h3>
            <p className="text-sm text-slate-500 mb-6">
              Volunteer: <span className="text-indigo-500 font-bold">{taskModal.app?.registrationNumber}</span>
              &nbsp;·&nbsp; {taskModal.app?.category?.replace('_', ' ')}
            </p>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Task Description</label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[110px] mb-6 text-sm"
              placeholder="e.g. Coordinate guest registration at the main entrance"
              value={taskModal.description}
              onChange={(e) => setTaskModal((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setTaskModal({ open: false, app: null, description: '' })}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={!taskModal.description.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                Assign Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Award Points Modal ────────────────────────────────────────── */}
      {awardModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setAwardModal({ open: false, task: null })}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Rate Volunteer's Work</h3>
            <p className="text-sm text-slate-500 mb-1">Task: <span className="font-semibold text-slate-700 dark:text-slate-300">{awardModal.task?.taskDescription}</span></p>
            <p className="text-xs text-slate-400 mb-8">Select a rating to automatically award the matching points.</p>

            <div className="space-y-3 mb-6">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAwardPoints(awardModal.task, opt.value, opt.points)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-white font-bold shadow-lg ${opt.color} transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <span className="text-base">{opt.label}</span>
                  <span className="text-lg font-black">+{opt.points} pts</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setAwardModal({ open: false, task: null })}
              className="w-full py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
