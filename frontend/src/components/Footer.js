import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>TrafficEase BD</span>
          </div>
          <p>Dhaka's real-time urban mobility command platform — turning raw traffic data into actionable intelligence for a safer, faster city.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/live-traffic">Live Traffic</Link>
          <Link to="/live-map">Map & Routes</Link>
        </div>

        <div className="footer-col">
          <h4>Features</h4>
          <Link to="/smart-hub">Smart Hub</Link>
          <Link to="/report-incident">Report Incident</Link>
          <Link to="/live-traffic">Corridor Watch</Link>
          <Link to="/smart-hub">CNG Fare Calculator</Link>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <a href="#">CSE 470 Project</a>
          <a href="#">BRAC University</a>
          <a href="#">Contact Team</a>
          <a href="#">GitHub Repository</a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} <span>TrafficEase BD</span> · CSE 470 Software Engineering · BRAC University
      </div>
    </footer>
  );
};

export default Footer;
