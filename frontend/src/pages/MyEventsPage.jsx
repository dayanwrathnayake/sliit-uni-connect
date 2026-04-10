import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyEvents, getManagedEvents } from '../api/eventService';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import CreateEventForm from '../components/events/CreateEventForm';

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { userType } = useAuthStore();
  const [activeTab, setActiveTab] = useState('joined');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'joined') {
        const data = await getMyEvents();
        setEvents(data);
      } else {
        const data = await getManagedEvents();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const StatusBadge = ({ status }) => {
    const styles = {
      DRAFT: 'bg-slate-100 text-slate-600',
      PENDING_DEPT: 'bg-orange-100 text-orange-600',
      PENDING_FACULTY: 'bg-purple-100 text-purple-600',
      PUBLISHED: 'bg-green-100 text-green-600',
      REJECTED: 'bg-red-100 text-red-600'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Events Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your registrations and club events.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
               <button 

               onClick={() => setActiveTab('joined')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'joined' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
             >
               Joined Events
             </button>
             <button 
               onClick={() => setActiveTab('managed')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'managed' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
             >
               Managed Events
             </button>
            </div>
            {activeTab === 'managed' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm"
              >
                + Create Event
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your events...</div>
        ) : events.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
             <div className="text-5xl mb-4">{activeTab === 'joined' ? '🎫' : '📢'}</div>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">
               {activeTab === 'joined' ? 'No registrations found' : 'No managed events found'}
             </h2>
             <p className="text-slate-500 mt-2 mb-6">
               {activeTab === 'joined' 
                 ? "You hasn't registered for any events yet." 
                 : "You haven't created any events for your club yet."}
             </p>
             <button 
               onClick={() => navigate(activeTab === 'joined' ? '/events' : '/events')}
               className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
             >
               {activeTab === 'joined' ? 'Explore Events' : 'Back to Calendar'}
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div 
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                    {event.type}
                  </span>
                  {activeTab === 'managed' && <StatusBadge status={event.status} />}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                <div className="space-y-2 text-sm text-slate-500">
                   <div className="flex items-center gap-2">
                     <span>📅</span> {new Date(event.startDate).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2">
                     <span>📍</span> {event.venue}
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                     {activeTab === 'joined' ? 'Registered ✓' : 'View Details →'}
                   </span>
                   <span className="text-xs text-slate-400">{event.registeredCount} going</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <CreateEventForm 
             onSuccess={() => { setShowCreateModal(false); fetchData(); }}
             onCancel={() => setShowCreateModal(false)}
           />
        </div>
      )}
    </PageLayout>
  );
}
