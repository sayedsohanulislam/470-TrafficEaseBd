import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>TrafficEase BD</span>
        </Link>

        <button
          className={`nav-toggle ${menuOpen ? 'active' : ''}`}
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink className="nav-link" to="/" onClick={() => setMenuOpen(false)} end>🏠 Home</NavLink>
          <NavLink className="nav-link" to="/live-traffic" onClick={() => setMenuOpen(false)}>
            <span className="live-dot-sm" />Traffic Updates
          </NavLink>
          <NavLink className="nav-link" to="/live-map" onClick={() => setMenuOpen(false)}>🗺️ Route Map</NavLink>
          <NavLink className="nav-link" to="/smart-hub" onClick={() => setMenuOpen(false)}>🔧 Tools</NavLink>
          <NavLink className="nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>📊 Dashboard</NavLink>
          <NavLink className="nav-link report-nav-btn" to="/report-incident" onClick={() => setMenuOpen(false)}>⚠️ Report Problem</NavLink>
          {isAuthenticated ? (
            <div className="nav-auth-mobile">
              <span className="badge" style={{ alignSelf: 'center', margin: '8px 0' }}>{user?.role || 'User'}</span>
              <button className="nav-action" type="button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth-mobile">
              <NavLink className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink className="nav-link" to="/register" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
