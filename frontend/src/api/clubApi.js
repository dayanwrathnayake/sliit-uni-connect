import api from './axios';

// ── Club CRUD ─────────────────────────────────────────────────────────────────

/** GET /api/clubs — all approved clubs */
export const getAllClubs = () => api.get('/api/clubs').then((r) => r.data);

/** GET /api/clubs/:id — single club */
export const getClub = (clubId) =>
  api.get(`/api/clubs/${clubId}`).then((r) => r.data);

/** POST /api/clubs/request — student requests a new club */
export const requestClub = (body) =>
  api.post('/api/clubs/request', body).then((r) => r.data);

/** PUT /api/clubs/:id — club admin updates their club */
export const updateClub = (clubId, body) =>
  api.put(`/api/clubs/${clubId}`, body).then((r) => r.data);

// ── Follow / Unfollow ─────────────────────────────────────────────────────────

/** POST /api/clubs/:id/follow */
export const followClub = (clubId) =>
  api.post(`/api/clubs/${clubId}/follow`).then((r) => r.data);

/** DELETE /api/clubs/:id/follow */
export const unfollowClub = (clubId) =>
  api.delete(`/api/clubs/${clubId}/follow`).then((r) => r.data);

/** GET /api/clubs/:id/followers */
export const getFollowers = (clubId) =>
  api.get(`/api/clubs/${clubId}/followers`).then((r) => r.data);

// ── Posts ─────────────────────────────────────────────────────────────────────

/** POST /api/clubs/:id/posts — club admin creates a post */
export const createPost = (clubId, body) =>
  api.post(`/api/clubs/${clubId}/posts`, body).then((r) => r.data);

/** GET /api/clubs/:id/posts */
export const getClubPosts = (clubId) =>
  api.get(`/api/clubs/${clubId}/posts`).then((r) => r.data);

// ── Likes ─────────────────────────────────────────────────────────────────────

/** POST /api/clubs/posts/:postId/like — toggle like */
export const likePost = (postId) =>
  api.post(`/api/clubs/posts/${postId}/like`).then((r) => r.data);

/** Same endpoint — backend toggles. Alias for semantic clarity. */
export const unlikePost = (postId) => likePost(postId);

// ── Staff / Admin ─────────────────────────────────────────────────────────────

/** GET /api/clubs/pending — scoped by backend (SA sees all, FM sees own faculty) */
export const getPendingClubs = () =>
  api.get('/api/clubs/pending').then((r) => r.data);

/** PUT /api/clubs/:id/approve — approve */
export const approveClub = (clubId) =>
  api
    .put(`/api/clubs/${clubId}/approve`, { approved: true })
    .then((r) => r.data);

/** PUT /api/clubs/:id/approve — reject with reason */
export const rejectClub = (clubId, rejectionReason) =>
  api
    .put(`/api/clubs/${clubId}/approve`, { approved: false, rejectionReason })
    .then((r) => r.data);
