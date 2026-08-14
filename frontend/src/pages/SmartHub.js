import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  busRoutes, cngStands, congestionPatterns, dhakaAreas, emergencyContacts,
  fareRates, fuelStations, hospitals, mrtLine, mrtStations,
  parkingLocations, policeZones, roadClosures, schoolZones, waterloggingZones
} from '../data/dhakaData';

const dhakaCenter = [23.8103, 90.4125];
const TILE_URL = 'https://{s}.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}';
const TILE_SUB = ['mt0','mt1','mt2','mt3'];

const MapFly = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14, { animate: true }); }, [center, map]);
  return null;
};

const allTools = [
  { id: 1, icon: '🗺️', name: 'Route Planner', category: 'Navigation', desc: 'Find the best route between any two Dhaka locations with real road distance and time.' },
  { id: 2, icon: '🚕', name: 'CNG & Rickshaw Fare', category: 'Cost', desc: 'Calculate exact fare for any journey using official Dhaka CNG and rickshaw rates.' },
  { id: 3, icon: '📍', name: 'Live Incident Map', category: 'Safety', desc: 'See all reported traffic incidents across Dhaka plotted live on a map.' },
  { id: 4, icon: '⚠️', name: 'Report a Problem', category: 'Safety', desc: 'Quickly report congestion, accidents, flooding, or signal failures in your area.' },
  { id: 5, icon: '🚇', name: 'Metro (MRT) Guide', category: 'Transit', desc: 'View all MRT-6 stations on a map with schedules, first/last train times, and bus connections.' },
  { id: 6, icon: '🚌', name: 'Bus Route Finder', category: 'Transit', desc: 'Find which buses go between your origin and destination in Dhaka.' },
  { id: 7, icon: '🅿️', name: 'Parking Spot Finder', category: 'Parking', desc: 'Locate parking areas near any Dhaka location with rates and capacity.' },
  { id: 8, icon: '📞', name: 'Emergency Contacts', category: 'Safety', desc: 'One-tap call cards for police, fire, hospital, DNCC, and transport emergency lines.' },
  { id: 9, icon: '🌊', name: 'Waterlogging Map', category: 'Weather', desc: 'See flood-prone roads and areas in Dhaka with drainage notes and alternate routes.' },
  { id: 10, icon: '⛽', name: 'Fuel Station Finder', category: 'Transport', desc: 'Find petrol, diesel, and CNG filling stations across Dhaka.' },
  { id: 11, icon: '⏰', name: 'Best Time to Travel', category: 'Planning', desc: 'See hourly traffic patterns and find the best time to depart for your journey.' },
  { id: 12, icon: '🏥', name: 'Hospital Finder', category: 'Safety', desc: 'Locate emergency hospitals, clinics, and specialized medical centres in Dhaka.' },
  { id: 13, icon: '🏫', name: 'School Zone Alerts', category: 'Safety', desc: 'See school zones that are currently active — automatically turns red during school hours.' },
  { id: 14, icon: '🛺', name: 'CNG & Rickshaw Stands', category: 'Transport', desc: 'Find the nearest CNG auto-rickshaw or cycle-rickshaw stands with typical wait times.' },
  { id: 15, icon: '🚧', name: 'Road Closures', category: 'Planning', desc: 'View current and upcoming road closures and construction works across Dhaka.' },
  { id: 16, icon: '💰', name: 'Journey Cost Estimator', category: 'Cost', desc: 'Compare travel costs for CNG, bus, rickshaw, Uber/Pathao, metro, and car on any route.' },
  { id: 17, icon: '👮', name: 'Traffic Police Zones', category: 'Safety', desc: 'Find your nearest DMP traffic zone station with contact numbers.' },
  { id: 18, icon: '📋', name: 'My Reported Incidents', category: 'Personal', desc: 'Track the status of incidents you have submitted — Open, Investigating, or Resolved.' },
  { id: 19, icon: '🏠', name: 'Commute Planner', category: 'Personal', desc: 'Save your home and work location to get a daily traffic summary for your commute.' },
  { id: 20, icon: '📢', name: 'Authority Alerts', category: 'Operations', desc: 'View official traffic alerts. Authorities can broadcast new alerts to all users.' },
];

const categoryColors = {
  Navigation: 'var(--accent)', Cost: 'var(--success)', Safety: 'var(--danger)',
  Transit: 'var(--purple)', Parking: 'var(--primary)', Weather: '#38bdf8',
  Transport: '#fb923c', Planning: '#a78bfa', Personal: '#34d399', Operations: '#f43f5e'
};

