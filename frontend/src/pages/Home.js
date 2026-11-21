import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic } from '../data/trafficDemoData';

const curatedPrograms = [
  {
    tag: 'METRO TRANSIT',
    title: 'MRT-6 Metro Guide & Tracker',
    description: 'Real-time estimated train positions, headway intervals, and station interchange guides from Uttara to Motijheel.',
    to: '/smart-hub?tool=metro-guide',
    badge: 'RAPID TRANSIT'
  },
  {
    tag: 'BRTA SHIELD',
    title: 'CNG & Rickshaw Fare Protection',
    description: 'Official distance & waiting time calculators to guarantee fair, non-exploitative fares across Dhaka.',
    to: '/smart-hub?tool=fare-checker',
    badge: 'OFFICIAL RATES'
  },
  {
    tag: 'BUS DIRECTORY',
    title: 'Dhaka Bus Route Finder',
    description: 'Instant origin-to-destination matching for local & express buses, direct boarding stages, and verified fares.',
    to: '/smart-hub?tool=bus-finder',
    badge: 'NETWORK DIRECTORY'
  },
  {
    tag: 'MONSOON DEFENSE',
    title: 'Waterlogging & Flood Avoidance',
    description: 'Live alerts for submerged roads in Shantinagar, Mirpur, and Old Dhaka with automated dry bypass detours.',
    to: '/smart-hub?tool=waterlogging',
    badge: 'HAZARD RADAR'
  },
  {
    tag: 'PARKING KOI',
    title: 'Commercial & Public Parking Hubs',
    description: 'Discover nearby secured parking spots, real-time bay capacities, hourly tariffs, and operating schedules.',
    to: '/smart-hub?tool=parking-finder',
    badge: 'LIVE CAPACITY'
  },
  {
    tag: 'TRAUMA CARE',
    title: 'Emergency Healthcare Directory',
    description: 'Instant geolocation to Dhaka hospitals, specialised trauma centres, and direct 24/7 hotline dispatch.',
    to: '/smart-hub?tool=hospital-finder',
    badge: '24/7 LIFELINE'
  },
  {
    tag: 'DEPARTURE TIMING',
    title: 'Optimal Travel Window Analyzer',
    description: 'Predictive 24-hour congestion curve graphs to pinpoint the quickest, lowest-stress departure times.',
    to: '/smart-hub?tool=best-time',
    badge: 'AI FORECAST'
  },
  {
    tag: 'CIVIC RADAR',
    title: 'Crowdsourced Incident Reporting',
    description: 'Report road damage, vehicle breakdowns, and bottlenecks with GPS coordinates for verified authority moderation.',
    to: '/report-incident',
    badge: 'VERIFIED DISPATCH'
  }
];

