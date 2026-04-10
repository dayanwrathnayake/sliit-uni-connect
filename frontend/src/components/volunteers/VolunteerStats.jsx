import React from 'react';
import PointsChip from './PointsChip';

export default function VolunteerStats({ stats }) {
  const { totalPoints = 0, completedTasks = 0, certificatesCount = 0 } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shadow-inner">
          🏆
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Points</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {totalPoints} <span className="text-sm font-medium text-slate-400">Total</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
        <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl shadow-inner">
          ✅
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tasks Completed</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedTasks} <span className="text-sm font-medium text-slate-400">Sessions</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
        <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl shadow-inner">
          🎓
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Certificates</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {certificatesCount} <span className="text-sm font-medium text-slate-400">Issued</span>
          </div>
        </div>
      </div>
    </div>
  );
}
