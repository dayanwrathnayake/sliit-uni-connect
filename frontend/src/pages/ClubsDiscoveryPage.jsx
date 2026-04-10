import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useClubs } from '../hooks/useClubs';
import { isStudent, isClubAdmin } from '../utils/roles';
import ClubCard from '../components/clubs/ClubCard';
import RequestClubModal from '../components/clubs/RequestClubModal';
import PageLayout from '../components/layout/PageLayout';

const CATEGORIES = [
  { value: 'ALL', label: 'All' },
  { value: 'STUDENTS_INTERACTIVE_SOCIETY', label: 'Interactive Society' },
  { value: 'SPORTS_COUNCIL', label: 'Sports Council' },
  { value: 'FACULTY_SOCIETIES', label: 'Faculty Society' },
  { value: 'OTHER_SOCIETIES', label: 'Other Society' },
];

export default function ClubsDiscoveryPage() {
  const store = useAuthStore();
  const { clubs, loading, error } = useClubs();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const canRequest = isStudent(store) && !isClubAdmin(store);

  const filtered = clubs.filter((club) => {
    const matchesCategory = activeCategory === 'ALL' || club.category === activeCategory;
    const matchesSearch = !search || club.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Clubs &amp; Societies</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Discover and follow clubs on campus</p>
          </div>
          {canRequest && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-indigo-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Request a Club
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-5 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-500 dark:text-slate-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300 mb-1">No clubs found</h3>
            <p className="text-sm text-gray-400 dark:text-slate-500">Try a different search term or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>

      {showModal && <RequestClubModal onClose={() => setShowModal(false)} />}
    </PageLayout>
  );
}
