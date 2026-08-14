const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mockDb = require('../data/mockDatabase');
const { normalizeEmail, validateRegistration } = require('../services/authPolicy');
const { signToken } = require('../services/tokenService');

exports.registerUser = async (req, res) => {
  try {
    const { value, errors } = validateRegistration(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });
    const { name, email, phone, password, role } = value;

    // Self-healing Database Fallback
    if (mongoose.connection.readyState !== 1) {
      const userExists = mockDb.users.find(u => normalizeEmail(u.email) === email);
      if (userExists) return res.status(400).json({ message: 'User already exists (Simulated Mode)' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'mock-user-' + (mockDb.users.length + 1),
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString()
      };
      mockDb.users.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: signToken(newUser._id)
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, phone, password, role });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: signToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Self-healing Database Fallback
    if (mongoose.connection.readyState !== 1) {
      const user = mockDb.users.find(u => u.email === email);
      if (user && await bcrypt.compare(password, user.password)) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: signToken(user._id)
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials (Simulated Mode)' });
      }
    }

    const user = await User.findOne({ email });
    if (user && await user.comparePassword(password)) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role,
        token: signToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
