const CATEGORY_MAP = {
  STUDENTS_INTERACTIVE_SOCIETY: {
    label: 'Interactive Society',
    className: 'bg-blue-100 text-blue-800',
  },
  SPORTS_COUNCIL: {
    label: 'Sports Council',
    className: 'bg-green-100 text-green-800',
  },
  FACULTY_SOCIETIES: {
    label: 'Faculty Society',
    className: 'bg-purple-100 text-purple-800',
  },
  OTHER_SOCIETIES: {
    label: 'Other Society',
    className: 'bg-amber-100 text-amber-800',
  },
};

/**
 * Displays a colored badge for a ClubCategory enum value.
 *
 * @param {{ category: string }} props
 */
export default function CategoryBadge({ category }) {
  const config = CATEGORY_MAP[category] ?? {
    label: category ?? 'Unknown',
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
