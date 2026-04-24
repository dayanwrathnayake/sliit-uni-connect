import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isClubAdmin } from '../../utils/roles';
import { getAllClubs } from '../../api/clubApi';
import api from '../../api/axios';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeCard() {
  const store = useAuthStore();
  const navigate = useNavigate();
  const { displayName, profilePicUrl, faculty, userId } = store;
  const firstLetter = (displayName || '?')[0].toUpperCase();
  const [loadingClub, setLoadingClub] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/users/${userId}/profile`)
      .then(({ data }) => setStudentId(data.studentId))
      .catch(() => {});
  }, [userId]);

  async function handleMyClub() {
    setLoadingClub(true);
    try {
      const clubs = await getAllClubs();
      const myClub = clubs.find((c) => c.isAdmin === true);
      if (myClub) navigate(`/clubs/${myClub.id}`);
    } finally {
      setLoadingClub(false);
    }
  }

  const facultyLabel = {
    COMPUTING:              'Computing',
    ENGINEERING:            'Engineering',
    BUSINESS:               'Business',
    HUMANITIES_AND_SCIENCE: 'Humanities & Science',
  }[faculty] ?? faculty;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-800 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40 p-6">
      {/* Greeting */}
      <div className="mb-3">
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">{getGreeting()}</p>
      </div>

      {/* Profile row */}
      <div className="flex items-center gap-3 mb-4">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={displayName}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0">
            <span className="text-2xl font-bold text-white">{firstLetter}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-lg font-semibold text-gray-800 dark:text-slate-100 truncate">{displayName}</p>
          {studentId && (
            <p className="text-sm font-mono font-medium text-indigo-500 dark:text-white truncate">{studentId}</p>
          )}
          {facultyLabel && (
            <span className="inline-block text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full px-2 py-0.5 mt-0.5">
              {facultyLabel}
            </span>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-2">
        <Link
          to="/profile/me"
          className="flex-1 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-indigo-100 dark:border-slate-600 rounded-lg py-2 transition-colors"
        >
          My Profile
        </Link>
        {isClubAdmin(store) ? (
          <button
            onClick={handleMyClub}
            disabled={loadingClub}
            className="flex-1 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-indigo-100 dark:border-slate-600 rounded-lg py-2 transition-colors disabled:opacity-60"
          >
            {loadingClub ? '…' : 'My Club'}
          </button>
        ) : (
          <Link
            to="/clubs?filter=following"
            className="flex-1 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-indigo-100 dark:border-slate-600 rounded-lg py-2 transition-colors"
          >
            My Club
          </Link>
        )}
        <Link
          to="/notifications"
          className="flex-1 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-indigo-100 dark:border-slate-600 rounded-lg py-2 transition-colors"
        >
          Alerts
        </Link>
      </div>
    </div>
  );
}
