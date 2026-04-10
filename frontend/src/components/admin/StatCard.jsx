const colorMap = {
  indigo: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  green:  'bg-green-100  dark:bg-green-500/15  text-green-600  dark:text-green-400',
  red:    'bg-red-100    dark:bg-red-500/15    text-red-600    dark:text-red-400',
  amber:  'bg-amber-100  dark:bg-amber-500/15  text-amber-600  dark:text-amber-400',
  blue:   'bg-blue-100   dark:bg-blue-500/15   text-blue-600   dark:text-blue-400',
};

export default function StatCard({ label, value, icon, color = 'indigo' }) {
  const iconStyle = colorMap[color] ?? colorMap.indigo;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold text-gray-800 dark:text-slate-100 leading-none">{value}</p>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">{label}</p>
    </div>
  );
}
