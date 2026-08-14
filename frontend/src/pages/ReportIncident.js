import React, { useState, useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  title: '',
  type: 'Congestion',
  severity: 'Medium',
  locationName: '',
  latitude: '',
  longitude: '',
  description: ''
};

const dhakaCenter = [23.8103, 90.4125];

const severityOptions = [
  { value: 'Low', label: 'Low', cssClass: 'sev-low', icon: '🟢' },
  { value: 'Medium', label: 'Medium', cssClass: 'sev-medium', icon: '🟡' },
  { value: 'High', label: 'High', cssClass: 'sev-high', icon: '🟠' },
  { value: 'Critical', label: 'Critical', cssClass: 'sev-critical', icon: '🔴' }
];

// Map Event Listener for Click-to-Pin
const LocationPicker = ({ onLocationSelected, position }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    }
  });
  return position ? (
    <CircleMarker
      center={position}
      radius={10}
      pathOptions={{ color: '#f0525b', fillColor: '#f0525b', fillOpacity: 0.8, weight: 2 }}
    />
  ) : null;
};

// Map panning controller
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const ReportIncident = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressLookup, setAddressLookup] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(dhakaCenter);
  const [currentStep, setCurrentStep] = useState(1);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleLocationPicked = (lat, lng) => {
    setForm(prev => ({
      ...prev,
      latitude: lat.toFixed(5),
      longitude: lng.toFixed(5)
    }));
    setMapCenter([lat, lng]);
  };

  // Geo-lookup for address typed by the user to position the map pin
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!addressLookup.trim()) return;

    setLookupLoading(true);
    try {
      const query = encodeURIComponent(`${addressLookup}, Dhaka, Bangladesh`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleLocationPicked(lat, lng);
        setForm(prev => ({ ...prev, locationName: addressLookup }));
      } else {
        setError('Location not found. Please pick manually on the map.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post('/incidents', {
        title: form.title,
        type: form.type,
        severity: form.severity,
        locationName: form.locationName,
        description: form.description,
        coordinates: [Number(form.longitude), Number(form.latitude)]
      });
      setForm(defaultForm);
      setAddressLookup('');
      setMapCenter(dhakaCenter);
      setCurrentStep(1);
      setMessage('✅ Report submitted for admin approval. You can track it from My Reported Incidents.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit this incident.');
    } finally {
      setLoading(false);
    }
  };

  const markerPosition = form.latitude && form.longitude
    ? [Number(form.latitude), Number(form.longitude)]
    : null;

  const canProceedStep1 = form.title && form.type && form.severity;
  const canProceedStep2 = form.locationName && form.latitude && form.longitude;

  return (
    <div className="form-panel animate-in" style={{ maxWidth: '1100px', margin: '20px auto' }}>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Report Incident</span>
      </nav>

      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Report Incident</h1>
      <p style={{ marginBottom: '24px' }}>
        Signed in as {user?.role}. Pin the exact incident location; an admin will review the report before it appears publicly.
      </p>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
          <span className="step-label">Details</span>
        </div>
        <div className="step-connector" />
        <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
          <span className="step-label">Location</span>
        </div>
        <div className="step-connector" />
        <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-label">Review</span>
        </div>
      </div>
      
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="animate-in">
            <div className="form-grid" style={{ marginTop: 0 }}>
              <div className="grid grid-2">
                <div className="form-row">
                  <label htmlFor="title">What is the problem?</label>
                  <input id="title" name="title" value={form.title} onChange={updateField} placeholder="e.g. Waterlogging near circle" required />
                </div>
                <div className="form-row">
                  <label htmlFor="type">What kind of problem?</label>
                  <div className="type-btn-group">
                    {[
                      { v: 'Congestion', icon: '🚗' },
                      { v: 'Accident', icon: '💥' },
                      { v: 'Roadwork', icon: '🚧' },
                      { v: 'Flooding', icon: '🌊' },
                      { v: 'Signal Failure', icon: '🚦' },
                      { v: 'Other', icon: '❓' }
                    ].map(t => (
                      <button key={t.v} type="button" className={`type-btn ${form.type === t.v ? 'active' : ''}`} onClick={() => setForm(prev => ({...prev, type: t.v}))}>
                        {t.icon} {t.v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label>Severity Level</label>
                <div className="severity-selector">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`severity-option ${opt.cssClass} ${form.severity === opt.value ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, severity: opt.value }))}
                    >
                      <span className="sev-dot" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="description">Tell us more (optional)</label>
                <textarea id="description" name="description" value={form.description} onChange={updateField} placeholder="Provide details about the blockages, delays, or emergency services needed." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="button" disabled={!canProceedStep1} onClick={() => setCurrentStep(2)}>
                  Next: Set Location →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="animate-in">
            <div className="form-grid" style={{ marginTop: 0 }}>
              <div className="form-row">
                <label htmlFor="locationName">Location Name</label>
                <input id="locationName" name="locationName" value={form.locationName} onChange={updateField} placeholder="e.g. Shahbagh, Banani" required />
              </div>

              <div className="area-chip-group" style={{marginBottom:8}}>
                {['Mirpur','Gulshan','Farmgate','Banani','Motijheel','Dhanmondi','Uttara','Shahbagh','Mohakhali','Rampura'].map(area => (
                  <button key={area} type="button" className={`area-chip ${form.locationName === area ? 'active' : ''}`} onClick={() => setForm(prev => ({...prev, locationName: area}))}>{area}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{
                    flexGrow: 1,
                    height: '42px',
                    padding: '0 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                  placeholder="Search address to place pin..."
                  value={addressLookup}
                  onChange={(e) => setAddressLookup(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch(e)}
                />
                <button
                  type="button"
                  className="button secondary"
                  style={{ height: '42px', padding: '0 16px' }}
                  onClick={handleAddressSearch}
                  disabled={lookupLoading}
                >
                  {lookupLoading ? 'Locating...' : '📍 Locate'}
                </button>
              </div>

              <div className="map-frame" style={{ height: '340px' }}>
                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                  <MapController center={mapCenter} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    subdomains={['a', 'b', 'c']}
                  />
                  <LocationPicker onLocationSelected={handleLocationPicked} position={markerPosition} />
                </MapContainer>
              </div>

              <div className="grid grid-2">
                <div className="form-row">
                  <label htmlFor="latitude">Latitude</label>
                  <input id="latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={updateField} readOnly required style={{ opacity: 0.8 }} />
                </div>
                <div className="form-row">
                  <label htmlFor="longitude">Longitude</label>
                  <input id="longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={updateField} readOnly required style={{ opacity: 0.8 }} />
                </div>
              </div>

              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
                💡 Click anywhere on the map to pin the incident's exact location.
              </span>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button type="button" className="button secondary" onClick={() => setCurrentStep(1)}>
                  ← Back
                </button>
                <button type="button" className="button" disabled={!canProceedStep2} onClick={() => setCurrentStep(3)}>
                  Next: Review →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="animate-in">
            <div className="summary-preview">
              <h3>Review Your Report</h3>
              <div className="summary-row">
                <span className="summary-label">Title</span>
                <span className="summary-value">{form.title || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Type</span>
                <span className="summary-value">{form.type}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Severity</span>
                <span className="summary-value">
                  <span className={`badge ${form.severity === 'High' || form.severity === 'Critical' ? 'danger' : form.severity === 'Medium' ? 'warning' : 'success'}`}>
                    {form.severity}
                  </span>
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Location</span>
                <span className="summary-value">{form.locationName || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Coordinates</span>
                <span className="summary-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {form.latitude}, {form.longitude}
                </span>
              </div>
              {form.description && (
                <div className="summary-row">
                  <span className="summary-label">Description</span>
                  <span className="summary-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{form.description}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" className="button secondary" onClick={() => setCurrentStep(2)}>
                ← Back
              </button>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : '✓ Submit Report'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReportIncident;
