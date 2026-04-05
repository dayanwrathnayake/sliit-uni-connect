import { useNavigate } from 'react-router-dom';

export default function FeedEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      {/* SVG inbox icon */}
      <svg
        className="mx-auto h-16 w-16 text-indigo-300 mb-5"
        fill="none"
        viewBox="0 0 64 64"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="8" y="20" width="48" height="34" rx="4" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 32h12l4 6h16l4-6h12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M24 10l8-6 8 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M32 4v16" />
      </svg>

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Your feed is empty</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Follow some clubs to see their latest posts and updates right here.
      </p>

      <button
        onClick={() => navigate('/clubs')}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Explore Clubs
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
