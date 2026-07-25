const mongoose = require('mongoose');
const User = require('../models/User');
const mockDb = require('../data/mockDatabase');

const findUserForToken = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    const user = mockDb.users.find((item) => item._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  if (!mongoose.isValidObjectId(id)) return null;
  return User.findById(id).select('-password');
};

module.exports = { findUserForToken };
