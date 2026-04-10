import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

function UsersIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14M5 3a2 2 0 00-2 2v2a4 4 0 004 4h0M5 3v4a4 4 0 004 4m10-8a2 2 0 012 2v2a4 4 0 01-4 4m0 0H9m6 0v3a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3m0 0a4 4 0 01-4-4" />
    </svg>
  );
}

/* Point tiers */
const TIERS = [
  { label: 'Bronze', min: 0,    max: 199,  color: 'from-amber-700 to-amber-500',   textColor: 'text-amber-600 dark:text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Silver', min: 200,  max: 499,  color: 'from-slate-400 to-slate-300',   textColor: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-50 dark:bg-slate-700/30' },
  { label: 'Gold',   min: 500,  max: 999,  color: 'from-yellow-500 to-amber-400',  textColor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { label: 'Plat',   min: 1000, max: 2000, color: 'from-indigo-400 to-violet-400', textColor: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
];

function getTier(pts) {
  return TIERS.find((t) => pts >= t.min && pts <= t.max) ?? TIERS[TIERS.length - 1];
}

function getNextTier(pts) {
  const idx = TIERS.findIndex((t) => pts >= t.min && pts <= t.max);
  return idx !== -1 && idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export default function QuickStatsWidget() {
  const store = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralCode   = store.referralCode   ?? null;
  const points         = store.points         ?? null;
  const followingCount = store.followingCount ?? null;

  async function handleCopy() {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  const tier     = points !== null ? getTier(points) : null;
  const nextTier = points !== null ? getNextTier(points) : null;
  const progress = tier && nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">My Stats</h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2.5 bg-gray-50 dark:bg-slate-700/60 rounded-lg">
          <div className="flex justify-center mb-1.5"><UsersIcon /></div>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            {followingCount !== null ? followingCount : '—'}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">Following</p>
        </div>
        <div className="text-center p-2.5 bg-gray-50 dark:bg-slate-700/60 rounded-lg">
          <div className="flex justify-center mb-1.5"><StarIcon /></div>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            {points !== null ? points : '—'}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">Points</p>
        </div>
        <div className="text-center p-2.5 bg-gray-50 dark:bg-slate-700/60 rounded-lg">
          <div className="flex justify-center mb-1.5"><TrophyIcon /></div>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">—</p>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">Rank</p>
        </div>
      </div>

      {/* ── Point tier progress bar ── */}
      {tier && (
        <div className={`rounded-lg border border-gray-100 dark:border-slate-700 px-3 py-2.5 mb-3 ${tier.bg}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tier.textColor}`}>
              {tier.label}
            </span>
            {nextTier ? (
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                {nextTier.min - points} pts to {nextTier.label}
              </span>
            ) : (
              <span className="text-[10px] text-indigo-400">Max tier reached!</span>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {nextTier && (
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-400 dark:text-slate-600">{tier.min}</span>
              <span className="text-[9px] text-gray-400 dark:text-slate-600">{nextTier.min}</span>
            </div>
          )}
        </div>
      )}

      {referralCode && (
        <div className="flex items-center justify-between gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-lg px-3 py-2">
          <div>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wide">Referral Code</p>
            <p className="text-sm font-mono font-semibold text-indigo-700 dark:text-indigo-300">{referralCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex-shrink-0"
            title="Copy referral code"
          >
            {copied ? (
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
