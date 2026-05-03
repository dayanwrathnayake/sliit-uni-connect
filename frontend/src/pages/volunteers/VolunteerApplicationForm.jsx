import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { applyToVolunteer } from '../../api/volunteerService';
import PageLayout from '../../components/layout/PageLayout';

const YEARS = ['1', '2', '3', '4'];
const SEMESTERS = ['1', '2'];
const CATEGORIES = [
  'LOGISTICS',
  'DOCUMENTATION',
  'PHOTOGRAPHY',
  'GROUND_WORK',
  'FINANCIAL',
  'OTHER'
];
const HOURS_TYPES = ['FULL_TIME', 'PART_TIME'];

export default function VolunteerApplicationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    year: '1',
    semester: '1',
    category: 'LOGISTICS',
    hoursType: 'FULL_TIME',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category === 'OTHER' && !formData.description.trim()) {
       setError('Please provide a description for the "Other" category.');
       return;
    }

    setLoading(true);
    setError(null);
    try {
      await applyToVolunteer({
        eventId,
        ...formData
      });
      // Redirect back to event detail
      navigate(`/events/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-bold">Volunteer Application</h1>
            <p className="opacity-80 mt-1">Join the team and help make this event a success!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto-filled fields */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Registration Number</label>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-mono opacity-80 cursor-not-allowed">
                  {user?.studentId || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Faculty</label>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white opacity-80 cursor-not-allowed">
                  {user?.faculty || 'General'}
                </div>
              </div>

              {/* Editable fields */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Academic Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preferred Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hours Commitment</label>
                <select
                  name="hoursType"
                  value={formData.hoursType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                >
                  {HOURS_TYPES.map(h => <option key={h} value={h}>{h.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Description {formData.category === 'OTHER' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={formData.category === 'OTHER' ? 'Please specify your skills or interests...' : 'Any additional comments...'}
                className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Apply Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
