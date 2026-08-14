const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return 'trafficease-development-only-secret';
};

const signToken = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });
const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = { getJwtSecret, signToken, verifyToken };
