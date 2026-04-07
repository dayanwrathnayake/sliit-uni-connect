import { Link } from 'react-router-dom';

const COLOR_MAP = {
  indigo: { block: 'bg-indigo-500 text-white',   badge: 'bg-indigo-50 text-indigo-600 ring-indigo-200' },
  blue:   { block: 'bg-blue-500 text-white',     badge: 'bg-blue-50 text-blue-600 ring-blue-200' },
  green:  { block: 'bg-emerald-500 text-white',  badge: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  purple: { block: 'bg-purple-500 text-white',   badge: 'bg-purple-50 text-purple-600 ring-purple-200' },
  coral:  { block: 'bg-orange-500 text-white',   badge: 'bg-orange-50 text-orange-600 ring-orange-200' },
};

function formatDateBlock(dateStr) {
  const [, month, day] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { day: parseInt(day, 10), month: months[parseInt(month, 10) - 1] };
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="h-11 w-11 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

/**
 * Upcoming events sidebar widget — redesigned with vibrant date blocks.
 */
export default function UpcomingEventsWidget({ events = [], loading }) {
  const colors = (color) => COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upcoming Events
        </h3>
        <Link
          to="/events"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="divide-y divide-gray-50">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-10 w-10 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-sm text-gray-400">No upcoming events</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.slice(0, 5).map((event) => {
              const { day, month } = formatDateBlock(event.date);
              const c = colors(event.color);
              return (
                <div key={event.id} className="flex items-start gap-3 py-3 group">
                  {/* Date block */}
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center shadow-sm ${c.block}`}
                  >
                    <span className="text-base font-bold leading-none">{day}</span>
                    <span className="text-[9px] font-semibold uppercase leading-none mt-0.5 opacity-90">{month}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.time} &middot; {event.location}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ${c.badge}`}
                    >
                      {event.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
