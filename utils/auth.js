// utils/auth.js

function getSession(req) {
  return req.session; // Assuming you're using express-session or a similar session management middleware
}

module.exports = { getSession };
