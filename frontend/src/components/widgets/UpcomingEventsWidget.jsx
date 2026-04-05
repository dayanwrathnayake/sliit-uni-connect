import { Link } from 'react-router-dom';

const COLOR_MAP = {
  indigo: { block: 'bg-indigo-100 text-indigo-700', badge: 'bg-indigo-50 text-indigo-600' },
  blue:   { block: 'bg-blue-100 text-blue-700',     badge: 'bg-blue-50 text-blue-600' },
  green:  { block: 'bg-green-100 text-green-700',   badge: 'bg-green-50 text-green-600' },
  purple: { block: 'bg-purple-100 text-purple-700', badge: 'bg-purple-50 text-purple-600' },
  coral:  { block: 'bg-orange-100 text-orange-700', badge: 'bg-orange-50 text-orange-600' },
};

function formatDateBlock(dateStr) {
  const [, month, day] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { day: parseInt(day, 10), month: months[parseInt(month, 10) - 1] };
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

/**
 * Upcoming events sidebar widget.
 * Props:
 *   events  – array from useUpcomingEvents
 *   loading – boolean
 */
export default function UpcomingEventsWidget({ events = [], loading }) {
  const colors = (color) => COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Upcoming Events</h3>
        <Link
          to="/events"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-1 divide-y divide-gray-50">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {events.slice(0, 5).map((event) => {
            const { day, month } = formatDateBlock(event.date);
            const c = colors(event.color);
            return (
              <div key={event.id} className="flex items-start gap-3 py-2.5">
                {/* Date block */}
                <div
                  className={`flex-shrink-0 w-10 rounded-lg flex flex-col items-center justify-center py-1 ${c.block}`}
                >
                  <span className="text-base font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-medium uppercase leading-none mt-0.5">{month}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {event.time} · {event.location}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}
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
  );
}