const quickRoutes = [
  { from: 'Mirpur 10', to: 'Motijheel' },
  { from: 'Uttara House Building', to: 'Gulshan 2' },
  { from: 'Dhanmondi 27', to: 'Hazrat Shahjalal Airport' },
  { from: 'Mohakhali', to: 'Farmgate' }
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
    ? { label: 'Heavy Congestion', color: '#e72a00', advice: 'Allow at least 25 extra minutes or take MRT-6.' }
    : congestion >= 60
      ? { label: 'Moderate Flow', color: '#e5b869', advice: 'Corridors are active. Inspect your road segment.' }
      : { label: 'Optimal Transit', color: '#2fbf71', advice: 'Clear corridors across Dhaka. Ideal departure window.' };

  const submitJourney = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ tool: 'route-planner', from: journey.from, to: journey.to });
    navigate(`/smart-hub?${params.toString()}`);
  };

  const setQuickRoute = (from, to) => {
    setJourney({ from, to });
    const params = new URLSearchParams({ tool: 'route-planner', from, to });
    navigate(`/smart-hub?${params.toString()}`);
  };

  return (
    <div className="friendly-home curzon-home">
      {/* Ticker marquee */}
      <div className="curzon-ticker-wrap">
        <div className="curzon-ticker-label">NOW SHOWING</div>
        <div className="curzon-ticker-track">
          <span>MRT-6 METRO LINE (RUNNING) • AIRPORT ROAD (+18M DELAY) • MIRPUR 10 CORRIDOR (ACTIVE) • MOHAKHALI FLYOVER • DHAKA BUS NETWORK (142 ROUTES) • BRTA FARE PROTECTION • WATERLOGGING BYPASS RADAR</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <Link className="home-alert curzon-alert" to="/smart-hub?tool=official-alerts">
          <span className="curzon-alert-badge">PRIORITY NOTICE</span>
          <span className="curzon-alert-text"><strong>{alerts[0].title}:</strong> {alerts[0].message}</span>
          <span className="curzon-alert-link">DETAILS →</span>
        </Link>
      )}

      {/* Cinematic Hero */}
      <section className="friendly-home-hero curzon-hero">
        <div className="friendly-home-copy curzon-hero-copy">
          <span className="citizen-kicker curzon-kicker">CURZON URBAN MOBILITY • DHAKA NETWORK</span>
          <h1 className="curzon-hero-title">THE CITY IN MOTION.</h1>
          <h2 className="curzon-hero-subtitle">Boutique intelligence for everyday Dhaka transit.</h2>
          <p className="curzon-hero-desc">
            Experience curated multi-modal route planning, high-frequency metro schedules, verified BRTA fare protection, and real-time civic hazard alerts.
          </p>

          {/* Curzon Cinema Booking Bar */}
          <div className="curzon-booking-box">
            <div className="curzon-booking-header">
              <span>EXPLORE JOURNEYS & CORRIDORS</span>
              <small>34 CITIZEN SERVICES AVAILABLE</small>
            </div>
            <form className="home-route-form curzon-route-form" onSubmit={submitJourney}>
              <label>
                <span>SELECT ORIGIN</span>
                <input
                  value={journey.from}
                  onChange={(event) => setJourney({ ...journey, from: event.target.value })}
                  placeholder="e.g. Mirpur 10, Uttara, Dhanmondi"
                  required
                />
              </label>
              <span className="route-form-arrow curzon-arrow" aria-hidden="true">→</span>
              <label>
                <span>SELECT DESTINATION</span>
                <input
                  value={journey.to}
                  onChange={(event) => setJourney({ ...journey, to: event.target.value })}
                  placeholder="e.g. Motijheel, Gulshan, Airport"
                  required
                />
              </label>
              <button type="submit" className="curzon-primary-btn">
                <span>PLAN JOURNEY</span>
                <span className="curzon-btn-arrow">→</span>
              </button>
            </form>

            <div className="curzon-quick-routes">
              <span className="curzon-quick-label">POPULAR CORRIDORS:</span>
              {quickRoutes.map((r, idx) => (
                <button
                  type="button"
                  key={idx}
                  className="curzon-route-chip"
                  onClick={() => setQuickRoute(r.from, r.to)}
                >
                  {r.from} ➔ {r.to}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Marquee Live Box */}
        <aside className="home-traffic-now curzon-traffic-marquee" style={{ '--traffic-color': trafficState.color }}>
          <div className="traffic-now-head curzon-marquee-head">
            <span className="curzon-live-tag">
              <span className="curzon-pulse-dot" /> LIVE TELEMETRY
            </span>
            <small className="curzon-marquee-date">DHAKA OBSERVER</small>
          </div>
          <div className="traffic-now-score curzon-marquee-score">
            <strong>{congestion}%</strong>
            <div className="curzon-score-meta">
              <b style={{ color: trafficState.color }}>{trafficState.label}</b>
              <span>Citywide Index</span>
            </div>
          </div>
          <p className="curzon-advice-box">{trafficState.advice}</p>
          <div className="traffic-now-stats curzon-marquee-stats">
            <div>
              <span>AVERAGE VELOCITY</span>
              <strong>{traffic.averageSpeed} km/h</strong>
            </div>
            <div>
              <span>MONITORED CORRIDORS</span>
              <strong>{traffic.corridors?.length || 0} Routes</strong>
            </div>
          </div>
          <Link className="curzon-marquee-cta" to="/live-traffic">
            <span>INSPECT ALL CORRIDORS</span>
            <span>→</span>
          </Link>
        </aside>
      </section>

      {/* Now Showing: Active Corridors */}
      <section className="home-road-preview curzon-section">
        <div className="friendly-section-heading curzon-section-head">
          <div>
            <span className="citizen-kicker curzon-kicker">NOW RUNNING</span>
            <h2>Live Corridor Screenings</h2>
            <p>Real-time vehicle velocities, corridor delays, and traffic bottleneck telemetry.</p>
          </div>
          <Link to="/live-traffic" className="curzon-link-gold">SEE ALL CORRIDORS →</Link>
        </div>

        <div className="home-road-grid curzon-corridor-grid">
          {traffic.corridors?.slice(0, 6).map((corridor) => {
            const color = corridor.congestion >= 80 ? '#e72a00' : corridor.congestion >= 60 ? '#e5b869' : '#2fbf71';
            const statusLabel = corridor.congestion >= 80 ? 'CRITICAL DELAY' : corridor.congestion >= 60 ? 'BUSY' : 'SMOOTH';
            return (
              <article key={corridor.id} className="curzon-corridor-card" style={{ '--road-color': color }}>
                <div className="curzon-card-top">
                  <span className="curzon-status-pill" style={{ color, borderColor: color }}>
                    <span className="curzon-mini-dot" style={{ background: color }} />
                    {statusLabel}
                  </span>
                  <span className="curzon-corridor-area">{corridor.area || 'DHAKA'}</span>
                </div>
                <h3 className="curzon-corridor-name">{corridor.name}</h3>
                <div className="curzon-corridor-metrics">
                  <div>
                    <small>DELAY</small>
                    <strong style={{ color }}>+{corridor.delayMin} min</strong>
                  </div>
                  <div>
                    <small>CURRENT SPEED</small>
                    <strong>{corridor.speedKph} km/h</strong>
                  </div>
                </div>
                <div className="curzon-corridor-bar">
                  <div className="curzon-bar-fill" style={{ width: `${Math.min(corridor.congestion, 100)}%`, background: color }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Curated Programs Grid */}
      <section className="home-need-section curzon-section">
        <div className="friendly-section-heading curzon-section-head">
          <div>
            <span className="citizen-kicker curzon-kicker">CURATED PROGRAM</span>
            <h2>Premier Citizen Services</h2>
            <p>Boutique, task-oriented urban mobility tools designed for instant execution.</p>
          </div>
          <Link to="/smart-hub" className="curzon-link-gold">EXPLORE ALL 34 SERVICES →</Link>
        </div>

        <div className="curzon-program-grid">
          {curatedPrograms.map((program, index) => (
            <Link to={program.to} key={index} className="curzon-program-card">
              <div className="curzon-program-top">
                <span className="curzon-badge-gold">{program.badge}</span>
                <span className="curzon-tag-subtle">{program.tag}</span>
              </div>
              <h3 className="curzon-program-title">{program.title}</h3>
              <p className="curzon-program-desc">{program.description}</p>
              <div className="curzon-program-footer">
                <span className="curzon-action-text">EXPLORE SERVICE</span>
                <span className="curzon-action-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curzon Membership & Privilege Banner */}
      <section className="curzon-membership-banner">
        <div className="curzon-membership-inner">
          <span className="curzon-kicker curzon-kicker-gold">TRAFFICEASE PRIVILEGE & MEMBERSHIP</span>
          <h2>Cultivate your daily city journey.</h2>
          <p>
            Elevate your daily travel with verified civic incident submissions, custom home-to-work route saves, real-time emergency dispatch hotlines, and authority-moderated advisories.
          </p>
          <div className="curzon-membership-actions">
            <Link className="curzon-primary-btn" to="/smart-hub">
              <span>EXPLORE SMART HUB</span>
              <span>→</span>
            </Link>
            <Link className="curzon-outline-btn" to="/login">
              <span>MEMBER PORTAL LOGIN</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
