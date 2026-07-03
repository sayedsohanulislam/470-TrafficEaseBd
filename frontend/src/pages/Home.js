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
            <span className="eyebrow">Intelligent mobility platform</span>
            <h1>TrafficEase BD</h1>
            <p>
              A full urban traffic command system for Dhaka: live congestion,
              road speeds, signal phases, commuter reports, transit load,
              parking, dispatch, alerts, and route recommendations.
            </p>
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
          <h2 className="panel-title">{traffic.networkStatus}</h2>
          <p className="panel-subtitle">Average live speed: {traffic.averageSpeed} km/h.</p>
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
            <p>{corridor.delayMin} min delay - {corridor.congestion}% load</p>
          </article>
        ))}
      </section>

      <section className="section-header">
        <div>
          <h2>Platform Capabilities</h2>
          <p>30 feature modules are represented across traffic, safety, transit, parking, planning, navigation, and authority operations.</p>
        </div>
        <Link className="button secondary" to="/live-traffic#features">View All Features</Link>
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
    </>
  );
};

export default Home;