const SmartHub = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTool, setActiveTool] = useState(null);
  const [catFilter, setCatFilter] = useState('All');
  const panelRef = useRef(null);

  const cats = ['All', ...Array.from(new Set(allTools.map(t => t.category)))];
  const filtered = catFilter === 'All' ? allTools : allTools.filter(t => t.category === catFilter);

  const openTool = (id) => {
    setActiveTool(id);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const closeTool = () => setActiveTool(null);

  return (
    <div className="tools-page">
      <div className="tools-page-header">
        <div>
          <h1>Dhaka Traffic Tools</h1>
          <p>20 real tools to help you navigate, plan, and stay safe in Dhaka.</p>
        </div>
        {activeTool && (
          <button className="button secondary" onClick={closeTool}>← Back to Tools</button>
        )}
      </div>

      {!activeTool && (
        <>
          <div className="tools-cat-filter">
            {cats.map(c => (
              <button
                key={c}
                className={`cat-chip ${catFilter === c ? 'active' : ''}`}
                onClick={() => setCatFilter(c)}
              >{c}</button>
            ))}
          </div>
          <div className="tools-grid">
            {filtered.map(tool => (
              <button
                key={tool.id}
                className="tool-card"
                onClick={() => openTool(tool.id)}
                style={{ '--tool-color': categoryColors[tool.category] }}
              >
                <div className="tool-card-icon">{tool.icon}</div>
                <div className="tool-card-body">
                  <span className="tool-card-cat">{tool.category}</span>
                  <strong className="tool-card-name">{tool.name}</strong>
                  <p className="tool-card-desc">{tool.desc}</p>
                </div>
                <span className="tool-card-arrow">→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {activeTool && (
        <div ref={panelRef} className="tool-panel animate-in">
          <ToolPanel toolId={activeTool} user={user} isAuthenticated={isAuthenticated} onClose={closeTool} />
        </div>
      )}
    </div>
  );
};

// ===================================================================
// ToolPanel — Renders the correct feature UI based on toolId
// ===================================================================
const ToolPanel = ({ toolId, user, isAuthenticated, onClose }) => {
  const tool = allTools.find(t => t.id === toolId);
  if (!tool) return null;

  return (
    <div className="tool-panel-inner">
      <div className="tool-panel-title">
        <span>{tool.icon}</span>
        <div>
          <h2>{tool.name}</h2>
          <p>{tool.desc}</p>
        </div>
      </div>
      <div className="tool-panel-content">
        {toolId === 1 && <RoutePlanner />}
        {toolId === 2 && <CNGFareCalc />}
        {toolId === 3 && <LiveIncidentMap />}
        {toolId === 4 && <QuickReportForm />}
        {toolId === 5 && <MetroGuide />}
        {toolId === 6 && <BusRouteFinder />}
        {toolId === 7 && <ParkingFinder />}
        {toolId === 8 && <EmergencyContacts />}
        {toolId === 9 && <WaterloggingMap />}
        {toolId === 10 && <FuelStations />}
        {toolId === 11 && <BestTimeCalc />}
        {toolId === 12 && <HospitalFinder />}
        {toolId === 13 && <SchoolZones />}
        {toolId === 14 && <CNGStandFinder />}
        {toolId === 15 && <RoadClosures />}
        {toolId === 16 && <JourneyCost />}
        {toolId === 17 && <PoliceZones />}
        {toolId === 18 && <MyReports isAuthenticated={isAuthenticated} />}
        {toolId === 19 && <CommutePlanner />}
        {toolId === 20 && <AuthorityAlerts user={user} />}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 1: Route Planner Helpers & Component
// ===================================================================
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(',');
      return parts.slice(0, 3).join(',').trim();
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
  return `Location at (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const formatOSRMStep = (step) => {
  const name = step.name ? ` onto ${step.name}` : '';
  const modifier = step.maneuver.modifier ? ` ${step.maneuver.modifier}` : '';
  let instruction = '';

  if (step.maneuver.type === 'depart') {
    instruction = `Start journey ${step.name ? `on ${step.name}` : ''}`;
  } else if (step.maneuver.type === 'arrive') {
    instruction = 'Arrive at your destination';
  } else if (step.maneuver.type === 'turn') {
    instruction = `Turn${modifier}${name}`;
  } else {
    const typeLabel = step.maneuver.type.charAt(0).toUpperCase() + step.maneuver.type.slice(1);
    instruction = `${typeLabel}${modifier}${name}`;
  }

  return {
    instruction,
    distance: Math.round(step.distance)
  };
};

const RoutePlanner = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [fromLabel, setFromLabel] = useState('');
  const [toLabel, setToLabel] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickMode, setPickMode] = useState(null); // 'start', 'end', or null

  const geocode = async (query, isStart) => {
    if (isStart && fromCoords && query === fromLabel) {
      return fromCoords;
    }
    if (!isStart && toCoords && query === toLabel) {
      return toCoords;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Dhaka, Bangladesh')}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!data.length) throw new Error(`Location not found: ${query}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true); setError(''); setRoute(null);
    try {
      const [fCoords, tCoords] = await Promise.all([geocode(from, true), geocode(to, false)]);
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fCoords[1]},${fCoords[0]};${tCoords[1]},${tCoords[0]}?overview=full&geometries=geojson&steps=true`;
      const osrmRes = await fetch(osrmUrl);
      const osrmData = await osrmRes.json();
      if (osrmData.code !== 'Ok') throw new Error('Could not find a route.');
      const leg = osrmData.routes[0].legs[0];
      const geometry = osrmData.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const steps = (leg.steps || []).map(formatOSRMStep);
      setRoute({
        fromCoords: fCoords,
        toCoords: tCoords,
        geometry,
        distanceKm: (leg.distance / 1000).toFixed(1),
        durationMin: Math.round(leg.duration / 60),
        steps
      });
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleMapClick = async (lat, lng) => {
    if (!pickMode) return;
    setLoading(true);
    setError('');
    try {
      const label = await reverseGeocode(lat, lng);
      if (pickMode === 'start') {
        setFrom(label);
        setFromLabel(label);
        setFromCoords([lat, lng]);
      } else if (pickMode === 'end') {
        setTo(label);
        setToLabel(label);
        setToCoords([lat, lng]);
      }
      setPickMode(null);
    } catch (err) {
      setError('Could not identify the picked location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="rp-form" style={{ alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--friendly-muted)', fontWeight: 'bold' }}>Starting point</span>
            <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
              <input className="tool-input" placeholder="From (e.g. Mirpur 10)" value={from} onChange={e => setFrom(e.target.value)} />
              <button
                type="button"
                className={`button ${pickMode === 'start' ? '' : 'secondary'}`}
                style={{ height: '46px', width: '46px', minWidth: 'auto', padding: 0, fontSize: '1.1rem', background: pickMode === 'start' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--friendly-border)' }}
                title="Choose start point on map"
                onClick={() => setPickMode(pickMode === 'start' ? null : 'start')}
              >
                📍
              </button>
            </div>
          </label>
        </div>

        <span className="route-search-arrow" style={{ alignSelf: 'center', marginBottom: '12px', fontSize: '1.2rem', color: 'var(--primary)' }} aria-hidden="true">→</span>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--friendly-muted)', fontWeight: 'bold' }}>Destination</span>
            <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
              <input className="tool-input" placeholder="To (e.g. Motijheel)" value={to} onChange={e => setTo(e.target.value)} />
              <button
                type="button"
                className={`button ${pickMode === 'end' ? '' : 'secondary'}`}
                style={{ height: '46px', width: '46px', minWidth: 'auto', padding: 0, fontSize: '1.1rem', background: pickMode === 'end' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--friendly-border)' }}
                title="Choose destination on map"
                onClick={() => setPickMode(pickMode === 'end' ? null : 'end')}
              >
                🎯
              </button>
            </div>
          </label>
        </div>

        <button className="button" onClick={handleSearch} disabled={loading} style={{ height: '46px' }}>{loading ? 'Searching...' : '🔍 Find Route'}</button>
      </div>

      {pickMode && (
        <div className="plain-recommendation" style={{ background: 'rgba(251, 191, 36, 0.1)', borderLeft: '4px solid var(--primary)', margin: '10px 0', padding: '10px 14px', borderRadius: '8px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>📍 Map Pinning Active</span>
          <strong style={{ color: '#fff', fontSize: '0.88rem' }}>Click anywhere on the map below to set your {pickMode === 'start' ? 'Starting Point' : 'Destination'}.</strong>
        </div>
      )}

      {error && <div className="tool-error">{error}</div>}

      {(route || fromCoords || toCoords) && (
        <>
          {route && (
            <div className="route-stats">
              <div className="route-stat"><span>Distance</span><strong>{route.distanceKm} km</strong></div>
              <div className="route-stat"><span>Est. Time (Car)</span><strong>{route.durationMin} min</strong></div>
              <div className="route-stat"><span>CNG Fare</span><strong>Tk {Math.round(fareRates.cng.base + route.distanceKm * fareRates.cng.perKm)}–{Math.round(fareRates.cng.base + route.distanceKm * route.distanceKm * 1.2)}</strong></div>
              <div className="route-stat"><span>Bus Fare</span><strong>Tk {Math.max(15, Math.round(route.distanceKm * fareRates.bus.perKm + fareRates.bus.flat))}</strong></div>
            </div>
          )}
          <div className="tool-map-wrap">
            <MapContainer center={route ? route.fromCoords : fromCoords || toCoords} zoom={13} style={{ height: 380, width: '100%', borderRadius: 12 }}>
              <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
              <MapClickHandler onMapClick={handleMapClick} />
              {route && <MapFly center={route.fromCoords} />}
              {route && <Polyline positions={route.geometry} pathOptions={{ color: '#4c8dff', weight: 5 }} />}
              {(route || fromCoords) && (
                <CircleMarker center={route ? route.fromCoords : fromCoords} radius={10} pathOptions={{ color: '#2fbf71', fillColor: '#2fbf71', fillOpacity: 1 }}>
                  <Popup>Start: {from}</Popup>
                </CircleMarker>
              )}
              {(route || toCoords) && (
                <CircleMarker center={route ? route.toCoords : toCoords} radius={10} pathOptions={{ color: '#f0525b', fillColor: '#f0525b', fillOpacity: 1 }}>
                  <Popup>End: {to}</Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>

          {route && route.steps && route.steps.length > 0 && (
            <div className="simple-directions" style={{ marginTop: '16px', background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '6px' }}>📋 Step-by-Step Directions</h3>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {route.steps.map((step, idx) => (
                  <li key={idx} style={{ fontSize: '0.86rem', color: '#eee' }}>
                    <strong>{step.instruction}</strong> {step.distance > 0 && <span style={{ color: 'var(--friendly-muted)', fontSize: '0.78rem' }}>({step.distance} meters)</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ===================================================================
// Feature 2: CNG & Rickshaw Fare Calculator
// ===================================================================
const CNGFareCalc = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fares, setFares] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const geocode = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Dhaka, Bangladesh')}&limit=1`;
    const res = await fetch(url); const data = await res.json();
    if (!data.length) throw new Error(`Location not found: ${query}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const calculate = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true); setError(''); setFares(null);
    try {
      const [fc, tc] = await Promise.all([geocode(from), geocode(to)]);
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fc[1]},${fc[0]};${tc[1]},${tc[0]}?overview=false`);
      const data = await res.json();
      if (data.code !== 'Ok') throw new Error('Route not found.');
      const km = data.routes[0].legs[0].distance / 1000;
      setFares({
        km: km.toFixed(1),
        cng: { min: Math.round(fareRates.cng.base + km * fareRates.cng.perKm), max: Math.round(fareRates.cng.base + km * fareRates.cng.perKm * 1.25) },
        rickshaw: km < 5 ? { min: Math.round(fareRates.rickshaw.base + km * fareRates.rickshaw.perKm), max: Math.round(fareRates.rickshaw.base + km * fareRates.rickshaw.perKm * 1.3) } : null,
        bus: Math.max(15, Math.round(fareRates.bus.flat + km * fareRates.bus.perKm)),
        uber: { min: Math.round(fareRates.uber.base + km * fareRates.uber.perKm), max: Math.round(fareRates.uber.base + km * fareRates.uber.perKm * 1.3) },
        metro: Math.min(100, Math.round(fareRates.metro.base + km * fareRates.metro.perKm)),
      });
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="rp-form">
        <input className="tool-input" placeholder="From (e.g. Gulshan 2)" value={from} onChange={e => setFrom(e.target.value)} />
        <input className="tool-input" placeholder="To (e.g. Dhanmondi)" value={to} onChange={e => setTo(e.target.value)} />
        <button className="button" onClick={calculate} disabled={loading}>{loading ? 'Calculating...' : '💰 Calculate Fare'}</button>
      </div>
      {error && <div className="tool-error">{error}</div>}
      {fares && (
        <div className="fare-result">
          <p className="fare-distance">Road distance: <strong>{fares.km} km</strong></p>
          <div className="fare-grid">
            <div className="fare-card cng-card">🚕<span>CNG Auto</span><strong>Tk {fares.cng.min}–{fares.cng.max}</strong><small>Meter rate: Tk 40 base + Tk 12/km</small></div>
            {fares.rickshaw && <div className="fare-card">🛺<span>Rickshaw</span><strong>Tk {fares.rickshaw.min}–{fares.rickshaw.max}</strong><small>Short routes only</small></div>}
            <div className="fare-card">🚌<span>Bus</span><strong>Tk {fares.bus}</strong><small>City bus flat rate</small></div>
            <div className="fare-card">📱<span>Uber/Pathao</span><strong>Tk {fares.uber.min}–{fares.uber.max}</strong><small>App-based estimate</small></div>
            <div className="fare-card">🚇<span>Metro (MRT)</span><strong>Tk {fares.metro}</strong><small>If on MRT-6 route</small></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 3: Live Incident Map
// ===================================================================
const LiveIncidentMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/incidents?limit=50').then(res => {
      setIncidents(res.data?.items || res.data || []);
    }).catch(() => setIncidents([])).finally(() => setLoading(false));
  }, []);

  const sevColor = { Critical: '#f0525b', High: '#f97316', Medium: '#ffb020', Low: '#2fbf71' };

  return (
    <div>
      {loading && <div className="tool-loading">Loading incidents...</div>}
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 420, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {incidents.map(inc => {
            const coords = inc.coordinates ? [inc.coordinates[1], inc.coordinates[0]] : inc.location?.coordinates ? [inc.location.coordinates[1], inc.location.coordinates[0]] : null;
            if (!coords) return null;
            return (
              <CircleMarker key={inc._id} center={coords} radius={10} pathOptions={{ color: sevColor[inc.severity] || '#ffb020', fillColor: sevColor[inc.severity] || '#ffb020', fillOpacity: 0.85 }}>
                <Popup><strong>{inc.title}</strong><br/>{inc.type} · {inc.severity}<br/>{inc.locationName}</Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="incident-legend">
        {Object.entries(sevColor).map(([sev, col]) => (
          <span key={sev} className="legend-item"><span className="legend-dot" style={{ background: col }} />{sev}</span>
        ))}
        <span className="incident-count">{incidents.length} incidents on map</span>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 4: Quick Report Form
// ===================================================================
const QuickReportForm = () => {
  const TYPES = [
    { v: 'Congestion', icon: '🚗' }, { v: 'Accident', icon: '💥' },
    { v: 'Flooding', icon: '🌊' }, { v: 'Roadwork', icon: '🚧' },
    { v: 'Signal Failure', icon: '🚦' }, { v: 'Other', icon: '❓' }
  ];
  const AREAS = ['Mirpur','Gulshan','Farmgate','Banani','Motijheel','Dhanmondi','Uttara','Shahbagh','Mohakhali','Rampura'];
  const [form, setForm] = useState({ title: '', type: 'Congestion', severity: 'Medium', locationName: '', description: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title || !form.locationName) { setErr('Please fill in the title and location.'); return; }
    setLoading(true); setErr(''); setMsg('');
    try {
      await api.post('/incidents', { ...form, coordinates: [90.4125, 23.8103] });
      setMsg('Report submitted successfully! Thank you for helping Dhaka commuters.');
      setForm({ title: '', type: 'Congestion', severity: 'Medium', locationName: '', description: '' });
    } catch (e) { setErr(e.response?.data?.message || 'Could not submit report.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="quick-report">
      <div className="form-row"><label>What is the problem?</label><input className="tool-input" placeholder="e.g. Heavy traffic jam near circle" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
      <div className="form-row"><label>What kind of problem?</label>
        <div className="type-btn-group">{TYPES.map(t => <button key={t.v} className={`type-btn ${form.type === t.v ? 'active' : ''}`} onClick={() => setForm({...form, type: t.v})}>{t.icon} {t.v}</button>)}</div>
      </div>
      <div className="form-row"><label>Where? (Area)</label>
        <div className="area-chip-group">{AREAS.map(a => <button key={a} className={`area-chip ${form.locationName === a ? 'active' : ''}`} onClick={() => setForm({...form, locationName: a})}>{a}</button>)}</div>
        <input className="tool-input" style={{marginTop:8}} placeholder="Or type your location..." value={form.locationName} onChange={e => setForm({...form, locationName: e.target.value})} />
      </div>
      <div className="form-row"><label>Severity</label>
        <div className="type-btn-group">
          {['Low','Medium','High','Critical'].map(s => <button key={s} className={`type-btn sev-${s.toLowerCase()} ${form.severity === s ? 'active' : ''}`} onClick={() => setForm({...form, severity: s})}>{s}</button>)}
        </div>
      </div>
      <div className="form-row"><label>Tell us more (optional)</label><textarea className="tool-input" rows={3} placeholder="Any extra details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      {err && <div className="tool-error">{err}</div>}
      {msg && <div className="tool-success">{msg}</div>}
      <button className="button" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : '✓ Submit Report'}</button>
    </div>
  );
};

// ===================================================================
// Feature 5: Metro Guide
// ===================================================================
const MetroGuide = () => {
  const [selected, setSelected] = useState(null);

  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const isRunning = (h > 6 || (h === 6 && m >= 0)) && h < 22;

  return (
    <div>
      <div className="metro-status-bar">
        <span className={`badge ${isRunning ? 'success' : 'danger'}`}>{isRunning ? '🟢 MRT-6 Running' : '🔴 MRT-6 Not Running'}</span>
        <span>First train: 06:00 · Last train: 22:00</span>
        <span>Frequency: Every 10 minutes</span>
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={[23.78, 90.385]} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          <Polyline positions={mrtLine} pathOptions={{ color: '#9b7bff', weight: 4 }} />
          {mrtStations.map(st => (
            <CircleMarker key={st.id} center={st.coords} radius={8} pathOptions={{ color: '#9b7bff', fillColor: selected?.id === st.id ? '#fff' : '#9b7bff', fillOpacity: 1, weight: 2 }}
              eventHandlers={{ click: () => setSelected(st) }}>
              <Popup><strong>{st.name}</strong><br/>First: {st.firstTrain} · Last: {st.lastTrain}<br/>Nearby buses: {st.nearbyBus.join(', ')}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="station-info">
          <h3>🚇 {selected.name} Station</h3>
          <div className="station-grid">
            <div><span>Zone</span><strong>{selected.zone === 'N' ? 'North' : 'South'}</strong></div>
            <div><span>First Train</span><strong>{selected.firstTrain}</strong></div>
            <div><span>Last Train</span><strong>{selected.lastTrain}</strong></div>
            <div><span>Nearby Buses</span><strong>{selected.nearbyBus.join(', ')}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 6: Bus Route Finder
// ===================================================================
const BusRouteFinder = () => {
  const [fromArea, setFromArea] = useState('');
  const [toArea, setToArea] = useState('');
  const [results, setResults] = useState(null);

  const search = () => {
    if (!fromArea && !toArea) return;
    const lower = (s) => s.toLowerCase();
    const found = busRoutes.filter(r =>
      (!fromArea || r.stops.some(s => lower(s).includes(lower(fromArea))) || lower(r.from).includes(lower(fromArea))) &&
      (!toArea || r.stops.some(s => lower(s).includes(lower(toArea))) || lower(r.to).includes(lower(toArea)))
    );
    setResults(found);
  };

  return (
    <div>
      <div className="rp-form">
        <input className="tool-input" placeholder="From area (e.g. Mirpur)" value={fromArea} onChange={e => setFromArea(e.target.value)} />
        <input className="tool-input" placeholder="To area (e.g. Motijheel)" value={toArea} onChange={e => setToArea(e.target.value)} />
        <button className="button" onClick={search}>🔍 Find Buses</button>
      </div>
      {results !== null && (
        results.length === 0 ? (
          <div className="tool-error">No direct bus route found. Try a connecting area like Farmgate or Shahbagh.</div>
        ) : (
          <div className="bus-results">
            {results.map(r => (
              <div key={r.id} className="bus-card">
                <div className="bus-header"><span className="bus-number">{r.number}</span><strong>{r.name}</strong><span className="badge">{r.operator}</span></div>
                <div className="bus-details">
                  <span>Via: {r.via}</span>
                  <span>Frequency: {r.frequency}</span>
                  <span>Fare: {r.fare}</span>
                </div>
                <div className="bus-stops">{r.stops.map((s, i) => <span key={i} className="stop-chip">{s}</span>)}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

// ===================================================================
// Feature 7: Parking Finder
// ===================================================================
const ParkingFinder = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {parkingLocations.map(p => (
            <CircleMarker key={p.id} center={p.coords} radius={9} pathOptions={{ color: '#ffb020', fillColor: '#ffb020', fillOpacity: 0.9 }}
              eventHandlers={{ click: () => setSelected(p) }}>
              <Popup><strong>{p.name}</strong><br/>{p.area}<br/>Tk {p.ratePerHour}/hour · Capacity: {p.capacity}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="parking-info">
          <h3>🅿️ {selected.name}</h3>
          <div className="station-grid">
            <div><span>Area</span><strong>{selected.area}</strong></div>
            <div><span>Type</span><strong>{selected.type}</strong></div>
            <div><span>Capacity</span><strong>{selected.capacity} vehicles</strong></div>
            <div><span>Rate</span><strong>Tk {selected.ratePerHour}/hour</strong></div>
            <div><span>Hours</span><strong>{selected.openHours}</strong></div>
          </div>
        </div>
      )}
      {!selected && <p className="tool-hint">Click any orange marker on the map to see parking details.</p>}
    </div>
  );
};

// ===================================================================
// Feature 8: Emergency Contacts
// ===================================================================
const EmergencyContacts = () => {
  const cats = ['All', ...Array.from(new Set(emergencyContacts.map(c => c.category)))];
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? emergencyContacts : emergencyContacts.filter(c => c.category === cat);
  return (
    <div>
      <div className="tools-cat-filter">
        {cats.map(c => <button key={c} className={`cat-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="contact-grid">
        {filtered.map(c => (
          <div key={c.id} className="contact-card">
            <span className="contact-icon">{c.icon}</span>
            <div className="contact-body">
              <strong>{c.name}</strong>
              <span>{c.description}</span>
            </div>
            <a href={`tel:${c.number}`} className="contact-call-btn">📞 {c.number}</a>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 9: Waterlogging Map
// ===================================================================
const WaterloggingMap = () => {
  const [selected, setSelected] = useState(null);
  const sevColor = { severe: '#f0525b', moderate: '#ffb020', seasonal: '#4c8dff' };
  return (
    <div>
      <div className="incident-legend">
        <span className="legend-item"><span className="legend-dot" style={{background:'#f0525b'}} />Severe (always floods)</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#ffb020'}} />Moderate</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#4c8dff'}} />Seasonal</span>
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {waterloggingZones.map(z => (
            <CircleMarker key={z.id} center={z.coords} radius={14} pathOptions={{ color: sevColor[z.severity], fillColor: sevColor[z.severity], fillOpacity: 0.55, weight: 2 }}
              eventHandlers={{ click: () => setSelected(z) }}>
              <Popup><strong>{z.name}</strong><br/>{z.drainage}<br/>Alternate: {z.alternate}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="parking-info">
          <h3>🌊 {selected.name}</h3>
          <p><strong>Drainage:</strong> {selected.drainage}</p>
          <p><strong>Alternate route:</strong> {selected.alternate}</p>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 10: Fuel Station Finder
// ===================================================================
const FuelStations = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? fuelStations : fuelStations.filter(s => s.types.includes(filter));
  const fuelColor = { Octane: '#f97316', Diesel: '#6366f1', CNG: '#2fbf71' };
  return (
    <div>
      <div className="tools-cat-filter">
        {['All','Octane','Diesel','CNG'].map(f => <button key={f} className={`cat-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {filtered.map(s => (
            <CircleMarker key={s.id} center={s.coords} radius={9} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9 }}>
              <Popup><strong>{s.name}</strong><br/>{s.area}<br/>Types: {s.types.join(', ')}<br/>Hours: {s.hours}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 11: Best Time to Travel
// ===================================================================
const BestTimeCalc = () => {
  const [day, setDay] = useState('weekday');
  const [areaFilter] = useState('');
  const data = congestionPatterns[day];
  const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
  const best = data.indexOf(Math.min(...data.slice(6, 22)));
  const worst = data.indexOf(Math.max(...data));

  return (
    <div>
      <div className="tools-cat-filter">
        <button className={`cat-chip ${day === 'weekday' ? 'active' : ''}`} onClick={() => setDay('weekday')}>Weekday (Mon-Fri)</button>
        <button className={`cat-chip ${day === 'weekend' ? 'active' : ''}`} onClick={() => setDay('weekend')}>Weekend (Sat-Sun)</button>
      </div>
      <div className="time-chart">
        {data.map((val, i) => (
          <div key={i} className="time-bar-wrap" title={`${i}:00 — ${val}% congestion`}>
            <div className="time-bar" style={{ height: `${val}%`, background: val > 80 ? '#f0525b' : val > 60 ? '#ffb020' : '#2fbf71' }} />
            {i % 3 === 0 && <span className="time-label">{i}h</span>}
          </div>
        ))}
      </div>
      <div className="time-tips">
        <div className="tip-card good"><span>✅ Best time to travel</span><strong>{best}:00 – {best+1}:00</strong><p>Lowest congestion of the day ({data[best]}%)</p></div>
        <div className="tip-card bad"><span>❌ Avoid this time</span><strong>{worst}:00 – {worst+1}:00</strong><p>Peak congestion ({data[worst]}%)</p></div>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 12: Hospital Finder
// ===================================================================
const HospitalFinder = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? hospitals : hospitals.filter(h => h.type === filter);
  const hospColor = { Emergency: '#f0525b', General: '#4c8dff', Specialized: '#9b7bff' };
  return (
    <div>
      <div className="tools-cat-filter">
        {['All','Emergency','General','Specialized'].map(f => <button key={f} className={`cat-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 360, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {filtered.map(h => (
            <CircleMarker key={h.id} center={h.coords} radius={10} pathOptions={{ color: hospColor[h.type], fillColor: hospColor[h.type], fillOpacity: 0.9 }}>
              <Popup><strong>{h.name}</strong><br/>{h.area}<br/>{h.specialization}<br/>{h.emergency && '🚨 24/7 Emergency'}<br/>📞 {h.phone}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="incident-legend">
        {Object.entries(hospColor).map(([k,v]) => <span key={k} className="legend-item"><span className="legend-dot" style={{background:v}} />{k}</span>)}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 13: School Zone Alerts
// ===================================================================
const SchoolZones = () => {
  const now = new Date();
  const isWeekday = now.getDay() > 0 && now.getDay() < 6;
  const totalMin = now.getHours() * 60 + now.getMinutes();

  const isSchoolActive = (zone) => {
    if (!isWeekday) return false;
    const [sh, sm] = zone.startTime.split(':').map(Number);
    const [eh, em] = zone.endTime.split(':').map(Number);
    return totalMin >= sh * 60 + sm && totalMin <= eh * 60 + em;
  };

  const activeCount = schoolZones.filter(isSchoolActive).length;

  return (
    <div>
      <div className="metro-status-bar">
        {!isWeekday ? <span className="badge">Weekend — No School</span> :
          activeCount > 0 ? <span className="badge danger">🏫 {activeCount} school zones currently active — drive slowly</span> :
          <span className="badge success">✅ No school zones active right now</span>}
        <span>Current time: {now.toLocaleTimeString()}</span>
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 360, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {schoolZones.map(z => {
            const active = isSchoolActive(z);
            return (
              <CircleMarker key={z.id} center={z.coords} radius={12} pathOptions={{ color: active ? '#f0525b' : '#2fbf71', fillColor: active ? '#f0525b' : '#2fbf71', fillOpacity: active ? 0.8 : 0.45, weight: 2 }}>
                <Popup><strong>{z.name}</strong><br/>{z.area}<br/>School hours: {z.startTime}–{z.endTime}<br/>{active ? '⚠️ ACTIVE — Drive slowly' : '✅ Not active now'}</Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 14: CNG & Rickshaw Stand Finder
// ===================================================================
const CNGStandFinder = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? cngStands : cngStands.filter(s => s.type === filter);
  const standColor = { CNG: '#ffb020', Rickshaw: '#2fbf71' };
  return (
    <div>
      <div className="tools-cat-filter">
        {['All','CNG','Rickshaw'].map(f => <button key={f} className={`cat-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {filtered.map(s => (
            <CircleMarker key={s.id} center={s.coords} radius={9} pathOptions={{ color: standColor[s.type], fillColor: standColor[s.type], fillOpacity: 0.9 }}>
              <Popup><strong>{s.name}</strong><br/>{s.area}<br/>Type: {s.type}<br/>Wait: {s.waitTime}<br/>Peak: {s.peakHours}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="incident-legend">
        <span className="legend-item"><span className="legend-dot" style={{background:'#ffb020'}} />CNG Stand</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#2fbf71'}} />Rickshaw Stand</span>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 15: Road Closures Board
// ===================================================================
const RoadClosures = () => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? roadClosures : roadClosures.filter(r => r.status === filter);
  const sevClass = { full: 'danger', partial: 'warning', upcoming: '' };
  return (
    <div>
      <div className="tools-cat-filter">
        {['All','Active','Upcoming'].map(f => <button key={f} className={`cat-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="closure-list">
        {filtered.map(r => (
          <div key={r.id} className={`closure-card sev-${r.severity}`}>
            <div className="closure-header">
              <strong>{r.road}</strong>
              <span className={`badge ${sevClass[r.severity] || ''}`}>{r.status}</span>
            </div>
            <p><strong>Area:</strong> {r.area}</p>
            <p><strong>Reason:</strong> {r.reason}</p>
            <p><strong>Affected:</strong> {r.affectedLanes}</p>
            <p><strong>Detour:</strong> {r.detour}</p>
            <p className="closure-dates">{r.startDate} → {r.endDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 16: Journey Cost Estimator
// ===================================================================
const JourneyCost = () => {
  const [dist, setDist] = useState('');
  const [costs, setCosts] = useState(null);

  const calculate = () => {
    const km = parseFloat(dist);
    if (!km || km <= 0) return;
    setCosts({
      cng: `Tk ${Math.round(fareRates.cng.base + km * fareRates.cng.perKm)}–${Math.round(fareRates.cng.base + km * fareRates.cng.perKm * 1.25)}`,
      rickshaw: km < 4 ? `Tk ${Math.round(fareRates.rickshaw.base + km * fareRates.rickshaw.perKm)}–${Math.round(fareRates.rickshaw.base + km * fareRates.rickshaw.perKm * 1.3)}` : 'N/A (too far)',
      bus: `Tk ${Math.max(15, Math.round(fareRates.bus.flat + km * fareRates.bus.perKm))}`,
      uber: `Tk ${Math.round(fareRates.uber.base + km * fareRates.uber.perKm)}–${Math.round(fareRates.uber.base + km * fareRates.uber.perKm * 1.4)}`,
      metro: `Tk ${Math.min(100, Math.round(fareRates.metro.base + km * fareRates.metro.perKm))}`,
      car: `Tk ${Math.round(km * fareRates.car.fuelPerKm)} (fuel only)`,
    });
  };

  const modes = [
    { key: 'cng', icon: '🚕', name: 'CNG Auto' },
    { key: 'rickshaw', icon: '🛺', name: 'Rickshaw' },
    { key: 'bus', icon: '🚌', name: 'City Bus' },
    { key: 'uber', icon: '📱', name: 'Uber/Pathao' },
    { key: 'metro', icon: '🚇', name: 'MRT Metro' },
    { key: 'car', icon: '🚗', name: 'Own Car' },
  ];

  return (
    <div>
      <div className="rp-form">
        <input className="tool-input" type="number" min="0.5" step="0.5" placeholder="Distance in km (e.g. 5.5)" value={dist} onChange={e => setDist(e.target.value)} />
        <button className="button" onClick={calculate}>💰 Compare Costs</button>
      </div>
      {costs && (
        <div className="fare-grid">
          {modes.map(m => (
            <div key={m.key} className="fare-card">{m.icon}<span>{m.name}</span><strong>{costs[m.key]}</strong></div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 17: Traffic Police Zones
// ===================================================================
const PoliceZones = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <div className="tool-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} style={{ height: 380, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          {policeZones.map(z => (
            <CircleMarker key={z.id} center={z.coords} radius={11} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.85 }}
              eventHandlers={{ click: () => setSelected(z) }}>
              <Popup><strong>{z.name}</strong><br/>Jurisdiction: {z.zone}<br/>📞 {z.contact}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {selected && (
        <div className="parking-info">
          <h3>👮 {selected.name}</h3>
          <div className="station-grid">
            <div><span>Jurisdiction</span><strong>{selected.zone}</strong></div>
            <div><span>Contact</span><a href={`tel:${selected.contact}`} style={{color:'var(--primary)',fontWeight:700}}>{selected.contact}</a></div>
          </div>
        </div>
      )}
      {!selected && <p className="tool-hint">Click any blue marker to see zone details and contact number.</p>}
    </div>
  );
};

// ===================================================================
// Feature 18: My Reported Incidents
// ===================================================================
const MyReports = ({ isAuthenticated }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const sevClass = { Critical: 'danger', High: 'danger', Medium: 'warning', Low: 'success' };

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get('/incidents?limit=20').then(res => {
      setIncidents(res.data?.items || res.data || []);
    }).catch(() => setIncidents([])).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="tool-empty">
      <div className="empty-state-icon">🔒</div>
      <strong>Login required</strong>
      <p>Please <Link to="/login">log in</Link> to see your submitted reports.</p>
    </div>
  );

  if (loading) return <div className="tool-loading">Loading your reports...</div>;

  if (!incidents.length) return (
    <div className="tool-empty">
      <div className="empty-state-icon">📋</div>
      <strong>No reports yet</strong>
      <p>Reports you submit will appear here with their current status.</p>
    </div>
  );

  return (
    <div className="my-reports-list">
      {incidents.map(inc => (
        <div key={inc._id} className="report-card">
          <div className="report-header">
            <strong>{inc.title}</strong>
            <span className={`badge ${sevClass[inc.severity] || ''}`}>{inc.status}</span>
          </div>
          <div className="report-meta">
            <span>{inc.type}</span>
            <span>{inc.locationName}</span>
            <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===================================================================
// Feature 19: Commute Planner
// ===================================================================
const CommutePlanner = () => {
  const [home, setHome] = useState(() => localStorage.getItem('commute_home') || '');
  const [work, setWork] = useState(() => localStorage.getItem('commute_work') || '');
  const [saved, setSaved] = useState(() => !!(localStorage.getItem('commute_home') && localStorage.getItem('commute_work')));

  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() > 0 && now.getDay() < 6;
  const patterns = congestionPatterns[isWeekday ? 'weekday' : 'weekend'];
  const currentCongestion = patterns[hour];
  const recommend = currentCongestion > 80 ? { msg: 'Heavy traffic right now. Try leaving in 1–2 hours.', cls: 'bad' } :
    currentCongestion > 60 ? { msg: 'Moderate traffic. You can leave now, expect some delay.', cls: 'warn' } :
    { msg: 'Light traffic. Good time to travel!', cls: 'good' };

  const save = () => {
    localStorage.setItem('commute_home', home);
    localStorage.setItem('commute_work', work);
    setSaved(true);
  };

  const clear = () => {
    localStorage.removeItem('commute_home');
    localStorage.removeItem('commute_work');
    setHome(''); setWork(''); setSaved(false);
  };

  return (
    <div>
      <div className="rp-form">
        <input className="tool-input" placeholder="Your home area (e.g. Mirpur 10)" value={home} onChange={e => setHome(e.target.value)} />
        <input className="tool-input" placeholder="Your work area (e.g. Motijheel)" value={work} onChange={e => setWork(e.target.value)} />
        <div style={{display:'flex',gap:8}}>
          <button className="button" onClick={save}>💾 Save Route</button>
          {saved && <button className="button secondary" onClick={clear}>✕ Clear</button>}
        </div>
      </div>
      {saved && (
        <div className="commute-summary">
          <h3>Daily Commute: {home} → {work}</h3>
          <div className={`commute-status ${recommend.cls}`}>
            <strong>Right now ({now.toLocaleTimeString()})</strong>
            <p>{recommend.msg}</p>
            <div className="congestion-meter">
              <div className="congestion-fill" style={{ width: `${currentCongestion}%`, background: currentCongestion > 80 ? '#f0525b' : currentCongestion > 60 ? '#ffb020' : '#2fbf71' }} />
            </div>
            <small>City congestion level: {currentCongestion}%</small>
          </div>
          <p className="tool-hint">Tip: Traffic on this route is usually lightest between 10am–1pm and after 9pm on weekdays.</p>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 20: Authority Alerts
// ===================================================================
const AuthorityAlerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', area: 'All Dhaka', severity: 'Medium' });
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState('');
  const canPost = ['Admin', 'Authority'].includes(user?.role);
  const sevClass = { High: 'danger', Critical: 'danger', Medium: 'warning', Low: 'success' };

  useEffect(() => {
    api.get('/alerts?active=true').then(res => {
      setAlerts(res.data?.items || res.data || []);
    }).catch(() => setAlerts([])).finally(() => setLoading(false));
  }, []);

  const postAlert = async () => {
    if (!form.title || !form.message) return;
    setPosting(true);
    try {
      await api.post('/alerts', form);
      setMsg('Alert broadcast successfully.');
      setForm({ title: '', message: '', area: 'All Dhaka', severity: 'Medium' });
      const res = await api.get('/alerts?active=true');
      setAlerts(res.data?.items || res.data || []);
    } catch (e) { setMsg('Could not post alert: ' + (e.response?.data?.message || 'Server error')); }
    finally { setPosting(false); }
  };

  return (
    <div>
      {canPost && (
        <div className="alert-broadcast-form">
          <h3>📢 Broadcast New Alert</h3>
          <div className="form-row"><label>Alert Title</label><input className="tool-input" placeholder="e.g. Road closure at Farmgate" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div className="form-row"><label>Message</label><textarea className="tool-input" rows={2} placeholder="Details for commuters..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
          <div className="rp-form">
            <select className="tool-input" value={form.area} onChange={e => setForm({...form, area: e.target.value})}>
              <option>All Dhaka</option>
              {dhakaAreas.map(a => <option key={a}>{a}</option>)}
            </select>
            <select className="tool-input" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              {['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="button" onClick={postAlert} disabled={posting}>{posting ? 'Posting...' : '📢 Broadcast'}</button>
          </div>
          {msg && <div className="tool-success">{msg}</div>}
        </div>
      )}
      <h3>Active Alerts</h3>
      {loading && <div className="tool-loading">Loading alerts...</div>}
      {!loading && !alerts.length && <div className="tool-empty"><div className="empty-state-icon">✅</div><p>No active alerts right now.</p></div>}
      <div className="alerts-list">
        {alerts.map((alert, i) => (
          <div key={alert._id || i} className="alert-card">
            <div className="alert-header">
              <strong>{alert.title}</strong>
              <span className={`badge ${sevClass[alert.severity] || 'warning'}`}>{alert.severity}</span>
            </div>
            <p>{alert.message}</p>
            {alert.area && <span className="area-chip active">{alert.area}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartHub;
