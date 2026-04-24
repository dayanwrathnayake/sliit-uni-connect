import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendarEvents } from '../api/eventService';
import PageLayout from '../components/layout/PageLayout';
import CreateEventForm from '../components/events/CreateEventForm';

export default function CalendarView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    facultyId: '',
    departmentId: '',
    clubId: ''
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getCalendarEvents(year, month, filters);
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [year, month, filters]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

  const getEventsForDay = (day) => {
    return events.filter(e => {
      const d = new Date(e.startDate);
      return d.getDate() === day && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">University Calendar</h1>
            <p className="text-slate-500 text-sm mt-1">Discover workshops, sports, and cultural events.</p>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => setShowCreateModal(true)}
               className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm"
             >
               + Create Event
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center">
            <span className="text-sm font-bold text-slate-400 mr-2 uppercase tracking-widest">Filter:</span>
            <select 
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none"
                value={filters.facultyId}
                onChange={(e) => setFilters({...filters, facultyId: e.target.value})}
            >
                <option value="">All Faculties</option>
                <option value="COMPUTING">Computing</option>
                <option value="BUSINESS">Business</option>
                <option value="ENGINEERING">Engineering</option>
            </select>
            <input 
                type="text" 
                placeholder="Search Club..."
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none"
                onChange={(e) => setFilters({...filters, clubId: e.target.value})}
            />
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">◀</button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">▶</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 p-2 border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/10"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();

              return (
                <div key={day} className={`h-32 p-2 border-b border-r border-slate-100 dark:border-slate-800 min-w-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                  <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{day}</div>
                  <div className="space-y-1 overflow-y-auto max-h-24 scrollbar-hide">
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        onClick={() => navigate(`/events/${e.id}`)}
                        className={`text-[10px] p-1 px-2 rounded truncate cursor-pointer hover:scale-105 transition-transform font-semibold border ${e.status === 'PUBLISHED' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 border-dashed'}`}
                        title={e.title + (e.status === 'PUBLISHED' ? '' : ' (Pending/Draft)')}
                      >
                        {e.status !== 'PUBLISHED' && <span className="mr-1">⏳</span>}
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <CreateEventForm 
             onSuccess={(newEvent) => { setShowCreateModal(false); if(newEvent?.id) navigate(`/events/${newEvent.id}`); else window.location.reload(); }}
             onCancel={() => setShowCreateModal(false)}
           />
        </div>
      )}
    </PageLayout>
  );
}
