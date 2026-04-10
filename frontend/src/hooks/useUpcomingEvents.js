import { useState, useEffect } from 'react';
import { getUpcomingEvents } from '../api/eventService';

/**
 * Returns upcoming events from the real API.
 */
export function useUpcomingEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await getUpcomingEvents(5);
      const data = response.content || response; // Handle both paginated and flat list
      // Map API fields to the widget's expected format if different
      const formatted = data.map(e => ({
        id: e.id,
        title: e.title,
        date: new Date(e.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(e.startDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        location: e.venue,
        category: e.type.replace('_', ' '),
        color: e.type === 'CLUB_EVENT' ? 'blue' : 'indigo'
      }));
      setEvents(formatted);
    } catch (err) {
      console.error('Failed to fetch upcoming events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, refresh: fetchEvents };
}

export default useUpcomingEvents;
