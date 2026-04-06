import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Mini monthly calendar widget. No external library.
 * Props:
 *   upcomingEvents – array of { id, date (YYYY-MM-DD), title, ... }
 */
export default function CalendarWidget({ upcomingEvents = [] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [popoverDay, setPopoverDay] = useState(null);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setPopoverDay(null);
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setPopoverDay(null);
  }

  function getEventsForDay(day) {
    const target = new Date(year, month, day);
    return upcomingEvents.filter((e) => {
      const [ey, em, ed] = e.date.split('-').map(Number);
      return isSameDay(target, new Date(ey, em - 1, ed));
    });
  }

  // Build cell array: leading blanks + days of month
  const leadingBlanks = Array(firstDayOfWeek).fill(null);
  const dayNumbers    = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells         = [...leadingBlanks, ...dayNumbers];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      {/* Month/Year header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="text-gray-400 hover:text-gray-700 transition-colors px-1 text-lg leading-none"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-gray-700 transition-colors px-1 text-lg leading-none"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-gray-400 py-1">
            {d[0]}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} />;
          }

          const isToday      = isSameDay(new Date(year, month, day), today);
          const dayEvents    = getEventsForDay(day);
          const hasEvents    = dayEvents.length > 0;
          const isPopoverOpen = popoverDay === day;

          return (
            <div key={day} className="relative">
              <button
                className={`h-8 w-8 flex flex-col items-center justify-center mx-auto rounded-full text-xs transition-colors
                  ${isToday ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}
                  ${hasEvents && !isToday ? 'font-medium' : ''}
                  ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
                `}
                onClick={() => hasEvents && setPopoverDay(isPopoverOpen ? null : day)}
                aria-label={`${day} ${MONTHS[month]} ${year}${hasEvents ? ` – ${dayEvents.length} event(s)` : ''}`}
              >
                {day}
                {hasEvents && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-indigo-400'}`}
                  />
                )}
              </button>

              {/* Event popover */}
              {isPopoverOpen && (
                <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-left">
                  {dayEvents.map((e) => (
                    <div key={e.id} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0">
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-gray-400">{e.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
