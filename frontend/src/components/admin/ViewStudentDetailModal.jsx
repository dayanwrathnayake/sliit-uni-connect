import { useState, useEffect } from 'react';
import { getStudent } from '../../api/adminApi';

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Badge({ label, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[color]}`}>
      {label}
    </span>
  );
}

export default function ViewStudentDetailModal({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const data = await getStudent(studentId);
        setStudent(data);
      } catch (err) {
        console.error('Failed to fetch student:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [studentId]);

  const roleColorMap = {
    STUDENT: { label: 'Student', color: 'indigo' },
    CLUB_ADMIN: { label: 'Club Admin', color: 'amber' },
    DEPT_LEADER: { label: 'Dept Leader', color: 'green' },
  };

  const roleInfo = roleColorMap[student?.role] || { label: student?.role, color: 'gray' };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Student Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : student ? (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="pb-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                      {student.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {student.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 font-mono">
                      {student.studentId}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge label={roleInfo.label} color={roleInfo.color} />
                  <Badge
                    label={student.isActive ? 'Active' : 'Inactive'}
                    color={student.isActive ? 'green' : 'amber'}
                  />
                  {student.isEmailVerified && (
                    <Badge label="Email Verified" color="green" />
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.displayName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Student ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {student.studentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                      {student.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Faculty</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.faculty || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Role</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {roleInfo.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Status</p>
                    <p className={`text-sm font-medium ${
                      student.isActive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Email Verified</p>
                    <p className={`text-sm font-medium ${
                      student.isEmailVerified
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {student.isEmailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Loyalty Points</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {student.points || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Timestamps
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.updatedAt
                        ? new Date(student.updatedAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-slate-400">Failed to load student details</p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
