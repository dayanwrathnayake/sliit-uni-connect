import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * QuickStatsWidget — reads user stats from Zustand authStore.
 * No API calls — Member 3 will populate points; just shows what's available.
 */
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
    } catch {
      /* ignore clipboard errors */
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">My Stats</h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Clubs following */}
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xl font-semibold text-indigo-600">
            {followingCount !== null ? followingCount : '—'}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Clubs Following</p>
        </div>

        {/* Points */}
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xl font-semibold text-indigo-600">
            {points !== null ? points : '—'}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Points</p>
        </div>

        {/* Rank placeholder */}
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xl font-semibold text-indigo-600">—</p>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Rank</p>
        </div>
      </div>

      {/* Referral code */}
      {referralCode && (
        <div className="flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          <div>
            <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wide">Referral Code</p>
            <p className="text-sm font-mono font-semibold text-indigo-700">{referralCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="text-indigo-400 hover:text-indigo-700 transition-colors flex-shrink-0"
            title="Copy referral code"
            aria-label="Copy referral code"
          >
            {copied ? (
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
