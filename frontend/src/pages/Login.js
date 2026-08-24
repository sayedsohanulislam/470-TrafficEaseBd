import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const demoProfiles = [
  { role: 'Commuter', icon: '🧑', title: 'Commuter demo', description: 'Plan journeys, check fares, and report road incidents.' },
  { role: 'Driver', icon: '🚗', title: 'Driver demo', description: 'Use driver services and submit pinned incident reports.' },
  { role: 'Authority', icon: '👮', title: 'Authority demo', description: 'Monitor approved reports and update incident status.' },
  { role: 'Admin', icon: '🛡️', title: 'Admin demo', description: 'Approve, manage, and delete community reports.' }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const { token, ...userData } = data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setDemoLoading(role);
    try {
      const { data } = await api.post('/auth/demo-login', { role });
      const { token, ...userData } = data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start the demo account.');
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <div className="auth-split animate-in">
      {/* Branding Panel */}
      <div className="auth-brand-panel">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <h2>Show Every Role in One Tap</h2>
        <p>Choose a demo user to present the complete TrafficEase BD workflow without creating an account.</p>
        <div className="auth-brand-features">
          <div>
            <span className="auth-feature-icon">🚗</span>
            <span>Check live road congestion across Dhaka</span>
          </div>
          <div>
            <span className="auth-feature-icon">🧭</span>
            <span>Find the fastest bypass routes</span>
          </div>
          <div>
            <span className="auth-feature-icon">⚠️</span>
            <span>Report traffic jams, flooding, and accidents</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <section className="auth-card login-demo-card">
          <span className="demo-login-kicker">Teacher presentation mode</span>
          <h1>Choose a demo user</h1>
          <p>One tap signs you in with the correct permissions for that role.</p>
          {error && <div className="message error">{error}</div>}

          <div className="demo-profile-grid" aria-label="One-tap demo accounts">
            {demoProfiles.map((profile) => (
              <button
                key={profile.role}
                type="button"
                className={`demo-profile-card role-${profile.role.toLowerCase()}`}
                onClick={() => handleDemoLogin(profile.role)}
                disabled={Boolean(demoLoading) || loading}
              >
                <span className="demo-profile-icon">{profile.icon}</span>
                <span className="demo-profile-copy">
                  <strong>{profile.title}</strong>
                  <small>{profile.description}</small>
                </span>
                <b>{demoLoading === profile.role ? 'Opening…' : 'Enter →'}</b>
              </button>
            ))}
          </div>

          <div className="demo-login-note"><span>✓</span> Demo users use the real role permissions. Log out to switch roles.</div>

          <div className="auth-divider">or use your account</div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">📧 Email Address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="e.g. name@domain.com" required />
            </div>
            <div className="form-row">
              <label htmlFor="password">🔒 Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={updateField} placeholder="Enter your password" required />
            </div>
            <div className="form-footer">
              <Link to="/register">Don't have an account? Register</Link>
              <button className="button" type="submit" disabled={loading || Boolean(demoLoading)}>
                {loading ? 'Logging you in...' : 'Login'}
              </button>
            </div>
          </form>

          <p className="panel-subtitle" style={{ marginTop: '18px' }}>
            Logging in helps us verify who submits traffic reports, ensuring our maps stay accurate for everyone in Dhaka.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
