import { useState } from 'react';
import AvatarUploader from '../profile/AvatarUploader';
import { requestClub } from '../../api/clubApi';

const CATEGORIES = [
  { value: 'STUDENTS_INTERACTIVE_SOCIETY', label: 'Interactive Society' },
  { value: 'SPORTS_COUNCIL', label: 'Sports Council' },
  { value: 'FACULTY_SOCIETIES', label: 'Faculty Society' },
  { value: 'OTHER_SOCIETIES', label: 'Other Society' },
];

const MIN_DESC = 50;

/**
 * Modal for students to request a new club.
 * @param {{ onClose: () => void }} props
 */
export default function RequestClubModal({ onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const descValid = description.trim().length >= MIN_DESC;
  const canSubmit = name.trim() && category && descValid && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await requestClub({
        name: name.trim(),
        category,
        description: description.trim(),
        profilePicUrl: profilePicUrl || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="text-center py-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Submitted!</h3>
            <p className="text-sm text-slate-400 mb-6">
              Your club request has been submitted for approval. You'll hear back once a staff member reviews it.
            </p>
            <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Request a New Club</h2>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Club name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Club Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SLIIT FOSS Community"
                  className="border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category <span className="text-red-400">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                  required
                >
                  <option value="" className="text-slate-500 bg-slate-800">Select a category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="text-slate-200 bg-slate-800">{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your club's purpose and activities…"
                  className="border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full resize-none"
                  required
                />
                <p className={`text-xs mt-1 ${descValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {description.trim().length} / {MIN_DESC} minimum characters
                </p>
              </div>

              {/* Profile picture (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Club Profile Picture (optional)</label>
                <AvatarUploader
                  currentImageUrl={profilePicUrl}
                  onUploadSuccess={(url) => setProfilePicUrl(url)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
