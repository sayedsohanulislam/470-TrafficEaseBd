const { findUserForToken } = require('../services/userResolver');
const { verifyToken } = require('../services/tokenService');

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return null;
};

const attachUser = async (req) => {
  const token = readToken(req);
  if (!token) return null;

  const decoded = verifyToken(token);
  return findUserForToken(decoded.id);
};

exports.protect = async (req, res, next) => {
  try {
    const user = await attachUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, token missing or invalid' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token missing or invalid' });
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    req.user = await attachUser(req);
  } catch (error) {
    req.user = null;
  }
  return next();
};

exports.allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden for this role' });
  }
  return next();
};
