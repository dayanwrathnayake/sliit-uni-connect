import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, registerForEvent, unregisterFromEvent, submitForApproval, closeEvent, deleteEvent } from '../api/eventService';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import ChatDrawer from '../components/chat/ChatDrawer';
import { getMyApplications } from '../api/volunteerService';
import EventLeaderboard from '../components/events/EventLeaderboard';
import CreateEventForm from '../components/events/CreateEventForm';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role, userType } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchEvent = async () => {
    try {
      const data = await getEventById(id);
      setEvent(data);
      
      // Check volunteer application status — only for regular students, not club admins
      if (userId && role !== 'CLUB_ADMIN') {
        const apps = await getMyApplications();
        const hasApplied = apps.some(app => app.eventId === id);
        setIsApplied(hasApplied);
      }
    } catch (err) {
      setError('Event not found or failed to load');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setIsRefreshing(true);
    try {
      await registerForEvent(id);
      await fetchEvent();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
      setIsRefreshing(false);
    }
  };

  const handleUnregister = async () => {
    setIsRefreshing(true);
    try {
      await unregisterFromEvent(id);
      await fetchEvent();
    } catch (err) {
      alert('Failed to unregister');
      setIsRefreshing(false);
    }
  };

  const handleSubmitApproval = async () => {
    setIsRefreshing(true);
    try {
      await submitForApproval(id);
      await fetchEvent();
    } catch (err) {
      alert('Failed to submit for approval');
      setIsRefreshing(false);
    }
  };

  const handleCloseEvent = async () => {
    if (!window.confirm('Are you sure you want to close this event? It cannot be re-opened.')) return;
    setIsRefreshing(true);
    try {
      await closeEvent(id);
      await fetchEvent();
      alert('Event closed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close event');
      setIsRefreshing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this event? This is permanent.')) return;
    setIsRefreshing(true);
    try {
      await deleteEvent(id);
      alert('Event deleted successfully!');
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
      setIsRefreshing(false);
    }
  };

  if (loading) return <PageLayout><div className="p-10 text-center">Loading event...</div></PageLayout>;
  if (error) return <PageLayout><div className="p-10 text-center text-red-500">{error}</div></PageLayout>;

  const isCreator = event.createdBy === userId;
  const isRegistered = event.registeredUserIds?.includes(userId);
  const canRegister = event.status === 'PUBLISHED' && !isRegistered;
  const isFull = event.registeredCount >= event.capacity;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          {event.imageUrl ? (
            <div className="h-64 w-full relative">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end">
                <h1 className="text-3xl font-bold text-white p-6 pb-8">{event.title}</h1>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white">
               <div className="text-center">
                  <span className="text-6xl mb-2 block">📅</span>
                  <h1 className="text-3xl font-bold px-4">{event.title}</h1>
               </div>
            </div>
          )}

          <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {event.type}
                </span>
                <h2 className="text-slate-500 dark:text-slate-400 text-sm mt-2 flex items-center gap-2">
                   📍 {event.venue}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {event.registeredCount} / {event.capacity}
                </div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Registered</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this Event</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Event Schedule</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-blue-500 font-bold uppercase">Starts</div>
                    <div className="text-lg text-slate-900 dark:text-white font-semibold">
                      {new Date(event.startDate).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-red-500 font-bold uppercase">Ends</div>
                    <div className="text-lg text-slate-900 dark:text-white font-semibold">
                      {new Date(event.endDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              {/* Event Registration (Attendee) — hidden for the event creator (they own it) */}
              {canRegister && !isFull && !isCreator && (
                <button
                  onClick={handleRegister}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  Join Event
                </button>
              )}
              {isRegistered && !isCreator && (
                <button
                  onClick={handleUnregister}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-white hover:text-red-600 transition-all font-bold rounded-xl disabled:opacity-50"
                >
                  Cancel Registration
                </button>
              )}

              {/* Volunteering Actions — hidden only for the event creator (they manage, not volunteer) */}
              {!isCreator && event.status === 'PUBLISHED' && !isApplied && (event.facultyScope === 'ALL_FACULTIES' || event.faculty === useAuthStore.getState().faculty) && (
                <button
                  onClick={() => navigate(`/volunteer/apply/${id}`)}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                >
                  🤝 Volunteer for this Event
                </button>
              )}
              
              {!isCreator && isApplied && (
                 <div className="flex items-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold rounded-xl border border-green-100 dark:border-green-800">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Applied to volunteer
                 </div>
              )}

              {/* Event Creator (Club Admin) — link to their volunteer management dashboard */}
              {isCreator && event.status === 'PUBLISHED' && (
                <button
                  onClick={() => navigate(`/club/${event.clubId}/volunteer-management`)}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2"
                >
                  🛠️ Manage Volunteers
                </button>
              )}

              {event.status === 'CLOSED' && (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
                >
                  👑 Volunteer Leaderboard
                </button>
              )}

              {isCreator && event.status === 'DRAFT' && (
                <button
                  onClick={handleSubmitApproval}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
                >
                  Submit for Approval
                </button>
              )}

              {/* Update Event — creator only */}
              {isCreator && (
                <button
                  onClick={() => setShowUpdateModal(true)}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  ✏️ Update Event
                </button>
              )}

              {/* Close Event — creator only */}
              {isCreator && event.status !== 'CLOSED' && event.status !== 'DRAFT' && (
                <button
                  onClick={handleCloseEvent}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  🛑 Close Event
                </button>
              )}

              {/* Delete Event — creator only, after closed */}
              {isCreator && event.status === 'CLOSED' && (
                <button
                  onClick={handleDeleteEvent}
                  disabled={isRefreshing}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
                >
                  🗑️ Delete Event
                </button>
              )}
              
              <div className="ml-auto flex items-center gap-4">
                 <span className={`px-4 py-2 rounded-lg text-xs font-bold ${
                   event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                   event.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                 }`}>
                   {event.status}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Community Chat for Event */}
      <ChatDrawer eventId={event.id} eventName={event.title} />

      {/* Volunteer Leaderboard Modal */}
      <EventLeaderboard 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        eventId={event.id}
        eventStatus={event.status}
      />

      {/* Update Event Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <CreateEventForm 
             initialData={event}
             onSuccess={() => { setShowUpdateModal(false); fetchEvent(); }}
             onCancel={() => setShowUpdateModal(false)}
           />
        </div>
      )}
    </PageLayout>
  );
}
