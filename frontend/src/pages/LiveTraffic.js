import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic } from '../data/trafficDemoData';

const congestionTone = (value) => {
  if (value >= 80) return { label: 'Heavy', className: 'heavy', color: '#dc2626' };
  if (value >= 60) return { label: 'Busy', className: 'busy', color: '#d97706' };
  return { label: 'Moving', className: 'moving', color: '#0f9f6e' };
};

const leaveAdvice = (congestion) => {
  if (congestion >= 80) {
    return {
      title: 'Wait a little if you can',
      detail: 'Heavy traffic is causing long delays on several roads. Allow at least 25 extra minutes.',
      icon: '🔴'
    };
  }
  if (congestion >= 60) {
    return {
      title: 'Leave with extra time',
      detail: 'Roads are busy but moving. Keep 10–20 extra minutes and check your route first.',
      icon: '🟠'
    };
  }
  return {
    title: 'This is a good time to leave',
    detail: 'Most monitored roads are moving normally. Check your exact route before leaving.',
    icon: '🟢'
  };
};

const LiveTraffic = () => {
  const navigate = useNavigate();
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(new Date(demoLiveTraffic.generatedAt));
  const [dataState, setDataState] = useState('loading');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(demoLiveTraffic.corridors[0]?.id);
  const [journey, setJourney] = useState({ from: '', to: '' });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [trafficResult, alertResult, incidentResult] = await Promise.all([
          api.get('/live-traffic'),
          api.get('/alerts?active=true&limit=4'),
          api.get('/incidents?limit=6')
        ]);
        if (!active) return;
        setTraffic(trafficResult.data);
        setAlerts(alertResult.data?.items || alertResult.data || []);
        setIncidents(incidentResult.data?.items || incidentResult.data || []);
        setUpdatedAt(new Date(trafficResult.data.generatedAt || Date.now()));
        setDataState('connected');
      } catch (error) {
        if (!active) return;
        setTraffic(demoLiveTraffic);
        setUpdatedAt(new Date(demoLiveTraffic.generatedAt));
        setDataState('sample');
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!traffic.corridors?.some((corridor) => corridor.id === selectedId)) {
      setSelectedId(traffic.corridors?.[0]?.id);
    }
  }, [selectedId, traffic.corridors]);

  const filteredCorridors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return traffic.corridors || [];
    return (traffic.corridors || []).filter((corridor) => [
      corridor.name,
      corridor.area,
      corridor.cause
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [search, traffic.corridors]);

  const selected = traffic.corridors?.find((corridor) => corridor.id === selectedId) || traffic.corridors?.[0];
  const networkTone = congestionTone(traffic.averageCongestion);
  const advice = leaveAdvice(traffic.averageCongestion);

  const planRoute = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ tool: 'route-planner', from: journey.from, to: journey.to });
    navigate(`/smart-hub?${params.toString()}`);
  };

  return (
    <div className="commuter-traffic-page">
      <section className="traffic-decision-card" style={{ '--traffic-color': networkTone.color }}>
        <div className="traffic-decision-copy">
          <span className="citizen-kicker">Dhaka road conditions</span>
          <div className="connection-label">
            <span className={dataState === 'connected' ? 'connected' : ''} />
            {dataState === 'loading' ? 'Updating traffic info…' : dataState === 'connected' ? 'Live updates active' : 'Offline Mode (Showing guide)'}
          </div>
          <h1>{advice.title}</h1>
          <p>{advice.detail}</p>
          <div className="traffic-primary-actions">
            <Link className="button" to="/smart-hub?tool=route-planner">Plan a route</Link>
            <Link className="button secondary" to="/report-incident">Report a problem</Link>
          </div>
          <small>Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
        <div className={`friendly-traffic-score ${networkTone.className}`}>
          <span>{advice.icon}</span>
          <strong>{traffic.averageCongestion}%</strong>
          <b>{networkTone.label} traffic</b>
          <div>Average speed <strong>{traffic.averageSpeed} km/h</strong></div>
        </div>
      </section>

      <form className="inline-route-planner" onSubmit={planRoute}>
        <div>
          <span aria-hidden="true">🧭</span>
          <strong>Your journey</strong>
        </div>
        <label>
          <span>From</span>
          <input value={journey.from} onChange={(event) => setJourney({ ...journey, from: event.target.value })} placeholder="Mirpur 10" required />
        </label>
        <label>
          <span>To</span>
          <input value={journey.to} onChange={(event) => setJourney({ ...journey, to: event.target.value })} placeholder="Motijheel" required />
        </label>
        <button type="submit">Find the best route →</button>
      </form>

      {(alerts.length > 0 || incidents.length > 0) && (
        <section className="important-now">
          <div className="friendly-section-heading">
            <div>
              <span className="citizen-kicker">Important now</span>
              <h2>Before you leave</h2>
            </div>
            <Link to="/smart-hub?tool=incident-map">See problem map →</Link>
          </div>
          <div className="important-now-grid">
            {alerts.slice(0, 2).map((alert, index) => (
              <article className="important-card official" key={alert._id || `alert-${index}`}>
                <span>📢 Official alert</span>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
                <small>{alert.area || 'Dhaka'} · {alert.severity || 'Notice'}</small>
              </article>
            ))}
            {incidents.slice(0, 2).map((incident, index) => (
              <article className="important-card" key={incident._id || `incident-${index}`}>
                <span>⚠️ Commuter report</span>
                <h3>{incident.title}</h3>
                <p>{incident.description || incident.type || 'Road problem reported.'}</p>
                <small>{incident.locationName || 'Dhaka'} · {incident.status || 'Open'}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="friendly-road-section">
        <div className="friendly-section-heading">
          <div>
            <span className="citizen-kicker">Road status</span>
            <h2>Choose a road you use</h2>
            <p>Tap a road to see the delay and a simple recommendation.</p>
          </div>
          <label className="road-search">
            <span aria-hidden="true">🔎</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search road or area" aria-label="Search road or area" />
          </label>
        </div>

        <div className="friendly-road-layout">
          <div className="friendly-road-list">
            {filteredCorridors.map((corridor) => {
              const tone = congestionTone(corridor.congestion);
              return (
                <button type="button" key={corridor.id} className={selected?.id === corridor.id ? 'selected' : ''} onClick={() => setSelectedId(corridor.id)}>
                  <span className="road-state-dot" style={{ background: tone.color }} />
                  <span className="road-main-copy">
                    <strong>{corridor.area || corridor.name}</strong>
                    <small>{corridor.name}</small>
                  </span>
                  <span className="road-delay-copy">
                    <strong>+{corridor.delayMin} min</strong>
                    <small>{corridor.speedKph} km/h</small>
                  </span>
                  <span className={`friendly-status ${tone.className}`}>{tone.label}</span>
                </button>
              );
            })}
            {!filteredCorridors.length && <p className="no-road-result">No matching road. Try the area name.</p>}
          </div>

          {selected && (
            <aside className="friendly-road-detail" style={{ '--road-color': congestionTone(selected.congestion).color }}>
              <span className="citizen-kicker">Road details</span>
              <h2>{selected.area || selected.name}</h2>
              <p>{selected.name}</p>
              <div className="friendly-road-metrics">
                <div><span>Extra time</span><strong>+{selected.delayMin} min</strong></div>
                <div><span>Current speed</span><strong>{selected.speedKph} km/h</strong></div>
                <div><span>Usual speed</span><strong>{selected.normalSpeedKph} km/h</strong></div>
                <div><span>Queue</span><strong>{selected.queueMeters} m</strong></div>
              </div>
              <div className="plain-recommendation">
                <span>💡 What should I do?</span>
                <strong>{selected.recommendation || 'Allow extra time and check an alternate route.'}</strong>
              </div>
              <Link className="service-open-button" to="/smart-hub?tool=route-planner">Plan a route around this →</Link>
            </aside>
          )}
        </div>
      </section>

      <section className="real-services-cta">
        <div>
          <span className="citizen-kicker">Useful services</span>
          <h2>20 things you can actually do</h2>
          <p>Find a bus, calculate a fair price, call emergency help, submit a report, save your commute, and more.</p>
        </div>
        <Link className="button" to="/smart-hub">Open 20 services</Link>
      </section>
    </div>
  );
};

export default LiveTraffic;
