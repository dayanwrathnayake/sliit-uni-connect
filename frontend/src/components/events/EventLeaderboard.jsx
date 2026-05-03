import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getLeaderboard, requestCertificate } from '../../api/volunteerService';
import PointsChip from '../volunteers/PointsChip';

export default function EventLeaderboard({ eventId, eventStatus, isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(eventId);
        setLeaders(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, [eventId, isOpen]);

  const handleRequestCertificate = async () => {
    try {
      await requestCertificate(eventId);
      setHasRequested(true);
      alert('Certificate request submitted!');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Request failed');
    }
  };

  if (!isOpen) return null;

  const isEligible = leaders.some(l => l.userId === user?.userId);
  const showRequestBtn = eventStatus === 'CLOSED' && isEligible && !hasRequested;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-4xl">👑</span>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Volunteer Stars</h2>
              <p className="opacity-80 text-sm font-medium">Top contributors for this event</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="py-10 text-center text-slate-400 font-medium">Fetching top volunteers...</div>
          ) : (
            <div className="space-y-3">
              {leaders.map((leader, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    leader.userId === user?.userId 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs ${
                      index === 0 ? 'bg-amber-500 text-white shadow-lg' :
                      index === 1 ? 'bg-slate-300 text-slate-700' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white">
                       {leader.userId === user?.userId ? 'You' : `${leader.userName || 'Unknown'} (${leader.userStudentId || leader.userId.substring(0, 5)})`}
                    </div>
                  </div>
                  <PointsChip points={leader.points} size="sm" />
                </div>
              ))}
              
              {leaders.length === 0 && (
                <div className="py-10 text-center text-slate-400 italic">No points awarded yet.</div>
              )}
            </div>
          )}

          {showRequestBtn && (
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
              <p className="text-indigo-700 dark:text-indigo-400 text-sm font-bold mb-4">🏆 Congratulations! You're in the top 10.</p>
              <button 
                onClick={handleRequestCertificate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-500/30 transition-all"
              >
                Request My Certificate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
