import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic } from '../data/trafficDemoData';

const QUICK_ACTIONS = [
  { icon: '🚦', label: 'Check Traffic', sub: 'See live conditions on Dhaka roads', to: '/live-traffic', color: '#f0525b' },
  { icon: '🗺️', label: 'Plan My Route', sub: 'Get directions between any two places', to: '/live-map', color: '#4c8dff' },
  { icon: '⚠️', label: 'Report a Problem', sub: 'Tell others about traffic, flooding or accidents', to: '/report-incident', color: '#ffb020' },
  { icon: '🔧', label: 'All Tools', sub: 'CNG fares, hospitals, bus routes and more', to: '/smart-hub', color: '#2fbf71' },
];

const Home = () => {
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/live-traffic').then(r => setTraffic(r.data)).catch(() => {});
    api.get('/alerts?active=true&limit=3').then(r => setAlerts(r.data?.items || r.data || [])).catch(() => {});
  }, []);

  const congestion = traffic.averageCongestion;
  const congestionLabel = congestion > 80 ? 'Heavy Traffic' : congestion > 60 ? 'Moderate Traffic' : 'Light Traffic';
  const congestionColor = congestion > 80 ? 'var(--danger)' : congestion > 60 ? 'var(--primary)' : 'var(--success)';

  return (
    <>
      {/* Active Alerts Strip */}
      {alerts.length > 0 && (
        <div className="alert-strip">
          <span className="alert-strip-icon">📢</span>
          <span>{alerts[0].title}: {alerts[0].message}</span>
          <Link to="/smart-hub" className="alert-strip-link">See all alerts →</Link>
        </div>
      )}

      {/* Hero */}
      <section className="hero upgraded-hero animate-in">
        <div className="hero-main">
          <div>
            <span className="eyebrow">Dhaka · Real-Time Traffic Platform</span>
            <h1>Know Dhaka's traffic — <em>before you leave.</em></h1>
            <p>
              TrafficEase BD helps Dhaka commuters check live road conditions, plan routes,
              find bus schedules, calculate CNG fares, and report problems — all in one place.
            </p>
            <div className="hero-signal-strip">
              <span className="live-dot" />
              LIVE · Dhaka network · Updated {new Date(traffic.generatedAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="hero-actions">
            <Link className="button" to="/live-traffic">Check Traffic Now</Link>
            <Link className="button secondary" to="/live-map">Plan Route</Link>
            <Link className="button secondary" to="/report-incident">Report Problem</Link>
          </div>
        </div>

        <aside className="panel hero-status">
          <div className="congestion-hero-ring" style={{ '--c': congestionColor }}>
            <div className="congestion-inner">
              <strong style={{ color: congestionColor }}>{congestion}%</strong>
              <span>Congestion</span>
            </div>
          </div>
          <h2 className="panel-title" style={{ justifyContent: 'center', textAlign: 'center', marginTop: 12 }}>
            <span style={{ color: congestionColor }}>●</span> {congestionLabel}
          </h2>
          <p className="panel-subtitle" style={{ textAlign: 'center' }}>
            Average speed: {traffic.averageSpeed} km/h across {traffic.corridors?.length || 0} monitored areas
          </p>
          <div className="status-list">
            {traffic.corridors?.slice(0, 4).map(c => (
              <div className="status-item" key={c.id}>
                <div><strong>{c.speedKph} km/h</strong><span>{c.area}</span></div>
                <span className={`badge ${c.congestion > 80 ? 'danger' : c.congestion > 60 ? 'warning' : 'success'}`}>{c.congestion}%</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Quick Actions */}
      <section className="home-quick-actions animate-in animate-in-delay-1">
        <h2 className="home-section-title">What do you need?</h2>
        <div className="quick-action-grid">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} className="qa-card" style={{ '--qa-color': a.color }}>
              <span className="qa-card-icon">{a.icon}</span>
              <strong>{a.label}</strong>
              <span>{a.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Corridors */}
      <section className="animate-in animate-in-delay-2">
        <h2 className="home-section-title">Live Road Status</h2>
        <div className="corridor-cards">
          {traffic.corridors?.slice(0, 6).map(c => (
            <div className="corridor-mini" key={c.id}>
              <div className="corridor-mini-bar" style={{ width: `${c.congestion}%`, background: c.congestion > 80 ? 'var(--danger)' : c.congestion > 60 ? 'var(--primary)' : 'var(--success)' }} />
              <span className="corridor-mini-name">{c.area || c.name}</span>
              <span className="corridor-mini-speed">{c.speedKph} km/h</span>
              <span className="corridor-mini-delay">{c.delayMin} min delay</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/live-traffic" className="button secondary">See all corridors →</Link>
        </div>
      </section>

      <div className="lane-divider" aria-hidden="true" />

      {/* How It Works */}
      <section className="animate-in animate-in-delay-3">
        <h2 className="home-section-title" style={{textAlign:'center'}}>How does it work?</h2>
        <div className="how-it-works">
          <article className="how-step">
            <div className="how-step-number">1</div>
            <div className="how-step-icon">📍</div>
            <h3>Report or Detect</h3>
            <p>Commuters flag congestion, accidents, or flooding. Our system continuously monitors Dhaka's key roads.</p>
          </article>
          <article className="how-step">
            <div className="how-step-number">2</div>
            <div className="how-step-icon">🔍</div>
            <h3>Analyze & Route</h3>
            <p>The system calculates the best bypass routes, estimates journey times, and alerts nearby drivers.</p>
          </article>
          <article className="how-step">
            <div className="how-step-number">3</div>
            <div className="how-step-icon">🚦</div>
            <h3>Act & Resolve</h3>
            <p>Authorities get notified. Drivers get route suggestions. Dhaka moves faster.</p>
          </article>
        </div>
      </section>

      <div className="lane-divider" aria-hidden="true" />

      {/* Feature Highlights */}
      <section className="animate-in animate-in-delay-3">
        <h2 className="home-section-title">Everything you need for Dhaka</h2>
        <div className="feature-highlights">
          {[
            { icon: '🚕', title: 'CNG Fare Calculator', desc: 'Know the exact fare before you get in.' },
            { icon: '🚌', title: 'Bus Route Finder', desc: 'Find which bus goes from your area to your destination.' },
            { icon: '🚇', title: 'Metro (MRT) Guide', desc: 'All MRT-6 stations, schedules, and connections.' },
            { icon: '🌊', title: 'Waterlogging Map', desc: 'Know which roads flood before it rains.' },
            { icon: '🏥', title: 'Hospital Finder', desc: 'Nearest emergency hospitals with contact numbers.' },
            { icon: '📞', title: 'Emergency Contacts', desc: 'Tap to call police, fire, flood hotline, and more.' },
          ].map(f => (
            <Link key={f.title} to="/smart-hub" className="feature-highlight-card">
              <span>{f.icon}</span>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/smart-hub" className="button">Explore All 20 Tools →</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
