const CATEGORY_MAP = {
  STUDENTS_INTERACTIVE_SOCIETY: {
    label: 'Interactive Society',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  },
  SPORTS_COUNCIL: {
    label: 'Sports Council',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  },
  FACULTY_SOCIETIES: {
    label: 'Faculty Society',
    className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  },
  OTHER_SOCIETIES: {
    label: 'Other Society',
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  },
};

export default function CategoryBadge({ category }) {
  const config = CATEGORY_MAP[category] ?? {
    label: category ?? 'Unknown',
    className: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
