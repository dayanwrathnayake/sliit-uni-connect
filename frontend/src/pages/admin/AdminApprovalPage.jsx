import React, { useState, useEffect } from 'react';
import { getPendingDeptEvents, getPendingFacultyEvents, approveByDept, approveByFaculty } from '../../api/eventService';
import { useAuthStore } from '../../store/authStore';
import PageLayout from '../../components/layout/PageLayout';

export default function AdminApprovalPage() {
  const { role } = useAuthStore();
  const [deptEvents, setDeptEvents] = useState([]);
  const [facultyEvents, setFacultyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  const isSA = role === 'SYSTEM_ADMIN' || role === 'ROLE_SYSTEM_ADMIN';
  const isDL = role === 'DEPT_LEADER' || role === 'ROLE_DEPT_LEADER' || isSA;
  const isFM = role === 'FACULTY_MANAGER' || role === 'ROLE_FACULTY_MANAGER' || isSA;

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [];
      if (isDL) promises.push(getPendingDeptEvents().then(setDeptEvents));
      if (isFM) promises.push(getPendingFacultyEvents().then(setFacultyEvents));
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleApprove = async (id, level) => {
    try {
      if (level === 'DEPT') await approveByDept(id, comment);
      else await approveByFaculty(id, comment);
      setComment('');
      fetchData();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const EventCard = ({ event, level }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{event.title}</h3>
          <p className="text-sm text-slate-500 font-medium">{event.type} • {event.venue}</p>
        </div>
        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">
          {event.status}
        </span>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
        {event.description || 'No description provided.'}
      </p>

      <div className="space-y-4">
        <textarea 
          placeholder="Add approval/rejection comments..."
          className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-2">
          <button 
            onClick={() => handleApprove(event.id, level)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-sm transition-all"
          >
            Approve
          </button>
          <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200">
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Approvals</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage pending event requests within your jurisdiction.</p>
        </div>

        {loading ? (
          <div className="p-10 text-center">Loading pending requests...</div>
        ) : (
          <div className="space-y-12">
            {isDL && (
              <section>
                <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs italic font-serif">DL</span>
                  Departmental Review
                </h2>
                {deptEvents.length === 0 ? (
                  <div className="text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">No pending departmental approvals</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deptEvents.map(e => <EventCard key={e.id} event={e} level="DEPT" />)}
                  </div>
                )}
              </section>
            )}

            {isFM && (
              <section>
                <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs italic font-serif">FM</span>
                  Faculty-Level Review
                </h2>
                {facultyEvents.length === 0 ? (
                  <div className="text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">No pending faculty approvals</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facultyEvents.map(e => <EventCard key={e.id} event={e} level="FACULTY" />)}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
