import { Link } from 'react-router-dom';

const COLOR_MAP = {
  indigo: { block: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400', badge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  blue:   { block: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',         badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  green:  { block: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',     badge: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  purple: { block: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400', badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  coral:  { block: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400', badge: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
};

function formatDateBlock(dateStr) {
  const [, month, day] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { day: parseInt(day, 10), month: months[parseInt(month, 10) - 1] };
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function UpcomingEventsWidget({ events = [], loading }) {
  const colors = (color) => COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Upcoming Events</h3>
        <Link to="/events" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-1 divide-y divide-gray-50 dark:divide-slate-700">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No upcoming events</p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {events.slice(0, 3).map((event) => {
            const { day, month } = formatDateBlock(event.date);
            const c = colors(event.color);
            return (
              <div key={event.id} className="flex items-start gap-3 py-2.5">
                <div className={`flex-shrink-0 w-10 rounded-lg flex flex-col items-center justify-center py-1 ${c.block}`}>
                  <span className="text-base font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-medium uppercase leading-none mt-0.5">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {event.time} · {event.location}
                  </p>
                  <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}>
                    {event.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
