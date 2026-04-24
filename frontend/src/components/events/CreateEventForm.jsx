import React, { useState, useEffect, useRef } from 'react';
import { createEvent } from '../../api/eventService';
import { getAllClubs } from '../../api/clubApi';

const EVENT_TYPES = [
  'ORIENTATION', 'WORKSHOP', 'SPORTS', 'GRADUATION', 
  'CLUB_EVENT', 'SEMINAR', 'HACKATHON', 'CULTURAL'
];

export default function CreateEventForm({ onSuccess, onCancel }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CLUB_EVENT',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: 50,
    clubId: '',
    imageUrl: '',
    imageFile: null
  });

  useEffect(() => {
    getAllClubs()
      .then(data => {
        setClubs(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, clubId: data[0].id }));
        }
      })
      .catch(err => setError('Failed to load clubs'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);

      // Store file and clear URL
      setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let dataToSubmit = { ...formData };

      // If image file is selected, upload it via FormData
      if (formData.imageFile) {
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description);
        formDataObj.append('type', formData.type);
        formDataObj.append('startDate', formData.startDate);
        formDataObj.append('endDate', formData.endDate);
        formDataObj.append('venue', formData.venue);
        formDataObj.append('capacity', formData.capacity);
        formDataObj.append('clubId', formData.clubId);
        formDataObj.append('image', formData.imageFile);

        dataToSubmit = formDataObj;
      } else {
        // Remove imageFile from regular JSON submission
        const { imageFile, ...cleanData } = dataToSubmit;
        dataToSubmit = cleanData;
      }

      const newEvent = await createEvent(dataToSubmit);
      if (onSuccess) onSuccess(newEvent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Check your dates!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Event</h2>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Annual Tech Symposium"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Type</label>
            <select
              name="type"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.type}
              onChange={handleChange}
            >
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Host Club</label>
            <select
              name="clubId"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.clubId}
              onChange={handleChange}
            >
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="What is this event about?"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Banner Image (optional)</label>
          <div className="space-y-3">
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-40 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              name="startDate"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              name="endDate"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
            <input
              type="text"
              name="venue"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Main Auditorium"
              value={formData.venue}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
            <input
              type="number"
              name="capacity"
              min="1"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
