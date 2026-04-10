import { useState } from 'react';
import { Link } from 'react-router-dom';

const ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'info',
    title: 'Welcome to SLIIT UNI-Connect! 🎉',
    body: 'Follow clubs, earn volunteer points, and stay on top of campus events — all in one place.',
    cta: { label: 'Explore Clubs', to: '/clubs' },
  },
];

const TYPE_STYLES = {
  info: {
    wrapper: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
    icon:    'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    title:   'text-indigo-800 dark:text-indigo-300',
    body:    'text-indigo-600/80 dark:text-indigo-400/80',
    cta:     'bg-indigo-600 hover:bg-indigo-700 text-white',
    close:   'text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
  },
  warning: {
    wrapper: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    icon:    'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    title:   'text-amber-800 dark:text-amber-300',
    body:    'text-amber-600/80 dark:text-amber-400/80',
    cta:     'bg-amber-500 hover:bg-amber-600 text-white',
    close:   'text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
  },
  success: {
    wrapper: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    icon:    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    title:   'text-emerald-800 dark:text-emerald-300',
    body:    'text-emerald-600/80 dark:text-emerald-400/80',
    cta:     'bg-emerald-600 hover:bg-emerald-700 text-white',
    close:   'text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
  },
};

function InfoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('announce-dismissed') === '1'
  );

  if (dismissed || ANNOUNCEMENTS.length === 0) return null;

  const ann = ANNOUNCEMENTS[0];
  const s   = TYPE_STYLES[ann.type] ?? TYPE_STYLES.info;

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem('announce-dismissed', '1');
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 mb-4 ${s.wrapper}`}>
      {/* Icon */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.icon}`}>
        <InfoIcon />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${s.title}`}>{ann.title}</p>
        <p className={`mt-0.5 text-xs leading-relaxed ${s.body}`}>{ann.body}</p>
        {ann.cta && (
          <Link
            to={ann.cta.to}
            className={`mt-2 inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${s.cta}`}
          >
            {ann.cta.label}
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className={`flex-shrink-0 transition-colors ${s.close}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
