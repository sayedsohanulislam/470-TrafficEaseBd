const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mockDb = require('../data/mockDatabase');
const { normalizeEmail, validateRegistration } = require('../services/authPolicy');
const { signToken } = require('../services/tokenService');

const DEMO_PROFILES = {
  Commuter: { name: 'Demo Commuter', email: 'demo-commuter@trafficease.local', phone: '01710000001' },
  Driver: { name: 'Demo Driver', email: 'demo-driver@trafficease.local', phone: '01710000002' },
  Authority: { name: 'Demo Traffic Authority', email: 'demo-authority@trafficease.local', phone: '01710000003' },
  Admin: { name: 'Demo Administrator', email: 'demo-admin@trafficease.local', phone: '01710000004' }
};

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  demo: true,
  token: signToken(user._id)
});

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

exports.demoLoginUser = async (req, res) => {
  try {
    const demoEnabled = process.env.ENABLE_DEMO_LOGIN === 'true' || process.env.NODE_ENV !== 'production';
    if (!demoEnabled) return res.status(403).json({ message: 'Demo login is disabled in this environment' });

    const role = String(req.body.role || '').trim();
    const profile = DEMO_PROFILES[role];
    if (!profile) return res.status(400).json({ message: 'Choose Commuter, Driver, Authority, or Admin' });

    if (mongoose.connection.readyState !== 1) {
      let user = mockDb.users.find((item) => item.email === profile.email);
      if (!user) {
        user = {
          _id: `mock-demo-${role.toLowerCase()}`,
          ...profile,
          role,
          password: await bcrypt.hash(`demo-${role}-local-only`, 10),
          demo: true,
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(user);
      }
      return res.json(authResponse(user));
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        ...profile,
        role,
        password: `demo-${role}-local-only`
      });
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    return res.json(authResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.DEMO_PROFILES = DEMO_PROFILES;
