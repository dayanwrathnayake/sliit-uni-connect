import { Link } from 'react-router-dom';

// ── Shared helpers ─────────────────────────────────────────────────────────
const AVATAR_COLOURS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500',
];
export function avatarColour(name = '') {
  return AVATAR_COLOURS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLOURS.length];
}
export function initials(name = '') {
  const parts = (name || '?').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Faculty badge colours ─────────────────────────────────────────────────
const FACULTY_STYLE = {
  COMPUTING:            'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  ENGINEERING:          'bg-orange-500/15 text-orange-400 border-orange-500/20',
  BUSINESS:             'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  HUMANITIES_AND_SCIENCE: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};
const FACULTY_LABEL = {
  COMPUTING:            'Computing',
  ENGINEERING:          'Engineering',
  BUSINESS:             'Business',
  HUMANITIES_AND_SCIENCE: 'Humanities & Science',
};

// ── Role badge (only shown when role ≠ STUDENT) ───────────────────────────
const ROLE_STYLE = {
  SYSTEM_ADMIN:   'bg-red-500/15 text-red-400 border-red-500/20',
  FACULTY_MANAGER:'bg-amber-500/15 text-amber-400 border-amber-500/20',
  DEPT_LEADER:    'bg-violet-500/15 text-violet-400 border-violet-500/20',
  CLUB_ADMIN:     'bg-sky-500/15 text-sky-400 border-sky-500/20',
};
const ROLE_LABEL = {
  SYSTEM_ADMIN:   'System Admin',
  FACULTY_MANAGER:'Faculty Manager',
  DEPT_LEADER:    'Dept. Leader',
  CLUB_ADMIN:     'Club Admin',
};

// ── Trophy inline SVG ─────────────────────────────────────────────────────
function TrophyIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

/**
 * ProfileCard — reusable summary card for any UserProfileDTO
 * Props: user (UserProfileDTO shape)
 */
export default function ProfileCard({ user }) {
  if (!user) return null;

  const colour = avatarColour(user.displayName);
  const abbr   = initials(user.displayName);
  const facultyStyle = FACULTY_STYLE[user.faculty] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  const facultyLabel = FACULTY_LABEL[user.faculty] ?? user.faculty;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-700 transition-all duration-200">
      {/* ── Avatar + name ── */}
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${colour}`}>
          {user.profilePicUrl ? (
            <img src={user.profilePicUrl} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">{abbr}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{user.displayName}</p>
          <p className="text-xs text-slate-500 font-mono">{user.studentId}</p>
        </div>
      </div>

      {/* ── Badges ── */}
      <div className="flex flex-wrap gap-1.5">
        {user.faculty && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${facultyStyle}`}>
            {facultyLabel}
          </span>
        )}
        {user.role && user.role !== 'STUDENT' && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_STYLE[user.role] ?? 'bg-slate-500/15 text-slate-400'}`}>
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        )}
      </div>

      {/* ── Bio ── */}
      {user.bio && (
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{user.bio}</p>
      )}

      {/* ── Points + View button ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <TrophyIcon />
          <span className="text-xs font-semibold text-amber-400">{user.points ?? 0}</span>
          <span className="text-xs text-slate-500">pts</span>
        </div>
        <Link
          to={`/profile/${user.id}`}
          className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-600/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
