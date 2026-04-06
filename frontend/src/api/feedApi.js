import api from './axios';

/**
 * GET /api/feed?page=X&size=X
 * Returns a Spring Page object:
 * { content: FeedPostResponseDTO[], totalPages, totalElements, number }
 */
export function getFeed({ page = 0, size = 10 } = {}) {
  return api.get('/api/feed', { params: { page, size } }).then((r) => r.data);
}
