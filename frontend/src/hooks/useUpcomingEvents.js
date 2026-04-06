import { useState, useEffect } from 'react';

const MOCK_EVENTS = [
  {
    id: 'mock1',
    title: 'SLIIT Freshers Night 2025',
    date: '2025-07-15',
    time: '6:00 PM',
    location: 'SLIIT Main Hall',
    category: 'Orientation',
    color: 'indigo',
  },
  {
    id: 'mock2',
    title: 'IEEE Robotics Workshop',
    date: '2025-07-22',
    time: '9:00 AM',
    location: 'FOC Lab 3',
    category: 'Workshop',
    color: 'blue',
  },
  {
    id: 'mock3',
    title: 'Computing Faculty Sports Meet',
    date: '2025-08-02',
    time: '8:00 AM',
    location: 'SLIIT Grounds',
    category: 'Sports',
    color: 'green',
  },
  {
    id: 'mock4',
    title: 'Hack SLIIT 2025',
    date: '2025-08-10',
    time: 'All Day',
    location: 'FOC Auditorium',
    category: 'Hackathon',
    color: 'purple',
  },
  {
    id: 'mock5',
    title: 'UNI-Connect Launch Event',
    date: '2025-08-20',
    time: '3:00 PM',
    location: 'Main Auditorium',
    category: 'Special',
    color: 'coral',
  },
];

/**
 * Returns upcoming events.
 *
 * ── SWAP POINT ──────────────────────────────────────────────────────────────
 * When Member 2's Events API is ready, remove the mock setTimeout block and
 * replace it with:
 *
 *   import api from '../api/axios';
 *   const { data } = await api.get('/api/events/upcoming?limit=5');
 *   setEvents(data);
 *
 * ────────────────────────────────────────────────────────────────────────────
 */
export function useUpcomingEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Simulate a 300 ms API delay
    const timer = setTimeout(() => {
      if (!cancelled) {
        setEvents(MOCK_EVENTS);
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return { events, loading };
}

export default useUpcomingEvents;
