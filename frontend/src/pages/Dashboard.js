import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { demoLiveTraffic } from '../data/trafficDemoData';
import { useAuth } from '../context/AuthContext';

const initialState = {
  summary: null,
  incidents: [],
  vehicles: [],
  alerts: [],
  parking: [],
  traffic: demoLiveTraffic
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const canManage = ['Admin', 'Authority'].includes(user?.role);

  const loadData = () => {
    Promise.allSettled([
      api.get('/summary'),
      api.get('/incidents?limit=6'),
      api.get('/vehicles?limit=6'),
      api.get('/alerts?active=true'),
      api.get('/parking'),
      api.get('/live-traffic')
    ]).then((results) => {
      setData({
        summary: results[0].value?.data || null,
        incidents: results[1].value?.data?.items || [],
        vehicles: results[2].value?.data?.items || [],
        alerts: results[3].value?.data?.items || [],
        parking: results[4].value?.data?.items || [],
        traffic: results[5].value?.data || demoLiveTraffic
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionError('');
    try {
      await api.put(`/incidents/${id}`, { status });
      loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to update the incident.');
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm("Are you sure you want to delete this incident report?")) return;
    try {
      setActionError('');
      await api.delete(`/incidents/${id}`);
      loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to delete the incident.');
    }
  };

  const summary = data.summary || {
    incidents: data.incidents.length,
    vehicles: data.vehicles.length,
    activeAlerts: data.alerts.length,
    parkingSpaces: data.parking.reduce((sum, item) => sum + Number(item.availableSpaces || 0), 0)
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="breadcrumb animate-in">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Dashboard</span>
      </nav>

      <div className="section-header animate-in">
        <div>
          <h1>Your Traffic Dashboard</h1>
          <p>Monitor live incidents, corridors, and alerts for Dhaka.</p>
        </div>
      </div>

      {actionError && <div className="message error">{actionError}</div>}
      {!canManage && (
        <div className="message" style={{ marginBottom: '18px' }}>
          Signed in as {user?.role}. Incident moderation controls are restricted to Authority and Admin accounts.
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions animate-in animate-in-delay-1">
        <Link to="/report-incident" className="quick-action-btn">
          <span className="qa-icon">⚠️</span> Report Incident
        </Link>
        <Link to="/live-map" className="quick-action-btn">
          <span className="qa-icon">🗺️</span> Open Map
        </Link>
        <Link to="/live-traffic" className="quick-action-btn">
          <span className="qa-icon">📡</span> Live Traffic
        </Link>
        <Link to="/smart-hub" className="quick-action-btn">
          <span className="qa-icon">🧠</span> Smart Hub
        </Link>
      </div>

      {/* Stats */}
      <section className="grid grid-4 animate-in animate-in-delay-1" style={{ marginBottom: '24px' }}>
        <article className="stat-tile">
          <span>Open Incidents</span>
          <strong>{summary.incidents}</strong>
          <p>Active traffic emergencies</p>
        </article>
        <article className="stat-tile">
          <span>Tracked Vehicles</span>
          <strong>{summary.vehicles}</strong>
          <p>Emergency fleet units online</p>
        </article>
        <article className="stat-tile">
          <span>Active Alerts</span>
          <strong>{summary.activeAlerts}</strong>
          <p>Public broadcasts active</p>
        </article>
        <article className="stat-tile">
          <span>Traffic Load</span>
          <strong>{data.traffic.averageCongestion}%</strong>
          <p>Dhaka network pressure</p>
        </article>
      </section>

      <div className="lane-divider" aria-hidden="true" style={{ margin: '24px 0' }} />

      {/* Ops Grid */}
      <section className="ops-grid dashboard-ops animate-in animate-in-delay-2" style={{ marginBottom: '32px' }}>
        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>📊 Live Corridor Watch</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.traffic.corridors.slice(0, 5).map((corridor) => (
              <div className="mini-row" key={corridor.id}>
                <div>
                  <strong>{corridor.name}</strong>
                  <span>{corridor.cause}</span>
                </div>
                <span className={`badge ${corridor.congestion > 80 ? 'danger' : 'warning'}`}>{corridor.congestion}%</span>
                <div className="progress-track" style={{ gridColumn: '1 / -1', marginTop: '6px' }}><span style={{ width: `${corridor.congestion}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="card dense-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>🚨 Authority Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.traffic.dispatchQueue.map((task) => (
              <div className="mini-row" key={task.task}>
                <div>
                  <strong>{task.task}</strong>
                  <span>{task.owner}</span>
                </div>
                <span className={`badge ${task.priority === 'Critical' ? 'danger' : 'warning'}`}>{task.etaMin} min</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="lane-divider" aria-hidden="true" style={{ margin: '24px 0' }} />

      {/* Recent Incidents */}
      <section className="section-header animate-in animate-in-delay-2" style={{ margin: '20px 0 16px' }}>
        <div>
          <h2>Recent Incidents</h2>
          <p>{loading ? 'Loading command logs...' : 'Commuter-reported incidents and field operations feedback.'}</p>
        </div>
      </section>

      <div className="table-wrap animate-in animate-in-delay-3">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Location</th>
              <th style={{ width: '280px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.incidents.map((incident) => (
              <tr key={incident._id}>
                <td style={{ fontWeight: '600', color: '#fff' }}>{incident.title}</td>
                <td>{incident.type}</td>
                <td>
                  <span className={`badge ${incident.severity === 'High' || incident.severity === 'Critical' ? 'danger' : incident.severity === 'Medium' ? 'warning' : 'success'}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>
                    {incident.status}
                  </span>
                </td>
                <td>{incident.locationName}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Link
                      to="/live-map"
                      state={{ focusCoordinates: incident.coordinates || incident.location?.coordinates }}
                      className="badge success"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                    >
                      📍 Locate
                    </Link>
                    {canManage && incident.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(incident._id, 'Resolved')}
                        className="badge"
                        style={{ cursor: 'pointer', background: 'rgba(47, 191, 113, 0.1)', color: '#2fbf71', border: '1px solid rgba(47, 191, 113, 0.2)' }}
                      >
                        ✓ Resolve
                      </button>
                    )}
                    {canManage && incident.status === 'Open' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(incident._id, 'Investigating')}
                        className="badge"
                        style={{ cursor: 'pointer', background: 'rgba(255, 176, 32, 0.1)', color: '#ffb020', border: '1px solid rgba(255, 176, 32, 0.2)' }}
                      >
                        🔍 Investigate
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteIncident(incident._id)}
                        className="badge danger"
                        style={{ cursor: 'pointer' }}
                      >
                      ✕ Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      <div className="incident-card-list">
        {data.incidents.map((incident) => (
          <div key={incident._id} className="incident-mobile-card">
            <div className="imc-header">
              <strong>{incident.title}</strong>
              <span className={`badge ${incident.severity === 'High' || incident.severity === 'Critical' ? 'danger' : incident.severity === 'Medium' ? 'warning' : 'success'}`}>{incident.severity}</span>
            </div>
            <div className="imc-meta">
              <span>{incident.type}</span>
              <span>{incident.locationName}</span>
              <span className="badge" style={{background:'rgba(255,255,255,0.05)',color:'#fff'}}>{incident.status}</span>
            </div>
          </div>
        ))}
      </div>
        {!data.incidents.length && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <strong style={{ color: '#fff' }}>No incidents logged</strong>
            <p>When commuters or field units report incidents, they will appear here for coordination.</p>
          </div>
        )}
      </div>

      <div className="lane-divider" aria-hidden="true" style={{ margin: '24px 0' }} />

      {/* Alerts & Fleet */}
      <section className="grid grid-2 animate-in animate-in-delay-3" style={{ marginTop: '32px' }}>
        <article className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>🔔 Active Alerts</h2>
          <div className="status-list">
            {data.alerts.map((alert) => (
              <div className="status-item" key={alert._id}>
                <div>
                  <strong>{alert.title}</strong>
                  <span>{alert.area} - {alert.message}</span>
                </div>
                <span className="badge danger" style={{ whiteSpace: 'nowrap' }}>{alert.severity}</span>
              </div>
            ))}
            {!data.alerts.length && (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon">✅</div>
                <p>No active broadcast alerts.</p>
              </div>
            )}
          </div>
        </article>

        <article className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>🚗 Fleet Snapshot</h2>
          <div className="status-list">
            {data.vehicles.map((vehicle) => (
              <div className="status-item" key={vehicle._id}>
                <div>
                  <strong>{vehicle.vehicleNumber}</strong>
                  <span>{vehicle.type} - Driver: {vehicle.driverName || 'N/A'}</span>
                </div>
                <span className="badge success">{vehicle.status}</span>
              </div>
            ))}
            {!data.vehicles.length && (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon">🚗</div>
                <p>No fleet vehicles active.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
};

export default Dashboard;
