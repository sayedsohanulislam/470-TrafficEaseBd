import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [featureSearch, setFeatureSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  
  // Interactive Simulator Workspace States
  const [activeWorkspaceFeature, setActiveWorkspaceFeature] = useState(null);
  const [simCongestion, setSimCongestion] = useState(71);
  const [simSpeedCorridor, setSimSpeedCorridor] = useState('mirpur-farmgate');
  const [simSpeedVal, setSimSpeedVal] = useState(17);
  const [simQueueCars, setSimQueueCars] = useState(60);
  const [simSignalPhase, setSimSignalPhase] = useState('North-South Green');
  const [simSignalFailed, setSimSignalFailed] = useState({ Shahbagh: false, Farmgate: false, Banani: false });
  const [simWeatherRain, setSimWeatherRain] = useState(20);
  const [simFloodHeight, setSimFloodHeight] = useState(5);
  const [simAqi, setSimAqi] = useState(120);
  const [simTransitDelay, setSimTransitDelay] = useState(11);
  const [simMRTStation, setSimMRTStation] = useState('Uttara');
  const [simParkingLot, setSimParkingLot] = useState('pk-1');
  const [simParkingSpots, setSimParkingSpots] = useState(Array(12).fill(false)); // false = empty, true = reserved
  const [simCNGWait, setSimCNGWait] = useState(18);
  const [simPedestrianCalls, setSimPedestrianCalls] = useState(4);
  const [simRouteFrom, setSimRouteFrom] = useState('Mirpur 10');
  const [simRouteTo, setSimRouteTo] = useState('Farmgate');
  const [simETAComparisonDistance, setSimETAComparisonDistance] = useState(12);
  const [simAlertMsg, setSimAlertMsg] = useState('Traffic diverted from Paltan due to maintenance.');
  const [simAudits, setSimAudits] = useState([
    `[${new Date().toLocaleTimeString()}] Operations workspace initialized.`
  ]);

  const location = useLocation();

  // Audit logging utility
  const logAudit = (action) => {
    setSimAudits(prev => [
      `[${new Date().toLocaleTimeString()}] ${action}`,
      ...prev.slice(0, 7)
    ]);
  };

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

  // Unique groups for filtering
  const groups = useMemo(() => {
    const set = new Set(traffic.featureModules?.map(f => f.group) || []);
    return ['All', ...Array.from(set)];
  }, [traffic.featureModules]);

  // Filtered features list
  const filteredFeatures = useMemo(() => {
    let items = traffic.featureModules || [];
    if (selectedGroup !== 'All') {
      items = items.filter(f => f.group === selectedGroup);
    }
    if (featureSearch.trim()) {
      const query = featureSearch.toLowerCase();
      items = items.filter(f =>
        f.name.toLowerCase().includes(query) ||
        (f.description && f.description.toLowerCase().includes(query)) ||
        f.group.toLowerCase().includes(query)
      );
    }
    return items;
  }, [traffic.featureModules, selectedGroup, featureSearch]);

  // Listen to hash updates and perform smooth scrolling (resolving SPA hash routing problem)
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Render Custom Interactive Simulator Panel for each feature
  const renderWorkspaceContent = (feature) => {
    switch (feature.id) {
      case 1: // Live congestion index
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Congestion Level Slider</span>
                <strong>{simCongestion}%</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="100"
                value={simCongestion}
                onChange={(e) => {
                  setSimCongestion(Number(e.target.value));
                  logAudit(`Adjusted global congestion parameter to ${e.target.value}%.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <strong>Simulated Status:</strong>{' '}
              {simCongestion > 75 ? (
                <span className="badge danger">Severe Gridlock</span>
              ) : simCongestion > 40 ? (
                <span className="badge warning">Moderate Pressure</span>
              ) : (
                <span className="badge success">Fluid Corridor Flow</span>
              )}
              <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                Directly affects routing delays and estimates computed for standard commuters.
              </p>
            </div>
          </>
        );

      case 2: // Corridor speed monitor
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Select Corridor</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                value={simSpeedCorridor}
                onChange={(e) => {
                  setSimSpeedCorridor(e.target.value);
                  logAudit(`Switched speed target to ${e.target.value}`);
                }}
              >
                <option value="mirpur-farmgate">Mirpur 10 to Farmgate</option>
                <option value="gulshan-banani">Gulshan 1 to Banani</option>
                <option value="shahbagh-motijheel">Shahbagh to Motijheel</option>
              </select>
            </div>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Simulated Flow Speed</span>
                <strong>{simSpeedVal} km/h</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="5"
                max="60"
                value={simSpeedVal}
                onChange={(e) => {
                  setSimSpeedVal(Number(e.target.value));
                  logAudit(`Adjusted corridor speed to ${e.target.value} km/h.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>Normal Speed: <strong>35 km/h</strong></p>
              <p>Simulated delay on this path: <strong style={{ color: simSpeedVal < 15 ? 'var(--danger)' : 'var(--primary)' }}>{Math.max(0, Math.round((35 - simSpeedVal) * 1.5))} mins</strong></p>
            </div>
          </>
        );

      case 3: // Queue length estimator
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Vehicle Count at Intersection</span>
                <strong>{simQueueCars} cars</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="10"
                max="250"
                value={simQueueCars}
                onChange={(e) => {
                  setSimQueueCars(Number(e.target.value));
                  logAudit(`Updated vehicles in queue estimator to ${e.target.value} units.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>Average car length spacing: <strong>5.5m</strong></p>
              <p>Estimated physical queue length: <strong>{(simQueueCars * 5.5).toFixed(0)} meters</strong></p>
              <p>Estimated signal clearing window: <strong>{Math.round(simQueueCars * 1.8)} seconds</strong></p>
            </div>
          </>
        );

      case 4: // Signal phase tracking
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {['North-South Green', 'East-West Green', 'Pedestrian Call Active', 'Emergency Override Phase'].map(phase => (
                <button
                  key={phase}
                  type="button"
                  className={`button ${simSignalPhase === phase ? '' : 'secondary'}`}
                  style={{ height: '42px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setSimSignalPhase(phase);
                    logAudit(`Manually switched active controller phase to [${phase}].`);
                  }}
                >
                  {phase}
                </button>
              ))}
            </div>
            <div className="sim-result-box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: simSignalPhase.includes('Green') ? '#2fbf71' : simSignalPhase.includes('Call') ? '#ffb020' : '#f0525b',
                boxShadow: '0 0 10px currentColor'
              }} />
              <div>
                <strong>Active Signal Controller State:</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Timing interval active. Automatic reset in 30 seconds.</p>
              </div>
            </div>
          </>
        );

      case 5: // Adaptive signal timing
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Intersection Demand Level</span>
                <strong>{simCongestion}% load</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="10"
                max="100"
                value={simCongestion}
                onChange={(e) => {
                  setSimCongestion(Number(e.target.value));
                  logAudit(`Adjusted intersection demand for timing calculation to ${e.target.value}%.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <strong>Calculated Optimization Plan:</strong>
              <p style={{ marginTop: '8px' }}>Optimized Green Phase: <strong>{Math.round(30 + (simCongestion / 100) * 60)}s</strong></p>
              <p>Optimized Clearance Window: <strong>6s</strong></p>
              <p>Estimated capacity improvement: <strong style={{ color: 'var(--primary)' }}>+{Math.round((simCongestion / 4.5))}% flow</strong></p>
            </div>
          </>
        );

      case 6: // Signal failure alerts
        return (
          <>
            <p className="panel-subtitle">Toggle mock signal failure alerts at Dhaka checkpoints:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Shahbagh', 'Farmgate', 'Banani'].map(checkpoint => (
                <div className="sim-toggle-wrap" key={checkpoint}>
                  <span className="sim-toggle-text">{checkpoint} Controller Status</span>
                  <label className="sim-toggle">
                    <input
                      type="checkbox"
                      checked={simSignalFailed[checkpoint]}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSimSignalFailed(prev => ({ ...prev, [checkpoint]: val }));
                        logAudit(`Toggled controller failure status at ${checkpoint} to: ${val ? 'Alert Active' : 'Normal'}.`);
                      }}
                    />
                    <span className="sim-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <div className="sim-result-box">
              <strong>Active Emergency Broadcast:</strong>
              {Object.values(simSignalFailed).some(v => v) ? (
                <p style={{ color: 'var(--danger)', marginTop: '8px' }}>
                  ⚠️ Warning: Signal failure reported at: {Object.keys(simSignalFailed).filter(k => simSignalFailed[k]).join(', ')}. Field units dispatched.
                </p>
              ) : (
                <p style={{ color: 'var(--primary)', marginTop: '8px' }}>
                  ✓ All intersection controllers functioning normally.
                </p>
              )}
            </div>
          </>
        );

      case 7: // Incident reporting
        return (
          <div className="sim-result-box">
            <p><strong>Clickable & Fully Integrated Feature</strong></p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '8px' }}>
              This feature is mapped to our central database layer! You can report incidents directly using our reporter module:
            </p>
            <Link to="/report-incident" className="button" style={{ marginTop: '12px', height: '38px', fontSize: '0.85rem' }}>Open Incident Reporter</Link>
          </div>
        );

      case 8: // Incident verification queue
        return (
          <>
            <div className="status-list">
              <div className="status-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                <div>
                  <span className="badge danger">Unverified</span>
                  <strong style={{ marginTop: '6px' }}>Bus Breakdown near Kakrail</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Reported by Commuter at 02:40 PM</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="badge success" style={{ cursor: 'pointer' }} onClick={() => logAudit("Verified Kakrail bus breakdown incident report.")}>Approve Report</button>
                  <button type="button" className="badge danger" style={{ cursor: 'pointer' }} onClick={() => logAudit("Rejected/Dismissed Kakrail incident report.")}>Reject</button>
                </div>
              </div>
            </div>
          </>
        );

      case 9: // Emergency vehicle priority
        return (
          <>
            <div className="sim-toggle-wrap">
              <span className="sim-toggle-text">Active Ambulance Routing</span>
              <label className="sim-toggle">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    logAudit(`Emergency vehicle priority routing toggled: ${e.target.checked ? 'Active' : 'Standby'}.`);
                  }}
                />
                <span className="sim-toggle-slider" />
              </label>
            </div>
            <div className="sim-result-box">
              <p>AI Signal Action: <strong>Forced Green Cascade Corridor</strong></p>
              <p>Routing corridor: <strong>Mirpur Road to Shahbagh</strong></p>
            </div>
          </>
        );

      case 10: // School-zone safety mode
        return (
          <>
            <div className="sim-toggle-wrap">
              <span className="sim-toggle-text">School Zone Speed Limit Controls</span>
              <label className="sim-toggle">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    logAudit(`School zone speed limit controls toggled to ${e.target.checked ? 'Restricted' : 'Normal'}`);
                  }}
                />
                <span className="sim-toggle-slider" />
              </label>
            </div>
            <div className="sim-result-box">
              <p>Active safe speed limit: <strong>20 km/h</strong></p>
              <p>Affected location: <strong>Vikarunnisa School Approach Corridor</strong></p>
            </div>
          </>
        );

      case 11: // Weather impact scoring
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Rainfall Intensity</span>
                <strong>{simWeatherRain} mm/h</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="80"
                value={simWeatherRain}
                onChange={(e) => {
                  setSimWeatherRain(Number(e.target.value));
                  logAudit(`Adjusted rain intensity parameter to ${e.target.value} mm/h.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>Calculated Road Risk Index: <strong style={{ color: simWeatherRain > 50 ? 'var(--danger)' : 'var(--primary)' }}>{Math.round(20 + simWeatherRain * 0.9)}/100</strong></p>
              <p>Driving warning advice: <strong>{simWeatherRain > 40 ? 'Severe risk. Waterlogging hazards imminent.' : 'Normal cautious wet driving limits.'}</strong></p>
            </div>
          </>
        );

      case 12: // Flood-prone road alerts
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Waterlogging Depth Level</span>
                <strong>{simFloodHeight} inches</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="36"
                value={simFloodHeight}
                onChange={(e) => {
                  setSimFloodHeight(Number(e.target.value));
                  logAudit(`Set waterlogging height estimation at Farmgate sensor to ${e.target.value} inches.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              {simFloodHeight > 18 ? (
                <p style={{ color: 'var(--danger)' }}>⚠️ Alert: Road closed to passenger cars. Water depth exceeds exhaust manifold limit.</p>
              ) : simFloodHeight > 6 ? (
                <p style={{ color: 'var(--accent)' }}>⚠ Caution: Slow-moving water logged section. High clearance vehicles only.</p>
              ) : (
                <p style={{ color: 'var(--primary)' }}>✓ Minimal water flow accumulation. Safe for all vehicles.</p>
              )}
            </div>
          </>
        );

      case 13: // Air quality mobility note
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Dhaka AQI Score</span>
                <strong>{simAqi} AQI</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="30"
                max="450"
                value={simAqi}
                onChange={(e) => {
                  setSimAqi(Number(e.target.value));
                  logAudit(`Updated simulation AQI target index to ${e.target.value}.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <strong>Commuter Mobility Advisory:</strong>
              {simAqi > 200 ? (
                <p style={{ color: 'var(--danger)', marginTop: '8px' }}>Very Unhealthy. Mask mandates active for traffic units and field officers.</p>
              ) : simAqi > 100 ? (
                <p style={{ color: 'var(--accent)', marginTop: '8px' }}>Unhealthy for sensitive individuals. Consider air-conditioned transit routing.</p>
              ) : (
                <p style={{ color: 'var(--primary)', marginTop: '8px' }}>Good Air Quality levels. Ideal routing environment.</p>
              )}
            </div>
          </>
        );

      case 14: // Bus route status
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>BRTC Route Delay</span>
                <strong>{simTransitDelay} mins</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="60"
                value={simTransitDelay}
                onChange={(e) => {
                  setSimTransitDelay(Number(e.target.value));
                  logAudit(`Adjusted public transit BRTC route delay factor to ${e.target.value} minutes.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>Active route headway: <strong>{Math.round(10 + simTransitDelay * 0.4)} mins</strong></p>
              <p>Estimated route reliability: <strong>{Math.max(20, 100 - simTransitDelay * 1.5)}%</strong></p>
            </div>
          </>
        );

      case 15: // Metro connection status
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Feeder Station Connect</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                value={simMRTStation}
                onChange={(e) => {
                  setSimMRTStation(e.target.value);
                  logAudit(`Switched metro feeder schedule reference to ${e.target.value}`);
                }}
              >
                <option>Uttara North</option>
                <option>Agargaon</option>
                <option>Farmgate</option>
                <option>Motijheel</option>
              </select>
            </div>
            <div className="sim-result-box">
              <p>Station Status: <strong style={{ color: 'var(--primary)' }}>Online</strong></p>
              <p>Next Metro Train Arrival: <strong>3.5 mins</strong></p>
              <p>Associated feeder bus headway: <strong>7 mins</strong></p>
            </div>
          </>
        );

      case 16: // Transit delay prediction
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Road Congestion Index</span>
                <strong>{simCongestion}%</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="100"
                value={simCongestion}
                onChange={(e) => {
                  setSimCongestion(Number(e.target.value));
                  logAudit(`Adjusted road congestion parameter for AI transit prediction to ${e.target.value}%.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>AI Estimated Bus delay: <strong>{Math.round(simCongestion * 0.45)} mins</strong></p>
              <p>AI Estimated MRT delay: <strong>0 mins (Dedicated Track Flow)</strong></p>
            </div>
          </>
        );

      case 17: // Crowding level monitor
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Passenger Load Density</span>
                <strong>{simCongestion}% capacity</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="10"
                max="100"
                value={simCongestion}
                onChange={(e) => {
                  setSimCongestion(Number(e.target.value));
                  logAudit(`Adjusted transit crowd monitor density to ${e.target.value}%.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              {simCongestion > 80 ? (
                <p style={{ color: 'var(--danger)' }}>🔴 Critical Crowding: Boarding delays expected. Peak load routing active.</p>
              ) : simCongestion > 50 ? (
                <p style={{ color: 'var(--accent)' }}>🟡 Moderate Crowding: Standard seated capacity full. Standing room only.</p>
              ) : (
                <p style={{ color: 'var(--primary)' }}>🟢 Low Crowding: Plentiful seating. Fluid boarding conditions.</p>
              )}
            </div>
          </>
        );

      case 18: // Parking availability
        return (
          <>
            <p className="panel-subtitle">Click slots to simulate reservations on Kemal Ataturk lot grid:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '14px 0' }}>
              {simParkingSpots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: slot ? 'rgba(240, 82, 91, 0.2)' : 'rgba(47, 191, 113, 0.2)',
                    color: slot ? 'var(--danger)' : 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => {
                    const next = [...simParkingSpots];
                    next[idx] = !next[idx];
                    setSimParkingSpots(next);
                    logAudit(`Toggled Kemal Ataturk slot #${idx + 1} status.`);
                  }}
                >
                  P{idx + 1} {slot ? 'Full' : 'Free'}
                </button>
              ))}
            </div>
            <div className="sim-result-box">
              <p>Total Lots: <strong>12</strong></p>
              <p>Available Lots Remaining: <strong>{simParkingSpots.filter(v => !v).length}</strong></p>
            </div>
          </>
        );

      case 19: // Parking demand forecast
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Select Lot Target</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                value={simParkingLot}
                onChange={(e) => {
                  setSimParkingLot(e.target.value);
                  logAudit(`Switched parking forecast target to ${e.target.value}`);
                }}
              >
                <option value="pk-1">Banani Multiplex Lot</option>
                <option value="pk-2">Motijheel City Center Lot</option>
                <option value="pk-3">Kawran Bazar Lot</option>
              </select>
            </div>
            <div className="sim-result-box">
              <p>Forecasted Occupancy Peak: <strong>92% (from 5 PM to 8 PM)</strong></p>
              <p>Recommended Commuter Entry time: <strong>Before 4:30 PM</strong></p>
            </div>
          </>
        );

      case 20: // Ride-share pickup zones
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Active Cabs in Pickup Bay</span>
                <strong>{simQueueCars} vehicles</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="5"
                max="80"
                value={simQueueCars}
                onChange={(e) => {
                  setSimQueueCars(Number(e.target.value));
                  logAudit(`Adjusted active ride-share queue load count to ${e.target.value}.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              {simQueueCars > 50 ? (
                <p style={{ color: 'var(--danger)' }}>⚠️ Alert: Pickup bay overflow! Rerouting arriving drivers to secondary lane.</p>
              ) : (
                <p style={{ color: 'var(--primary)' }}>✓ Pickup bay flow capacity stable. Safe dwell timing.</p>
              )}
            </div>
          </>
        );

      case 21: // CNG stand availability
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>CNG Queue Waiting Time</span>
                <strong>{simCNGWait} mins</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="0"
                max="60"
                value={simCNGWait}
                onChange={(e) => {
                  setSimCNGWait(Number(e.target.value));
                  logAudit(`Adjusted mock CNG pressure delay wait to ${e.target.value} minutes.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>Queue length estimate: <strong>{Math.round(simCNGWait * 0.6)} CNG units</strong></p>
              <p>Average refill pressure: <strong>14.5 Bar (Normal)</strong></p>
            </div>
          </>
        );

      case 22: // Pedestrian crossing load
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setSimPedestrianCalls(prev => prev + 1);
                  logAudit("Triggered pedestrian crossing push-button request.");
                }}
              >
                🚨 Press Crossing Request Button
              </button>
            </div>
            <div className="sim-result-box">
              <p>Total queued crossing calls: <strong>{simPedestrianCalls}</strong></p>
              <p>Next crossing light cycle trigger window: <strong>{Math.max(10, 45 - simPedestrianCalls * 5)}s</strong></p>
            </div>
          </>
        );

      case 23: // Road work scheduling
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Select Scheduled Route Repairs</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                onChange={(e) => {
                  logAudit(`Mapped maintenance scheduling to ${e.target.value}.`);
                }}
              >
                <option>Tejgaon VIP Sewer Repairs (10 PM - 6 AM)</option>
                <option>Mirpur Metro Link Girder Work (11 PM - 5 AM)</option>
                <option>Kakrail Flyover Painting (Weekend Block)</option>
              </select>
            </div>
            <div className="sim-result-box">
              <p>Status: <strong style={{ color: 'var(--accent)' }}>Warning Scheduled</strong></p>
              <p>Detours automatically mapped onto the live routing engines.</p>
            </div>
          </>
        );

      case 24: // Event traffic plan
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Activate VIP/Stadia Routing Plan</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                onChange={(e) => {
                  logAudit(`Activated VIP routing plan for stadium event: ${e.target.value}.`);
                }}
              >
                <option>None (Standard Routing)</option>
                <option>Mirpur Stadium Cricket Match routing controls</option>
                <option>Parliament Approach Road Diversion</option>
              </select>
            </div>
            <div className="sim-result-box">
              <p>Traffic signals modified to support heavy event queues.</p>
            </div>
          </>
        );

      case 25: // Route recommendation
        return (
          <>
            <div className="grid grid-2" style={{ marginBottom: '14px' }}>
              <div className="form-row">
                <label>Origin</label>
                <select
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                  value={simRouteFrom}
                  onChange={(e) => {
                    setSimRouteFrom(e.target.value);
                    logAudit(`Switched origin waypoint to ${e.target.value}`);
                  }}
                >
                  <option>Mirpur 10</option>
                  <option>Gulshan 1</option>
                  <option>Shahbagh</option>
                  <option>Uttara</option>
                </select>
              </div>
              <div className="form-row">
                <label>Destination</label>
                <select
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                  value={simRouteTo}
                  onChange={(e) => {
                    setSimRouteTo(e.target.value);
                    logAudit(`Switched destination waypoint to ${e.target.value}`);
                  }}
                >
                  <option>Farmgate</option>
                  <option>Banani</option>
                  <option>Motijheel</option>
                  <option>Airport</option>
                </select>
              </div>
            </div>
            <div className="sim-result-box">
              <strong>Smart Route Advice:</strong>
              <p style={{ marginTop: '8px' }}>Recommended path: <strong>{simRouteFrom} &gt; Rokeya Sarani &gt; {simRouteTo}</strong></p>
              <p>Reliability: <strong>84%</strong>. Delay: <strong>11 mins</strong></p>
            </div>
          </>
        );

      case 26: // ETA comparison
        return (
          <>
            <div className="sim-slider-wrap">
              <div className="sim-slider-label">
                <span>Trip Distance Reference</span>
                <strong>{simETAComparisonDistance} km</strong>
              </div>
              <input
                type="range"
                className="sim-slider"
                min="2"
                max="40"
                value={simETAComparisonDistance}
                onChange={(e) => {
                  setSimETAComparisonDistance(Number(e.target.value));
                  logAudit(`Adjusted distance benchmark to ${e.target.value} km.`);
                }}
              />
            </div>
            <div className="sim-result-box">
              <p>🚘 Private Car ETA: <strong>{Math.round(simETAComparisonDistance * 3.5)} mins</strong></p>
              <p>🚊 MRT Feeder ETA: <strong>{Math.round(simETAComparisonDistance * 1.5 + 5)} mins</strong></p>
              <p>🚍 Public Bus ETA: <strong>{Math.round(simETAComparisonDistance * 4.2)} mins</strong></p>
            </div>
          </>
        );

      case 27: // Hotspot heat ranking
        return (
          <>
            <div className="status-list">
              <div className="status-item">
                <div><strong>1. Shahbagh Intersection</strong><span>Load Index: 91%</span></div>
                <span className="badge danger">Extreme</span>
              </div>
              <div className="status-item">
                <div><strong>2. Farmgate Footbridge</strong><span>Load Index: 82%</span></div>
                <span className="badge danger">Extreme</span>
              </div>
              <div className="status-item">
                <div><strong>3. Jatrabari Approach</strong><span>Load Index: 74%</span></div>
                <span className="badge warning">High</span>
              </div>
            </div>
          </>
        );

      case 28: // Authority dispatch board
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Select Response Unit to Dispatch</label>
              <select
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%' }}
                onChange={(e) => {
                  logAudit(`Dispatched emergency response squad: ${e.target.value}.`);
                }}
              >
                <option>Dhaka City Traffic Police Unit A</option>
                <option>Emergency Stalled Bus Tow Truck</option>
                <option>WASA Flooding Water Pump Squad</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="button" onClick={() => logAudit("Dispatched response team to Paltan Crossing.")}>
                Confirm Fleet Dispatch Order
              </button>
            </div>
          </>
        );

      case 29: // Public alert broadcast
        return (
          <>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <label>Enter Alert Text</label>
              <textarea
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', width: '100%', color: '#fff', resize: 'none', height: '60px' }}
                value={simAlertMsg}
                onChange={(e) => setSimAlertMsg(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="button"
                onClick={() => {
                  logAudit(`Broadcasted commuter warning: "${simAlertMsg}"`);
                  alert("Alert broadcasted successfully across the system!");
                }}
              >
                🚀 Broadcast Alert Message
              </button>
            </div>
          </>
        );

      case 30: // Audit-ready activity log
        return (
          <>
            <div className="status-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {simAudits.map((audit, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.01)',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    fontFamily: 'monospace'
                  }}
                >
                  {audit}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
              <button type="button" className="button secondary" onClick={() => setSimAudits([])}>
                Clear Audit Trail Logs
              </button>
            </div>
          </>
        );

      default:
        return <p>Interactive simulator panel is compiling for this module.</p>;
    }
  };

  return (
    <>
      {/* Interactive Command Workspace Side-Drawer */}
      {activeWorkspaceFeature && (
        <div className="workspace-overlay" onClick={() => setActiveWorkspaceFeature(null)}>
          <div className="workspace-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="workspace-header">
              <div className="workspace-title-area">
                <span className="eyebrow" style={{ marginBottom: '8px' }}>Module ID {String(activeWorkspaceFeature.id).padStart(2, '0')}</span>
                <h2>{activeWorkspaceFeature.name}</h2>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>Group: <strong>{activeWorkspaceFeature.group}</strong> | Status: <strong>{activeWorkspaceFeature.status}</strong></p>
              </div>
              <button
                type="button"
                className="workspace-close-btn"
                onClick={() => setActiveWorkspaceFeature(null)}
              >
                ✕
              </button>
            </div>
            <div className="workspace-body">
              <div className="workspace-section">
                <div className="workspace-section-title">Functional Simulation Panel</div>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--muted)' }}>
                  {activeWorkspaceFeature.description || `Interactive dashboard settings for the ${activeWorkspaceFeature.name} unit.`}
                </p>
                {renderWorkspaceContent(activeWorkspaceFeature)}
              </div>

              <div className="workspace-section">
                <div className="workspace-section-title">Session Audit Trail Logs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {simAudits.slice(0, 4).map((audit, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {audit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <stop offset="0%" stopColor="#2fbf71" stopOpacity="0.4"></stop>
                  <stop offset="100%" stopColor="#2fbf71" stopOpacity="0.01"></stop>
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

      <section className="section-header" id="features" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2>30 Feature Modules</h2>
          <p>Filter or search modules. Click on any module to open its interactive Operations Command Workspace panel!</p>
        </div>
      </section>

      {/* Feature Filter Search Bar and Tags */}
      <div className="panel" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          style={{
            width: '100%',
            height: '42px',
            padding: '0 16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            fontSize: '0.92rem',
            color: '#fff'
          }}
          placeholder="🔍 Search feature name, description or group..."
          value={featureSearch}
          onChange={(e) => setFeatureSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {groups.map(group => (
            <button
              key={group}
              type="button"
              className={`badge ${selectedGroup === group ? 'success' : ''}`}
              style={{ cursor: 'pointer', height: '28px', textTransform: 'none' }}
              onClick={() => setSelectedGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <section className="feature-grid">
        {filteredFeatures.map((feature) => (
          <article
            className="feature-card"
            key={feature.id}
            onClick={() => {
              setActiveWorkspaceFeature(feature);
              logAudit(`Opened Operations Workspace for: ${feature.name}.`);
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="feature-number">{String(feature.id).padStart(2, '0')}</span>
            <div>
              <h3 style={{ color: '#fff' }}>{feature.name}</h3>
              <p style={{ marginTop: '6px' }}>{feature.description || `${feature.group} module for TrafficEase BD.`}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', border: 'none' }}>{feature.group}</span>
              <span className={`badge ${feature.status === 'Active' ? 'success' : ''}`}>{feature.status}</span>
            </div>
          </article>
        ))}
        {filteredFeatures.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            No feature modules match your query.
          </div>
        )}
      </section>
    </>
  );
};

export default LiveTraffic;
