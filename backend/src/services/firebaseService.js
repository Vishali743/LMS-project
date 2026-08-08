const { getAdmin } = require('../config/firebase');

/**
 * Validates the Firebase client ID token.
 * Falls back to local sandbox bypass tokens in mock development environments.
 * @param {string} token - The Bearer token from headers.
 * @returns {Promise<object>} The decoded token attributes.
 */
async function verifyToken(token) {
  const admin = getAdmin();
  return admin.auth().verifyIdToken(token);
}

module.exports = {
  verifyToken
};
