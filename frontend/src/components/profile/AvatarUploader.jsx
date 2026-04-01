import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── Colour picker for initials avatar ─────────────────────────────────────
const AVATAR_COLOURS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500',
];
function avatarColour(name = '') {
  return AVATAR_COLOURS[name.charCodeAt(0) % AVATAR_COLOURS.length] ?? 'bg-indigo-500';
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * AvatarUploader
 * Props:
 *   currentImageUrl  — existing Cloudinary URL (or null)
 *   onUploadSuccess  — callback(secureUrl: string) called after successful upload
 */
export default function AvatarUploader({ currentImageUrl, onUploadSuccess }) {
  const { displayName } = useAuthStore();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // ── Sync preview when parent provides a new URL (e.g. after profile fetch) ──
  // useState only initialises once; useEffect keeps it in sync with prop updates.
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // ── Client-side validation ─────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    // ── Immediate preview ──────────────────────────────────────────────────
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // ── Upload to Cloudinary (unsigned) ───────────────────────────────────
    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      // Use XMLHttpRequest so we can track upload progress
      const secureUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UPLOAD_URL);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 90));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      setProgress(100);
      onUploadSuccess(secureUrl);
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(currentImageUrl || null); // revert preview
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const colour = avatarColour(displayName || '');
  const avatarInitials = initials(displayName || '?');

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── Avatar circle ── */}
      <div className="relative group">
        <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-slate-700 ring-offset-2 ring-offset-slate-900">
          {preview ? (
            <img
              src={preview}
              alt="Profile picture"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full flex items-center justify-center ${colour}`}>
              <span className="text-3xl font-bold text-white">{avatarInitials}</span>
            </div>
          )}
        </div>

        {/* "Change photo" overlay button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 flex items-center gap-1 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-2.5 py-1 text-xs font-medium text-white shadow-lg transition-all whitespace-nowrap"
        >
          {uploading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              Uploading…
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Change photo
            </>
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Upload progress bar ── */}
      {uploading && (
        <div className="w-full max-w-[7rem] h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-200 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <p className="text-xs text-slate-500 text-center">JPG, PNG, WebP · max 5 MB</p>
    </div>
  );
}
