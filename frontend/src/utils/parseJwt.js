/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * Safe for client-side use — signature verification happens on the server.
 *
 * @param {string} token - JWT string (header.payload.signature)
 * @returns {object} Decoded payload object, or {} on failure
 */
export function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    // Replace URL-safe characters and pad to a multiple of 4
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export default parseJwt;
