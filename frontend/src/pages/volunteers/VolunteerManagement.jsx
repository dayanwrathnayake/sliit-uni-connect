import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getManagedEvents } from '../../api/eventService';
import { 
  getEventApplications, 
  updateApplicationStatus, 
  assignTask, 
  awardPoints,
  approveCertificate 
} from '../../api/volunteerService';
import PageLayout from '../../components/layout/PageLayout';
import VolunteerBadge from '../../components/volunteers/VolunteerBadge';
import PointsChip from '../../components/volunteers/PointsChip';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function VolunteerManagement() {
  const { clubId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  
  const [applications, setApplications] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]); // In a real app, you might fetch specific lists
  
  const [taskModal, setTaskModal] = useState({ isOpen: false, application: null, description: '' });
  const [awardModal, setAwardModal] = useState({ isOpen: false, task: null, rating: 'GOOD' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const managed = await getManagedEvents();
        // Filter by club if necessary, but usually managed events for club admin are fine
        setEvents(managed);
        if (managed.length > 0) setSelectedEventId(managed[0].id);
      } catch (err) {
        console.error('Failed to fetch managed events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [clubId]);

  const fetchApplications = async () => {
    if (!selectedEventId) return;
    try {
      const apps = await getEventApplications(selectedEventId);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to fetch applications');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedEventId]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      fetchApplications();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssignTask = async () => {
    if (!taskModal.description.trim()) return;
    try {
      await assignTask(taskModal.application.id, taskModal.description);
      setTaskModal({ isOpen: false, application: null, description: '' });
      alert('Task assigned');
    } catch (err) {
      alert('Failed to assign task');
    }
  };

  const handleAwardPoints = async () => {
    const ratingPoints = { POOR: 10, GOOD: 20, EXCELLENT: 30 };
    try {
       // In this simplified view, we'd need the Task ID. 
       // For now, let's assume we have it or the UI provides it.
       await awardPoints(awardModal.task.id, ratingPoints[awardModal.rating], awardModal.rating);
       setAwardModal({ isOpen: false, task: null, rating: 'GOOD' });
       alert('Points awarded!');
    } catch (err) {
       alert('Failed to award points');
    }
  };

  if (loading) return <PageLayout><div className="p-10 text-center">Loading management dashboard...</div></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Volunteer Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Review applications and coordinate tasks for your club events.</p>
          </div>
          
          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Event</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
        </header>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1 mb-8 w-fit">
          {['applications', 'tasks', 'certificates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-6 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                        <div className="font-bold text-slate-900 dark:text-white">{app.registrationNumber}</div>
                        <div className="text-xs text-slate-400 font-mono italic">{app.faculty}</div>
                      </td>
                      <td className="p-5 space-y-1">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{app.category} • {app.hoursType}</div>
                        <div className="text-xs text-slate-500">Year {app.year} | Sem {app.semester}</div>
                      </td>
                      <td className="p-5 text-center"><VolunteerBadge status={app.status} /></td>
                      <td className="p-5 text-right">
                         {app.status === 'PENDING' && (
                           <div className="flex justify-end gap-2">
                              <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">✕</button>
                              <button onClick={() => handleStatusUpdate(app.id, 'APPROVED')} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all font-bold">Approve</button>
                           </div>
                         )}
                         {app.status === 'APPROVED' && (
                           <button 
                             onClick={() => setTaskModal({ isOpen: true, application: app, description: '' })}
                             className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                           >
                             Assign Task
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic">No applications found for this event.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tasks' && (
             <div className="p-10 text-center text-slate-500 italic">
                {/* Simplified: Management of specific tasks usually requires fetching by event */}
                Fetch and display tasks where application.eventId === selectedEventId...
                (Recommended to add GET /api/volunteers/event/{eventId}/tasks to backend if not exists)
             </div>
          )}

          {activeTab === 'certificates' && (
             <div className="p-10 text-center text-slate-500 italic">
                Manage certificate requests for the selected event.
             </div>
          )}
        </div>
      </div>

      {/* Task Assignment Modal */}
      {taskModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setTaskModal({ isOpen: false, application: null, description: '' })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assign Task</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Assigning to: <span className="text-blue-500">{taskModal.application?.registrationNumber}</span></p>
            
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Task Description</label>
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] mb-6"
              placeholder="e.g. Coordinate guest registration at front desk"
              value={taskModal.description}
              onChange={(e) => setTaskModal(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <div className="flex gap-3">
              <button onClick={() => setTaskModal({ isOpen: false, application: null, description: '' })} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
              <button onClick={handleAssignTask} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">Assign Now</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
