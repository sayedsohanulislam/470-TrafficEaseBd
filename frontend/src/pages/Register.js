import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Commuter'
  });
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
      const { data } = await api.post('/auth/register', form);
      const { token, ...userData } = data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create the account.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pw = form.password;
    if (!pw) return { label: '', level: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', level: 1, color: 'var(--danger)' };
    if (score <= 3) return { label: 'Medium', level: 2, color: 'var(--primary)' };
    return { label: 'Strong', level: 3, color: 'var(--success)' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-split">
      {/* Branding Panel */}
      <div className="auth-brand-panel">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <h2>Join TrafficEase BD</h2>
        <p>Create your account and become part of Dhaka's smarter commuting network.</p>
        <div className="auth-brand-features">
          <div>
            <span className="auth-feature-icon">🏍️</span>
            <span>Secure commuter and driver registration</span>
          </div>
          <div>
            <span className="auth-feature-icon">📱</span>
            <span>Report incidents and track resolutions</span>
          </div>
          <div>
            <span className="auth-feature-icon">📊</span>
            <span>Personal dashboard with analytics</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <section className="auth-card">
          <h1>Register</h1>
          <p>Create a commuter or driver account. Privileged roles require administrator approval.</p>
          {error && <div className="message error">{error}</div>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">👤 Full Name</label>
              <input id="name" name="name" value={form.name} onChange={updateField} placeholder="Enter your full name" required />
            </div>
            <div className="form-row">
              <label htmlFor="email">📧 Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
            </div>
            <div className="form-row">
              <label htmlFor="phone">📞 Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={updateField} placeholder="01XXX-XXXXXX" />
            </div>
            <div className="form-row">
              <label htmlFor="role">🎭 Role</label>
              <select id="role" name="role" value={form.role} onChange={updateField}>
                <option>Commuter</option>
                <option>Driver</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="password">🔒 Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={updateField} placeholder="Minimum 8 characters" minLength="8" required />
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '2px',
                          background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div className="form-footer">
              <Link to="/login">Already registered?</Link>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="panel-subtitle" style={{ marginTop: '18px' }}>
            Authority and administrator accounts are provisioned outside public registration.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
