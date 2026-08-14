import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="auth-split animate-in">
      {/* Branding Panel */}
      <div className="auth-brand-panel">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <h2>Welcome Back to TrafficEase BD</h2>
        <p>Your simple assistant for traveling in Dhaka. Sign in to help other commuters and save your daily travel routes.</p>
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
        <section className="auth-card">
          <h1>Login</h1>
          <p>Enter your details below to access your account.</p>
          {error && <div className="message error">{error}</div>}
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
              <button className="button" type="submit" disabled={loading}>
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
