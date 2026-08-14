import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer friendly-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>TrafficEase BD</span>
        </div>
        <p>Simple, safer, and more affordable travel across Dhaka.</p>
        <small>Practical travel help for everyday commuters.</small>
      </div>

      <div className="footer-col">
        <h4>Travel</h4>
        <Link to="/smart-hub?tool=route-planner">Plan a route</Link>
        <Link to="/smart-hub?tool=bus-finder">Find a bus</Link>
        <Link to="/smart-hub?tool=fare-checker">Check a fare</Link>
        <Link to="/live-traffic">Check traffic</Link>
      </div>

      <div className="footer-col">
        <h4>Help</h4>
        <Link to="/report-incident">Report a problem</Link>
        <Link to="/smart-hub?tool=emergency-help">Emergency numbers</Link>
        <Link to="/smart-hub?tool=hospital-finder">Find a hospital</Link>
        <Link to="/smart-hub?tool=my-reports">Track my reports</Link>
      </div>

      <div className="footer-col">
        <h4>Project</h4>
        <span>CSE 470 Software Engineering</span>
        <span>BRAC University</span>
        <Link to="/smart-hub">20 citizen services</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>

    <div className="footer-bottom">
      © {new Date().getFullYear()} <span>TrafficEase BD</span> · Built for everyday commuters in Bangladesh
    </div>
  </footer>
);

export default Footer;
