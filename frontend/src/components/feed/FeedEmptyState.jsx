import { useNavigate } from 'react-router-dom';

export default function FeedEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
      {/* Illustration */}
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-indigo-50 mb-5">
        <svg
          className="h-10 w-10 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Your feed is empty</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
        Follow clubs to see their latest posts, announcements, and updates right here in your feed.
      </p>

      <button
        onClick={() => navigate('/clubs')}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
      >
        Discover Clubs
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}
