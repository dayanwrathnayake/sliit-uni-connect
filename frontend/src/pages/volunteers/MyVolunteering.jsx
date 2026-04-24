import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  getMyApplications, 
  getMyTasks, 
  getMyCertificates, 
  getMyPoints, 
  completeTask,
  requestCertificate 
} from '../../api/volunteerService';
import PageLayout from '../../components/layout/PageLayout';
import VolunteerBadge from '../../components/volunteers/VolunteerBadge';
import PointsChip from '../../components/volunteers/PointsChip';
import VolunteerStats from '../../components/volunteers/VolunteerStats';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function MyVolunteering() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('applications');
  const [data, setData] = useState({
    applications: [],
    tasks: [],
    pointsHistory: [],
    certificates: []
  });
  const [stats, setStats] = useState({
    totalPoints: 0,
    completedTasks: 0,
    certificatesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, taskId: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apps, tasks, pts, certs] = await Promise.all([
        getMyApplications(),
        getMyTasks(),
        getMyPoints(),
        getMyCertificates()
      ]);
      
      setData({
        applications: apps,
        tasks: tasks,
        pointsHistory: pts,
        certificates: certs
      });

      // Calculate stats locally or fetch from extra endpoint
      setStats({
        totalPoints: pts.reduce((acc, p) => acc + p.points, 0),
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        certificatesCount: certs.filter(c => c.status === 'GENERATED').length
      });
    } catch (err) {
      console.error('Failed to fetch volunteer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      fetchData();
    } catch (err) {
      alert('Failed to complete task');
    }
  };

  const handleRequestCertificate = async (eventId) => {
    try {
      await requestCertificate(eventId);
      alert('Certificate requested successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request certificate');
    }
  };

  if (loading) return <PageLayout><div className="p-10 text-center">Loading dashboard...</div></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">My Volunteering Hub</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your applications, tasks, and earned certificates in one place.</p>
        </header>

        <VolunteerStats stats={stats} />

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 mb-8">
          {['applications', 'tasks', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
          {activeTab === 'applications' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Commitment</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5 font-bold text-slate-900 dark:text-white">{app.eventId /* Ideally fetch event title */}</td>
                      <td className="p-5 text-slate-600 dark:text-slate-400">{app.category}</td>
                      <td className="p-5 text-slate-600 dark:text-slate-400 font-medium">{app.hoursType.replace('_', ' ')}</td>
                      <td className="p-5 text-center"><VolunteerBadge status={app.status} /></td>
                      <td className="p-5 text-right text-slate-400 text-xs">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data.applications.length === 0 && (
                    <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Task</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5 font-bold text-slate-900 dark:text-white">{task.taskDescription}</td>
                      <td className="p-5 text-slate-500">{task.eventId}</td>
                      <td className="p-5 text-center"><VolunteerBadge status={task.status} /></td>
                      <td className="p-5 text-right">
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                          >
                            Mark Complete
                          </button>
                        )}
                        {task.status === 'COMPLETED' && <span className="text-slate-400 text-xs italic">Finished</span>}
                      </td>
                    </tr>
                  ))}
                  {data.tasks.length === 0 && (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic">No tasks assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Points History</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.pointsHistory.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">{p.rating} RATING</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{new Date(p.awardedAt).toLocaleDateString()}</div>
                      </div>
                      <PointsChip points={p.points} />
                    </div>
                  ))}
                  {data.pointsHistory.length === 0 && <p className="text-slate-500 text-sm italic col-span-full">No points earned yet.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">My Certificates</h3>
                <div className="space-y-3">
                  {data.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="text-2xl">🎓</div>
                         <div>
                            <div className="font-bold text-slate-900 dark:text-white">Volunteer Certificate</div>
                            <div className="text-xs text-slate-400">Status: <span className="font-bold text-blue-500">{cert.status}</span></div>
                         </div>
                      </div>
                      {cert.status === 'GENERATED' ? (
                        <a 
                          href={cert.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">Processing</span>
                      )}
                    </div>
                  ))}
                  {data.certificates.length === 0 && <p className="text-slate-500 text-sm italic">No certificates requested.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, taskId: null })}
        onConfirm={() => handleCompleteTask(confirmModal.taskId)}
        title="Mark Task as Complete?"
        message="Are you sure you have finished this task? This action cannot be undone."
        confirmText="Yes, Complete"
        type="info"
      />
    </PageLayout>
  );
}
