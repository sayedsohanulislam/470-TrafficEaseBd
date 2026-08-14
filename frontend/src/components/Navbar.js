import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/live-traffic', icon: '🚦', label: 'Traffic' },
  { to: '/smart-hub?tool=route-planner', icon: '🧭', label: 'Plan route' },
  { to: '/smart-hub', icon: '✨', label: 'All services' },
  { to: '/dashboard', icon: '👤', label: 'My account' }
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="navbar friendly-navbar">
      <div className="nav-inner">
        <Link className="brand friendly-brand" to="/" onClick={closeMenu} aria-label="TrafficEase BD home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span className="friendly-brand-copy"><strong>TrafficEase</strong><small>Bangladesh</small></span>
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? 'active' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="bar" /><span className="bar" /><span className="bar" />
        </button>

        <nav className={`nav-links friendly-nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} className="nav-link friendly-nav-link" to={item.to} onClick={closeMenu} end={item.end}>
              <span className="friendly-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink className="nav-link report-nav-btn friendly-report-link" to="/report-incident" onClick={closeMenu}>
            <span aria-hidden="true">📸</span>
            <span>Report a problem</span>
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-auth-mobile friendly-nav-account">
              <span>{user?.name || user?.role || 'User'}</span>
              <button className="nav-action" type="button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth-mobile friendly-nav-account">
              <NavLink className="nav-login-link" to="/login" onClick={closeMenu}>Login</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
