import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer friendly-footer curzon-footer">
      <div className="curzon-footer-newsletter">
        <div className="curzon-newsletter-content">
          <span className="curzon-kicker">CURZON DISPATCH & TRAFFIC INTELLIGENCE</span>
          <h3>Cultivate your daily city journey</h3>
          <p>Subscribe to receive high-priority corridor advisories, metro schedule shifts, and monsoon road warnings.</p>
        </div>
        <form className="curzon-newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          <button type="submit">{subscribed ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</button>
        </form>
      </div>

      <div className="footer-inner curzon-footer-inner">
        <div className="footer-brand curzon-footer-brand">
          <div className="brand">
            <span className="curzon-red-mark" />
            <span className="curzon-footer-logo">TRAFFICEASE</span>
          </div>
          <p>Curated urban mobility, real-time corridor intelligence, and transparent multi-modal transit for Dhaka.</p>
          <small className="curzon-heritage-tag">INSPIRED BY CINEMATIC EXCELLENCE & HIGHWAY TELEMETRY</small>
        </div>

        <div className="footer-col curzon-footer-col">
          <h4>PROGRAMMING</h4>
          <Link to="/smart-hub?tool=route-planner">Route Planner</Link>
          <Link to="/smart-hub?tool=bus-finder">Dhaka Bus Network</Link>
          <Link to="/smart-hub?tool=metro-guide">MRT-6 Metro Guide</Link>
          <Link to="/smart-hub?tool=fare-checker">BRTA Fare Protection</Link>
          <Link to="/live-traffic">Live Corridors</Link>
        </div>

        <div className="footer-col curzon-footer-col">
          <h4>SAFETY & LIFELINES</h4>
          <Link to="/report-incident">Report Road Problem</Link>
          <Link to="/smart-hub?tool=waterlogging">Monsoon Flood Detours</Link>
          <Link to="/smart-hub?tool=emergency-help">Emergency Hotlines</Link>
          <Link to="/smart-hub?tool=hospital-finder">Trauma Directory</Link>
          <Link to="/smart-hub?tool=my-reports">Track Submissions</Link>
        </div>

        <div className="footer-col curzon-footer-col">
          <h4>MEMBERSHIP & ACCESS</h4>
          <span>Intelligent Urban Platform</span>
          <span>Dhaka, Bangladesh</span>
          <Link to="/smart-hub">All 34 Citizen Services</Link>
          <Link to="/dashboard">Member Dashboard</Link>
          <Link to="/login">Authority & Citizen Login</Link>
        </div>
      </div>

      <div className="footer-bottom curzon-footer-bottom">
        <div>© {new Date().getFullYear()} <span>TrafficEase BD</span> · Curzon Edition · All Rights Reserved.</div>
        <div className="curzon-footer-legal">
          <span>TERMS</span>
          <span>PRIVACY</span>
          <span>COOKIES</span>
          <span>ACCESSIBILITY</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
