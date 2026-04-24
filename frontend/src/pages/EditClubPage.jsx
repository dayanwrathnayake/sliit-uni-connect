import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getClub, updateClub } from '../api/clubApi';
import { isClubAdmin, isSystemAdmin } from '../utils/roles';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';
import AvatarUploader from '../components/profile/AvatarUploader';
import PageLayout from '../components/layout/PageLayout';

const CATEGORIES = [
  { value: 'STUDENTS_INTERACTIVE_SOCIETY', label: 'Interactive Society' },
  { value: 'SPORTS_COUNCIL', label: 'Sports Council' },
  { value: 'FACULTY_SOCIETIES', label: 'Faculty Society' },
  { value: 'OTHER_SOCIETIES', label: 'Other Society' },
];

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'sliit_uniconnect_profiles';

export default function EditClubPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const store = useAuthStore();
  const { showToast, toast } = useToast();

  const [club, setClub] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getClub(clubId);
        // Access guard — must be the club admin OR a system admin
        if (!isSystemAdmin(store) && (!isClubAdmin(store) || store.userId !== data.adminId)) {
          navigate(`/clubs/${clubId}`, { replace: true });
          return;
        }
        setClub(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setCategory(data.category || '');
        setProfilePicUrl(data.profilePicUrl || '');
        setBannerUrl(data.bannerUrl || '');
        setBannerPreview(data.bannerUrl || '');
      } catch {
        navigate(`/clubs/${clubId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clubId, store, navigate]);

  async function handleBannerChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) setBannerUrl(data.secure_url);
      else setError('Banner upload failed.');
    } catch {
      setError('Banner upload failed.');
    } finally {
      setBannerUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !category) return;
    setSaving(true);
    setError('');
    try {
      await updateClub(clubId, {
        description: description.trim(),
        profilePicUrl: profilePicUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });
      showToast('Club updated successfully!', 'success');
      setTimeout(() => navigate(`/clubs/${clubId}`), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update club. Please try again.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ToastContainer toast={toast} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/clubs/${clubId}`)}
            className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Edit Club</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
          {/* Club name (read-only — changing the name is not allowed in the backend updateClub endpoint, only description/pics) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Club Name</label>
            <input
              type="text"
              value={name}
              disabled
              className="border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm w-full text-gray-400 dark:text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Club name cannot be changed after creation.</p>
          </div>

          {/* Category (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              disabled
              className="border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm w-full text-gray-400 dark:text-slate-500 cursor-not-allowed"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full resize-none"
              required
            />
          </div>

          {/* Profile pic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Club Profile Picture</label>
            <AvatarUploader
              currentImageUrl={profilePicUrl}
              onUploadSuccess={(url) => setProfilePicUrl(url)}
            />
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Club Banner</label>
            {bannerPreview && (
              <div className="mb-2 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                {bannerUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs">Uploading…</span>
                  </div>
                )}
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {bannerPreview ? 'Change Banner' : 'Upload Banner'}
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/clubs/${clubId}`)}
              className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || bannerUploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}


