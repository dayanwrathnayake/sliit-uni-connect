import { useState } from 'react';
import { createPost } from '../../api/clubApi';

const MAX_CHARS = 500;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'sliit_uniconnect_profiles';

/**
 * Modal for Club Admins to create a new post.
 *
 * @param {{
 *   clubId: string,
 *   onClose: () => void,
 *   onPostCreated: () => void
 * }} props
 */
export default function CreatePostModal({ clubId, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = content.trim().length > 0 && content.length <= MAX_CHARS && !submitting && !uploading;

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setError('Image upload failed. Please try again.');
        setImagePreview('');
      }
    } catch {
      setError('Image upload failed. Please try again.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await createPost(clubId, {
        content: content.trim(),
        imageUrl: imageUrl || undefined,
      });
      onPostCreated?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="What's happening in your club?"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full resize-none"
              maxLength={MAX_CHARS}
            />
            <p className={`text-xs mt-1 text-right ${content.length > MAX_CHARS * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {content.length} / {MAX_CHARS}
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Image (optional)
            </label>
            {imagePreview && (
              <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover" />
                {uploading && (
                  <div className="bg-black/40 flex items-center justify-center py-2">
                    <span className="text-white text-xs">Uploading…</span>
                  </div>
                )}
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imagePreview ? 'Change Image' : 'Add Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imagePreview && !uploading && (
              <button type="button" onClick={() => { setImageUrl(''); setImagePreview(''); }} className="ml-2 text-xs text-red-500 hover:underline">
                Remove
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

