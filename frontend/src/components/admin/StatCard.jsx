const colorMap = {
  indigo: 'bg-indigo-100 text-indigo-600',
  green:  'bg-green-100  text-green-600',
  red:    'bg-red-100    text-red-600',
  amber:  'bg-amber-100  text-amber-600',
  blue:   'bg-blue-100   text-blue-600',
};

export default function StatCard({ label, value, icon, color = 'indigo' }) {
  const iconStyle = colorMap[color] ?? colorMap.indigo;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold text-gray-800 leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1.5">{label}</p>
    </div>
  );
}
