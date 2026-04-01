import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="text-center max-w-md">
        {/* Large 403 */}
        <p className="text-8xl font-black text-indigo-600 opacity-20 mb-2 leading-none">403</p>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm">
            You don't have permission to view this page. Contact your administrator if you think this is a mistake.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm transition-all"
        >
          ← Go back home
        </Link>
      </div>
    </div>
  );
}
