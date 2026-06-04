const PUBLIC_ROLES = Object.freeze(['Commuter', 'Driver']);

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const validateRegistration = (payload = {}) => {
  const value = {
    name: String(payload.name || '').trim(),
    email: normalizeEmail(payload.email),
    phone: String(payload.phone || '').trim(),
    password: String(payload.password || ''),
    role: String(payload.role || 'Commuter').trim()
  };
  const errors = [];

  if (value.name.length < 2) errors.push('Name must contain at least 2 characters');
  if (!/^\S+@\S+\.\S+$/.test(value.email)) errors.push('A valid email address is required');
  if (value.password.length < 8) errors.push('Password must contain at least 8 characters');
  if (!PUBLIC_ROLES.includes(value.role)) {
    errors.push('Public registration is limited to Commuter and Driver roles');
  }

  return { value, errors };
};

module.exports = {
  PUBLIC_ROLES,
  normalizeEmail,
  validateRegistration
};
