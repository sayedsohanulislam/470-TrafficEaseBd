import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/', label: "WHAT'S ON", end: true },
  { to: '/live-traffic', label: 'LIVE CORRIDORS' },
  { to: '/smart-hub?tool=route-planner', label: 'ROUTE FINDER' },
  { to: '/smart-hub', label: 'CITIZEN HUB' },
  { to: '/dashboard', label: 'MEMBERSHIP' }
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
    <header className="navbar friendly-navbar curzon-navbar">
      <div className="nav-inner curzon-nav-inner">
        <Link className="brand friendly-brand curzon-brand" to="/" onClick={closeMenu} aria-label="TrafficEase BD home">
          <span className="curzon-brand-logo">
            <span className="curzon-red-mark" />
            <strong className="curzon-brand-title">TRAFFICEASE</strong>
          </span>
          <span className="curzon-brand-edition">CURZON EDITION • DHAKA</span>
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

        <nav className={`nav-links friendly-nav-links curzon-nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} className="nav-link friendly-nav-link curzon-nav-link" to={item.to} onClick={closeMenu} end={item.end}>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink className="nav-link report-nav-btn friendly-report-link curzon-report-link" to="/report-incident" onClick={closeMenu}>
            <span className="curzon-btn-dot" />
            <span>REPORT INCIDENT</span>
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-auth-mobile friendly-nav-account curzon-nav-account">
              <span className="curzon-user-badge">{user?.name || user?.role || 'Member'}</span>
              <button className="nav-action curzon-logout-btn" type="button" onClick={handleLogout}>LOGOUT</button>
            </div>
          ) : (
            <div className="nav-auth-mobile friendly-nav-account">
              <NavLink className="nav-login-link curzon-login-link" to="/login" onClick={closeMenu}>PORTAL LOGIN</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
