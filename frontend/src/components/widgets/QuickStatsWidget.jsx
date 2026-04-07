import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * QuickStatsWidget — shows user stats with coloured icons.
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

  const stats = [
    {
      label: 'Following',
      value: followingCount !== null ? followingCount : '—',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Points',
      value: points !== null ? points : '—',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Rank',
      value: '—',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          My Stats
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-px bg-gray-100">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white text-center py-3 px-2">
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${stat.bg} ${stat.color} mb-1.5`}>
              {stat.icon}
            </div>
            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Referral code */}
      {referralCode && (
        <div className="px-4 pb-4 pt-3">
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
        </div>
      )}
    </div>
  );
}
