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
    if (score <= 1) return { label: 'Too short / weak', level: 1, color: 'var(--danger)' };
    if (score <= 3) return { label: 'Medium strength', level: 2, color: 'var(--primary)' };
    return { label: 'Strong password', level: 3, color: 'var(--success)' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-split animate-in">
      {/* Branding Panel */}
      <div className="auth-brand-panel">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <h2>Join TrafficEase BD</h2>
        <p>Become part of Dhaka's friendly community road app. It is 100% free and open to everyone.</p>
        <div className="auth-brand-features">
          <div>
            <span className="auth-feature-icon">🏍️</span>
            <span>Simple, secure account for commuters & drivers</span>
          </div>
          <div>
            <span className="auth-feature-icon">📱</span>
            <span>Report traffic jams and help other drivers</span>
          </div>
          <div>
            <span className="auth-feature-icon">🏠</span>
            <span>Save your home & work routes for daily updates</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <section className="auth-card">
          <h1>Register</h1>
          <p>Create your account in 30 seconds.</p>
          {error && <div className="message error">{error}</div>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">👤 Full Name</label>
              <input id="name" name="name" value={form.name} onChange={updateField} placeholder="e.g. Abir Rahman" required />
            </div>
            <div className="form-row">
              <label htmlFor="email">📧 Email Address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="e.g. abir@domain.com" required />
            </div>
            <div className="form-row">
              <label htmlFor="phone">📞 Phone Number (Optional)</label>
              <input id="phone" name="phone" value={form.phone} onChange={updateField} placeholder="e.g. 01712345678" />
            </div>
            <div className="form-row">
              <label htmlFor="role">🎭 What do you do?</label>
              <select id="role" name="role" value={form.role} onChange={updateField}>
                <option value="Commuter">I am a Commuter (Bus, CNG, Rickshaw, Car)</option>
                <option value="Driver">I am a Driver / Ride-share rider</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="password">🔒 Create Password</label>
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
              <Link to="/login">Already have an account? Login</Link>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="panel-subtitle" style={{ marginTop: '18px' }}>
            We do not share your contact details. They are only used to help keep Dhaka's traffic updates clean and accurate.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
