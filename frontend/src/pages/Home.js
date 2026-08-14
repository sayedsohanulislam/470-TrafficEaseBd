import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic, featureModules } from '../data/trafficDemoData';

const fallbackStatus = {
  incidents: 0,
  vehicles: 0,
  activeAlerts: 0,
  parkingSpaces: 0
};

const Home = () => {
  const [status, setStatus] = useState(fallbackStatus);
  const [traffic, setTraffic] = useState(demoLiveTraffic);

  useEffect(() => {
    api.get('/summary')
      .then((response) => setStatus(response.data))
      .catch(() => setStatus(fallbackStatus));
    api.get('/live-traffic')
      .then((response) => setTraffic(response.data))
      .catch(() => setTraffic(demoLiveTraffic));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero upgraded-hero animate-in">
        <div className="hero-main">
          <div>
            <span className="eyebrow">Dhaka · Urban Mobility Command</span>
            <h1>Every road in the city, <em>read live.</em></h1>
            <p>
              TrafficEase BD turns raw congestion, signal phase, transit, and
              commuter-report data into one operating picture — so authorities
              can dispatch faster and drivers can choose a better route before
              they leave.
            </p>
            <div className="hero-signal-strip">
              <span className="live-dot" />
              LIVE FEED &middot; {traffic.city} network &middot; updated {new Date(traffic.generatedAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="hero-actions">
            <Link className="button" to="/live-traffic">Open Live Traffic</Link>
            <Link className="button secondary" to="/live-map">Open Map</Link>
            <Link className="button secondary" to="/report-incident">Report Incident</Link>
          </div>
        </div>

        <aside className="panel hero-status">
          <div className="score-ring small" style={{ '--score': `${traffic.averageCongestion}%` }}>
            <span>{traffic.averageCongestion}%</span>
          </div>
          <h2 className="panel-title" style={{ justifyContent: 'center', textAlign: 'center' }}>{traffic.networkStatus}</h2>
          <p className="panel-subtitle" style={{ textAlign: 'center' }}>Average live speed: {traffic.averageSpeed} km/h across {traffic.corridors.length} watched corridors.</p>
          <div className="status-list">
            <div className="status-item">
              <div><strong>{status.incidents}</strong><span>Open incidents</span></div>
              <span className="badge warning">Live</span>
            </div>
            <div className="status-item">
              <div><strong>{status.vehicles}</strong><span>Tracked vehicles</span></div>
              <span className="badge">Fleet</span>
            </div>
            <div className="status-item">
              <div><strong>{status.activeAlerts}</strong><span>Active alerts</span></div>
              <span className="badge danger">Alert</span>
            </div>
            <div className="status-item">
              <div><strong>{status.parkingSpaces}</strong><span>Available parking</span></div>
              <span className="badge success">Open</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Quick Access Panel */}
      <section className="quick-access animate-in animate-in-delay-1">
        <Link to="/live-traffic" className="quick-access-card">
          <div className="quick-access-icon qa-traffic">📡</div>
          <strong>Live Traffic</strong>
          <span>Real-time corridor monitoring</span>
        </Link>
        <Link to="/live-map" className="quick-access-card">
          <div className="quick-access-icon qa-map">🗺️</div>
          <strong>Route Planner</strong>
          <span>Smart bypass navigation</span>
        </Link>
        <Link to="/report-incident" className="quick-access-card">
          <div className="quick-access-icon qa-report">⚠️</div>
          <strong>Report Incident</strong>
          <span>Flag congestion or hazards</span>
        </Link>
        <Link to="/smart-hub" className="quick-access-card">
          <div className="quick-access-icon qa-smart">🧠</div>
          <strong>Smart Hub</strong>
          <span>20 Dhaka-specific tools</span>
        </Link>
      </section>

      {/* Live Corridor Stats */}
      <section className="grid grid-4 animate-in animate-in-delay-2">
        {traffic.corridors.slice(0, 4).map((corridor) => (
          <article className="stat-tile" key={corridor.id}>
            <span>{corridor.area}</span>
            <strong>{corridor.speedKph} km/h</strong>
            <p>{corridor.delayMin} min delay &middot; {corridor.congestion}% load &middot; trend {corridor.trend?.toLowerCase()}</p>
          </article>
        ))}
      </section>

      <div className="lane-divider" aria-hidden="true" />

      {/* How It Works */}
      <section className="section-header animate-in animate-in-delay-2">
        <div>
          <h2>How It Works</h2>
          <p>From incident to resolution in three simple steps.</p>
        </div>
      </section>

      <section className="how-it-works animate-in animate-in-delay-3">
        <article className="how-step">
          <div className="how-step-number">1</div>
          <div className="how-step-icon">📍</div>
          <h3>Report or Detect</h3>
          <p>Commuters flag congestion, accidents, or flooding. Sensors and live feeds detect anomalies automatically.</p>
        </article>
        <article className="how-step">
          <div className="how-step-number">2</div>
          <div className="how-step-icon">📊</div>
          <h3>Analyze & Route</h3>
          <p>Our engine processes live corridor data, calculates bypass routes, and predicts congestion spread across the Dhaka network.</p>
        </article>
        <article className="how-step">
          <div className="how-step-number">3</div>
          <div className="how-step-icon">🚦</div>
          <h3>Dispatch & Resolve</h3>
          <p>Authorities receive prioritized alerts. Drivers get bypass suggestions. Resolution times drop from hours to minutes.</p>
        </article>
      </section>

      <div className="lane-divider" aria-hidden="true" />

      {/* Platform Capabilities */}
      <section className="section-header animate-in animate-in-delay-3">
        <div>
          <h2>Platform Capabilities</h2>
          <p>30 feature modules span traffic, safety, transit, parking, planning, navigation, and authority operations — built for Dhaka.</p>
        </div>
        <Link className="button secondary" to="/live-traffic">View all features</Link>
      </section>

      <section className="feature-grid-home animate-in animate-in-delay-4">
        {featureModules.slice(0, 12).map((feature) => (
          <div className="feature-grid-card" key={feature.id}>
            <div className="fg-num">{String(feature.id).padStart(2, '0')}</div>
            <div className="fg-info">
              <strong>{feature.name}</strong>
              <small>{feature.group}</small>
            </div>
          </div>
        ))}
      </section>

      <div className="lane-divider" aria-hidden="true" />

      {/* Why TrafficEase BD */}
      <section className="section-header">
        <div>
          <h2>Why TrafficEase BD</h2>
          <p>The gap between "an incident happened" and "a unit is moving to fix it," measured in minutes.</p>
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>🔍 See it before you're in it</h3>
          <p>Corridor speeds, queue length, and signal load refresh continuously, so a route decision is made from what the road looks like right now — not ten minutes ago.</p>
        </article>
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>📋 One board for every desk</h3>
          <p>Traffic authority, dispatch, and field units work off the same incident queue and severity scale, so nothing is verified twice or missed entirely.</p>
        </article>
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>📢 Built from commuter reports</h3>
          <p>Anyone can flag congestion, roadwork, flooding, or a signal failure in seconds — reports feed straight into the same map authorities are watching.</p>
        </article>
      </section>
    </>
  );
};

export default Home;
