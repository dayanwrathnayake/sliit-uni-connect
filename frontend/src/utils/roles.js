/**
 * Role helper functions for the SLIIT UNI-Connect dual-auth system.
 *
 * The authStore stores:
 *   - userType: "STUDENT" | "STAFF"
 *   - role: string (e.g. "STUDENT", "CLUB_ADMIN", "SYSTEM_ADMIN", "FACULTY_MANAGER")
 *
 * These helpers accept the flat authStore state object.
 */

export const isStudent = (store) => store?.userType === 'STUDENT';
export const isStaff = (store) => store?.userType === 'STAFF';

export const isSystemAdmin = (store) =>
  store?.userType === 'STAFF' && store?.role === 'SYSTEM_ADMIN';

export const isFacultyManager = (store) =>
  store?.userType === 'STAFF' && store?.role === 'FACULTY_MANAGER';

export const isClubAdmin = (store) =>
  store?.userType === 'STUDENT' && store?.role === 'CLUB_ADMIN';

export const isDeptLeader = (store) =>
  store?.userType === 'STUDENT' && store?.role === 'DEPT_LEADER';

/** Returns true for SYSTEM_ADMIN or FACULTY_MANAGER */
export const canApproveClubs = (store) =>
  isSystemAdmin(store) || isFacultyManager(store);

// AFTER: any user from the students collection can follow clubs —
// CLUB_ADMIN is still a student-side user; only STAFF should be blocked.
export const canFollowClubs = (store) => store?.userType === 'STUDENT';
