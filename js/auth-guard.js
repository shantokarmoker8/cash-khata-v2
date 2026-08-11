// js/auth-guard.js
const SESSION_KEY = 'cashKhataSession';

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setSession(userData) {
  const session = {
    uid: userData.uid,
    username: userData.username,
    full_name: userData.full_name,
    role: userData.role,
    language: userData.language || 'en',
    loginTime: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
  return getSession() !== null;
}

function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}

// Protected page-এর শুরুতে কল করলে: লগইন না থাকলে login.html এ পাঠিয়ে দেয়
function requireAuth() {
  const session = getSession();
  if (session === null) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Admin-only page-এর শুরুতে কল করলে
function requireAdmin() {
  const session = requireAuth();
  if (session === null) return null;
  if (session.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return null;
  }
  return session;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

export {
  SESSION_KEY,
  getSession,
  setSession,
  clearSession,
  isLoggedIn,
  isAdmin,
  requireAuth,
  requireAdmin,
  logout
};