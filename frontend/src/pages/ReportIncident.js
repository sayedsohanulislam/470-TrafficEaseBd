import React, { useState, useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  title: '',
  type: 'Congestion',
  severity: 'Medium',
  locationName: '',
  latitude: '23.8103',
  longitude: '90.4125',
  description: ''
};

const dhakaCenter = [23.8103, 90.4125];

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
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressLookup, setAddressLookup] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(dhakaCenter);

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
      setMessage('Incident report submitted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit this incident.');
    } finally {
      setLoading(false);
    }
  };

  const markerPosition = [Number(form.latitude), Number(form.longitude)];

  return (
    <div className="form-panel" style={{ maxWidth: '1100px', margin: '20px auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Report Incident</h1>
      <p style={{ marginBottom: '24px' }}>
        {isAuthenticated ? 'Your report will be attached to your account.' : 'You can report now, then login later to track updates.'}
      </p>
      
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Form Fields */}
        <form className="form-grid" onSubmit={handleSubmit} style={{ marginTop: 0 }}>
          <div className="grid grid-2">
            <div className="form-row">
              <label htmlFor="title">Incident Title</label>
              <input id="title" name="title" value={form.title} onChange={updateField} placeholder="e.g. Waterlogging near circle" required />
            </div>
            <div className="form-row">
              <label htmlFor="locationName">Location Name</label>
              <input id="locationName" name="locationName" value={form.locationName} onChange={updateField} placeholder="e.g. Shahbagh, Banani" required />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-row">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={updateField}>
                <option>Congestion</option>
                <option>Accident</option>
                <option>Roadwork</option>
                <option>Flooding</option>
                <option>Signal Failure</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="severity">Severity</label>
              <select id="severity" name="severity" value={form.severity} onChange={updateField}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
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

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={updateField} placeholder="Provide details about the blockages, delays, or emergency services needed." />
          </div>

          <div className="form-footer">
            <span className="panel-subtitle" style={{ margin: 0 }}>Coordinates are set by clicking on the map.</span>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

        {/* Map side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              {lookupLoading ? 'Locating...' : 'Locate'}
            </button>
          </div>

          <div className="map-frame" style={{ height: '380px' }}>
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              <MapController center={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                url="https://{s}.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              />
              <LocationPicker onLocationSelected={handleLocationPicked} position={markerPosition} />
            </MapContainer>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
            💡 Tip: Click anywhere on the map to pin the incident's exact location coordinates.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
