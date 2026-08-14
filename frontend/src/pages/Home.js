import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic } from '../data/trafficDemoData';

const homeActions = [
  {
    icon: '🧭',
    title: 'Plan a route',
    description: 'Compare travel time, distance, and cost',
    to: '/smart-hub?tool=route-planner',
    color: '#2563eb'
  },
  {
    icon: '🚌',
    title: 'Find a bus',
    description: 'See which bus to take, where to board, and the fare',
    to: '/smart-hub?tool=bus-finder',
    color: '#7c3aed'
  },
  {
    icon: '🚕',
    title: 'Check a fair price',
    description: 'Estimate CNG, rickshaw, and bus fares',
    to: '/smart-hub?tool=fare-checker',
    color: '#0f9f6e'
  },
  {
    icon: '📸',
    title: 'Report a problem',
    description: 'Report congestion, crashes, flooding, or road damage',
    to: '/report-incident',
    color: '#dc2626'
  },
  {
    icon: '🆘',
    title: 'Get emergency help',
    description: 'Call police, fire service, or an ambulance',
    to: '/smart-hub?tool=emergency-help',
    color: '#e11d48'
  },
  {
    icon: '🏥',
    title: 'Find a hospital',
    description: 'See nearby emergency services and phone numbers',
    to: '/smart-hub?tool=hospital-finder',
    color: '#0891b2'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [alerts, setAlerts] = useState([]);
  const [journey, setJourney] = useState({ from: '', to: '' });

  useEffect(() => {
    api.get('/live-traffic').then((response) => setTraffic(response.data)).catch(() => {});
    api.get('/alerts?active=true&limit=3').then((response) => setAlerts(response.data?.items || response.data || [])).catch(() => {});
  }, []);

  const congestion = traffic.averageCongestion;
  const trafficState = congestion >= 80
    ? { label: 'Heavy traffic', color: '#dc2626', advice: 'Leave extra time for your journey.' }
    : congestion >= 60
      ? { label: 'Roads are busy', color: '#d97706', advice: 'Check your route before you leave.' }
      : { label: 'Traffic is moving', color: '#0f9f6e', advice: 'This is a good time to travel.' };

  const submitJourney = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ tool: 'route-planner', from: journey.from, to: journey.to });
    navigate(`/smart-hub?${params.toString()}`);
  };

  return (
    <div className="friendly-home">
      {alerts.length > 0 && (
        <Link className="home-alert" to="/smart-hub?tool=official-alerts">
          <span className="home-alert-icon" aria-hidden="true">📢</span>
          <span><strong>Important alert:</strong> {alerts[0].title} — {alerts[0].message}</span>
          <b>View →</b>
        </Link>
      )}

      <section className="friendly-home-hero">
        <div className="friendly-home-copy">
          <span className="citizen-kicker">Everyday travel in Dhaka, made simpler</span>
          <h1>Where do you want to go?</h1>
          <h2>Plan before you leave.</h2>
          <p>Plan routes, find buses, check fair prices, view road conditions, and get emergency help—all in one place.</p>

          <form className="home-route-form" onSubmit={submitJourney}>
            <label>
              <span>From</span>
              <input value={journey.from} onChange={(event) => setJourney({ ...journey, from: event.target.value })} placeholder="For example: Mirpur 10" required />
            </label>
            <span className="route-form-arrow" aria-hidden="true">→</span>
            <label>
              <span>To</span>
              <input value={journey.to} onChange={(event) => setJourney({ ...journey, to: event.target.value })} placeholder="For example: Motijheel" required />
            </label>
            <button type="submit">Plan my route <span>→</span></button>
          </form>

          <div className="home-trust-row">
            <span>✓ Easy on mobile</span>
            <span>✓ Clear English</span>
            <span>✓ Most services work without login</span>
          </div>
        </div>

        <aside className="home-traffic-now" style={{ '--traffic-color': trafficState.color }}>
          <div className="traffic-now-head">
            <span><i /> Traffic right now</span>
            <small>Live</small>
          </div>
          <div className="traffic-now-score">
            <strong>{congestion}%</strong>
            <div><b>{trafficState.label}</b></div>
          </div>
          <p>{trafficState.advice}</p>
          <div className="traffic-now-stats">
            <div><span>Average speed</span><strong>{traffic.averageSpeed} km/h</strong></div>
            <div><span>Roads monitored</span><strong>{traffic.corridors?.length || 0}</strong></div>
          </div>
          <Link to="/live-traffic">See all road conditions →</Link>
        </aside>
      </section>

      <section className="home-need-section">
        <div className="friendly-section-heading">
          <div>
            <span className="citizen-kicker">Finish a task in one tap</span>
            <h2>What do you need?</h2>
            <p>Choose a task. Every card opens a tool you can use immediately.</p>
          </div>
          <Link to="/smart-hub">View all 20 services →</Link>
        </div>
        <div className="home-action-grid">
          {homeActions.map((action) => (
            <Link to={action.to} key={action.to} className="home-action-card" style={{ '--action-color': action.color }}>
              <span className="home-action-icon" aria-hidden="true">{action.icon}</span>
              <div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <span className="home-action-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-road-preview">
        <div className="friendly-section-heading">
          <div>
            <span className="citizen-kicker">Current conditions</span>
            <h2>Roads you may use</h2>
          </div>
          <Link to="/live-traffic">More roads →</Link>
        </div>
        <div className="home-road-grid">
          {traffic.corridors?.slice(0, 6).map((corridor) => {
            const color = corridor.congestion >= 80 ? '#dc2626' : corridor.congestion >= 60 ? '#d97706' : '#0f9f6e';
            return (
              <article key={corridor.id} style={{ '--road-color': color }}>
                <div><span className="road-state-dot" /> <strong>{corridor.area || corridor.name}</strong></div>
                <p>{corridor.name}</p>
                <div className="home-road-values"><strong>+{corridor.delayMin} min</strong><span>{corridor.speedKph} km/h</span></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-all-services">
        <div>
          <span className="citizen-kicker">20 practical everyday services</span>
          <h2>Do more than check information</h2>
          <p>Search a route, calculate fares, find buses and hospitals, call for help, report problems, and save your daily commute.</p>
        </div>
        <Link className="button" to="/smart-hub">Open all services</Link>
      </section>
    </div>
  );
};

export default Home;
