import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { demoLiveTraffic, featureModules } from '../data/trafficDemoData';

const congestionClass = (value) => {
  if (value >= 80) return 'danger';
  if (value >= 60) return 'warning';
  return 'success';
};

const enrichTraffic = (traffic) => ({
  ...traffic,
  featureModules: (traffic.featureModules || featureModules).map((feature) => ({
    ...featureModules.find((item) => item.id === feature.id),
    ...feature
  }))
});

const LiveTraffic = () => {
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [selectedCorridor, setSelectedCorridor] = useState(demoLiveTraffic.corridors[0].id);
  const [history, setHistory] = useState([64, 68, 72, 70, 73, 71]);

  useEffect(() => {
    let alive = true;

    const loadTraffic = async () => {
      try {
        const { data } = await api.get('/live-traffic');
        if (alive) {
          const enriched = enrichTraffic(data);
          setTraffic(enriched);
          setUpdatedAt(new Date());
          setHistory(prev => {
            const next = [...prev.slice(1), enriched.averageCongestion];
            return next;
          });
        }
      } catch (error) {
        if (alive) {
          setTraffic((current) => {
            const nextCongestion = Math.min(96, Math.max(34, current.averageCongestion + (Math.random() > 0.5 ? 1 : -1)));
            const nextSpeed = Math.min(44, Math.max(12, current.averageSpeed + (Math.random() > 0.5 ? 1 : -1)));
            setHistory(prev => [...prev.slice(1), nextCongestion]);
            return {
              ...demoLiveTraffic,
              generatedAt: new Date().toISOString(),
              averageCongestion: nextCongestion,
              averageSpeed: nextSpeed
            };
          });
          setUpdatedAt(new Date());
        }
      }
    };

    loadTraffic();
    const interval = window.setInterval(loadTraffic, 8000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const selected = useMemo(
    () => traffic.corridors.find((corridor) => corridor.id === selectedCorridor) || traffic.corridors[0],
    [traffic.corridors, selectedCorridor]
  );

  const activeFeatures = traffic.featureModules?.filter((feature) => feature.status === 'Active').length || 0;
  const readyFeatures = traffic.featureModules?.filter((feature) => feature.status === 'Ready').length || 0;

  // Build dynamic SVG paths for real-time trend line
  const { linePath, areaPath } = useMemo(() => {
    const width = 300;
    const height = 80;
    const padding = 6;
    const points = history.map((val, idx) => {
      const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / 100) * (height - padding * 2);
      return { x, y };
    });
    const linePath = points.reduce((path, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
    const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z` : '';
    return { linePath, areaPath };
  }, [history]);

  return (
    <>
      <section className="hero upgraded-hero">
        <div className="hero-main">
          <div>
            <span className="eyebrow">Live command center</span>
            <h1>Dhaka traffic operations, not just a map.</h1>
            <p>
              Monitor congestion, road speeds, queue lengths, signal phases,
              dispatch tasks, cameras, transit load, weather impact, and route
              recommendations from one live operations surface.
            </p>
            <div className="hero-actions">
              <a className="button" href="#corridors">View Corridors</a>
              <a className="button secondary" href="#features">30 Feature Modules</a>
            </div>
          </div>
        </div>
        <aside className="panel hero-status">
          <div className="score-ring" style={{ '--score': `${traffic.averageCongestion}%` }}>
            <span>{traffic.averageCongestion}%</span>
          </div>
          <h2 className="panel-title">{traffic.networkStatus}</h2>
          <p className="panel-subtitle">Avg speed {traffic.averageSpeed} km/h across monitored corridors.</p>
          
          <div style={{ marginTop: '16px' }}>
            <span className="panel-subtitle" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>Congestion Trend (Live)</span>
            <svg className="chart-svg" viewBox="0 0 300 80" style={{ height: '70px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01"></stop>
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="300" y2="20" style={{ stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1 }} />
              <line x1="0" y1="40" x2="300" y2="40" style={{ stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1 }} />
              <line x1="0" y1="60" x2="300" y2="60" style={{ stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1 }} />
              <path d={areaPath} className="chart-area" />
              <path d={linePath} className="chart-line" />
            </svg>
          </div>

          <span className="badge warning" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>Updated {updatedAt.toLocaleTimeString()}</span>
        </aside>
      </section>

      <section className="grid grid-4">
        <article className="stat-tile">
          <span>Active features</span>
          <strong>{activeFeatures}</strong>
          <p>{readyFeatures} more configured</p>
        </article>
        <article className="stat-tile">
          <span>Queue length</span>
          <strong>{traffic.totalQueueMeters}m</strong>
          <p>Across critical corridors</p>
        </article>
        <article className="stat-tile">
          <span>Signal load</span>
          <strong>{traffic.signalPhases.length}</strong>
          <p>Intersections monitored</p>
        </article>
        <article className="stat-tile">
          <span>Camera checks</span>
          <strong>{traffic.cameras.length}</strong>
          <p>Vision feeds analyzed</p>
        </article>
      </section>

      <section className="ops-grid" id="corridors">
        <div className="ops-main">
          <div className="section-header compact" style={{ margin: '20px 0 16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Live Corridor Pressure</h2>
              <p>Speed, delay, queue length, cause, and authority recommendation.</p>
            </div>
          </div>

          <div className="corridor-list">
            {traffic.corridors.map((corridor) => (
              <button
                className={`corridor-row ${selected?.id === corridor.id ? 'selected' : ''}`}
                key={corridor.id}
                type="button"
                onClick={() => setSelectedCorridor(corridor.id)}
              >
                <div>
                  <strong>{corridor.name}</strong>
                  <span>{corridor.area} - {corridor.cause}</span>
                </div>
                <div className="corridor-metrics">
                  <span style={{ fontSize: '0.9rem', color: '#fff' }}>{corridor.speedKph} km/h</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{corridor.delayMin}m delay</span>
                  <span className={`badge ${congestionClass(corridor.congestion)}`}>{corridor.congestion}%</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${corridor.congestion}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="detail-panel" style={{ marginTop: '20px' }}>
          <div className="card" style={{ height: '100%' }}>
            <span className="eyebrow">Selected corridor</span>
            <h2 style={{ fontSize: '1.4rem', margin: '8px 0 16px' }}>{selected.name}</h2>
            <div className="detail-grid" style={{ marginBottom: '16px' }}>
              <div><span>Normal speed</span><strong>{selected.normalSpeedKph} km/h</strong></div>
              <div><span>Live speed</span><strong>{selected.speedKph} km/h</strong></div>
              <div><span>Queue</span><strong>{selected.queueMeters}m</strong></div>
              <div><span>Signal</span><strong>{selected.signal}</strong></div>
            </div>
            <p style={{ fontSize: '0.92rem', marginBottom: '16px', color: '#d1d5db' }}>{selected.recommendation}</p>
            <span className={`badge ${congestionClass(selected.congestion)}`}>{selected.trend}</span>
          </div>
        </aside>
      </section>

      <section className="grid grid-3">
        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Signal Phases</h2>
          {traffic.signalPhases.map((signal) => (
            <div className="mini-row" key={signal.intersection}>
              <div><strong>{signal.intersection}</strong><span>{signal.phase} ({signal.mode})</span></div>
              <div className="mini-value">{signal.secondsLeft}s</div>
              <div className="progress-track" style={{ gridColumn: '1 / -1', marginTop: '6px' }}><span style={{ width: `${signal.load}%` }} /></div>
            </div>
          ))}
        </article>

        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Dispatch Queue</h2>
          {traffic.dispatchQueue.map((task) => (
            <div className="mini-row" key={task.task}>
              <div><strong>{task.task}</strong><span>{task.owner}</span></div>
              <span className={`badge ${task.priority === 'Critical' ? 'danger' : 'warning'}`}>{task.etaMin} min</span>
            </div>
          ))}
        </article>

        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Weather Impact</h2>
          <div className="weather-block" style={{ padding: '8px 0' }}>
            <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block', marginBottom: '8px' }}>{traffic.weatherImpact.condition}</strong>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Road risk: {traffic.weatherImpact.roadRisk}. Flood risk: {traffic.weatherImpact.floodRisk}. Visibility: {traffic.weatherImpact.visibility}.</p>
            <div className="progress-track"><span style={{ width: `${traffic.weatherImpact.impactScore}%` }} /></div>
          </div>
        </article>
      </section>

      <section className="grid grid-3">
        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Camera Intelligence</h2>
          {traffic.cameras.map((camera) => (
            <div className="mini-row" key={camera.id}>
              <div><strong>{camera.location}</strong><span>{camera.finding}</span></div>
              <span className={`badge ${camera.status === 'Online' ? 'success' : 'warning'}`}>{camera.confidence}%</span>
            </div>
          ))}
        </article>

        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Transit Load</h2>
          {traffic.transitStatus.map((route) => (
            <div className="mini-row" key={route.route}>
              <div><strong>{route.route}</strong><span>{route.mode} - every {route.headwayMin} min</span></div>
              <span className={`badge ${route.crowding > 80 ? 'danger' : 'warning'}`}>{route.crowding}%</span>
            </div>
          ))}
        </article>

        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>Route Options</h2>
          {traffic.routeOptions.map((route) => (
            <div className="mini-row" key={route.name}>
              <div><strong>{route.name}</strong><span>{route.path}</span></div>
              <span className="badge success" style={{ whiteSpace: 'nowrap' }}>{route.etaMin} min</span>
            </div>
          ))}
        </article>
      </section>

      <section className="section-header" id="features">
        <div>
          <h2>30 Feature Modules</h2>
          <p>The project now presents a complete traffic platform scope across commuters, authorities, drivers, transit, parking, safety, and analytics.</p>
        </div>
      </section>

      <section className="feature-grid">
        {traffic.featureModules.map((feature) => (
          <article className="feature-card" key={feature.id}>
            <span className="feature-number">{String(feature.id).padStart(2, '0')}</span>
            <div>
              <h3 style={{ color: '#fff' }}>{feature.name}</h3>
              <p style={{ marginTop: '6px' }}>{feature.description || `${feature.group} module for TrafficEase BD.`}</p>
            </div>
            <span className={`badge ${feature.status === 'Active' ? 'success' : ''}`} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>{feature.status}</span>
          </article>
        ))}
      </section>
    </>
  );
};

export default LiveTraffic;
