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
    <div className="auth-split">
      {/* Branding Panel */}
      <div className="auth-brand-panel">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <h2>Welcome Back</h2>
        <p>Access Dhaka's real-time urban mobility command center and stay ahead of the traffic.</p>
        <div className="auth-brand-features">
          <div>
            <span className="auth-feature-icon">📡</span>
            <span>Live corridor monitoring across 12+ zones</span>
          </div>
          <div>
            <span className="auth-feature-icon">🗺️</span>
            <span>Smart bypass route planning</span>
          </div>
          <div>
            <span className="auth-feature-icon">🚨</span>
            <span>Instant incident reporting & alerts</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <section className="auth-card">
          <h1>Login</h1>
          <p>Access the TrafficEase BD operations dashboard.</p>
          {error && <div className="message error">{error}</div>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">📧 Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
            </div>
            <div className="form-row">
              <label htmlFor="password">🔒 Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={updateField} placeholder="Enter your password" required />
            </div>
            <div className="form-footer">
              <Link to="/register">Create account</Link>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>

          <p className="panel-subtitle" style={{ marginTop: '18px' }}>
            Accounts are authenticated by the TrafficEase BD API. Administrative roles are assigned by the project administrator.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
