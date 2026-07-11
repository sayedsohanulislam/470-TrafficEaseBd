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
      <section className="hero upgraded-hero">
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

      <section className="grid grid-4">
        {traffic.corridors.slice(0, 4).map((corridor) => (
          <article className="stat-tile" key={corridor.id}>
            <span>{corridor.area}</span>
            <strong>{corridor.speedKph} km/h</strong>
            <p>{corridor.delayMin} min delay &middot; {corridor.congestion}% load &middot; trend {corridor.trend?.toLowerCase()}</p>
          </article>
        ))}
      </section>

      <div className="lane-divider" aria-hidden="true" />

      <section className="section-header">
        <div>
          <h2>Platform capabilities</h2>
          <p>30 feature modules span traffic, safety, transit, parking, planning, navigation, and authority operations — built for a single city, Dhaka, not a generic template.</p>
        </div>
        <Link className="button secondary" to="/live-traffic">View all features</Link>
      </section>

      <section className="feature-strip">
        {featureModules.slice(0, 10).map((feature) => (
          <article className="feature-pill-card" key={feature.id}>
            <span>{String(feature.id).padStart(2, '0')}</span>
            <strong>{feature.name}</strong>
            <small>{feature.group}</small>
          </article>
        ))}
      </section>

      <section className="section-header">
        <div>
          <h2>Why TrafficEase BD</h2>
          <p>The gap between "an incident happened" and "a unit is moving to fix it," measured in minutes.</p>
        </div>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>See it before you're in it</h3>
          <p>Corridor speeds, queue length, and signal load refresh continuously, so a route decision is made from what the road looks like right now — not ten minutes ago.</p>
        </article>
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>One board for every desk</h3>
          <p>Traffic authority, dispatch, and field units work off the same incident queue and severity scale, so nothing is verified twice or missed entirely.</p>
        </article>
        <article className="card">
          <h3 style={{ marginBottom: 8 }}>Built from commuter reports</h3>
          <p>Anyone can flag congestion, roadwork, flooding, or a signal failure in seconds — reports feed straight into the same map authorities are watching.</p>
        </article>
      </section>
    </>
  );
};

export default Home;
