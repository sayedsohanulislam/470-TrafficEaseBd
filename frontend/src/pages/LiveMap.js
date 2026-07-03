import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { demoIncidents, demoLiveTraffic } from '../data/trafficDemoData';

const dhakaCenter = [23.8103, 90.4125];

const severityColor = {
  Low: '#10b981',
  Medium: '#fbbf24',
  High: '#f43f5e',
  Critical: '#ef4444'
};

// Controller component to programmatically pan/zoom map
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

const LiveMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(dhakaCenter);
  
  const location = useLocation();

  useEffect(() => {
    Promise.allSettled([
      api.get('/incidents'),
      api.get('/vehicles'),
      api.get('/live-traffic')
    ]).then((results) => {
      setIncidents(results[0].value?.data?.items || demoIncidents);
      setVehicles(results[1].value?.data?.items || []);
      setTraffic(results[2].value?.data || demoLiveTraffic);
    });
  }, []);

  // Listen to navigation state focus (e.g. from Dashboard click)
  useEffect(() => {
    if (location.state?.focusCoordinates) {
      const coords = location.state.focusCoordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        // GeoJSON uses [longitude, latitude], standard map center uses [latitude, longitude]
        const isGeoJSON = coords[0] > 70; // Dhaka longitude is ~90, latitude is ~23
        const lat = isGeoJSON ? coords[1] : coords[0];
        const lng = isGeoJSON ? coords[0] : coords[1];
        setMapCenter([lat, lng]);
        setSearchMarker({
          coordinates: [lat, lng],
          name: "Focused Incident Location"
        });
      }
    }
  }, [location.state]);

  const visibleIncidents = incidents.length ? incidents : demoIncidents;
  const activeVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.currentLocation?.coordinates?.length === 2), [vehicles]);

  // Handle live search from OpenStreetMap Nominatim geocoding engine
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    try {
      // Append "Dhaka" or "Bangladesh" to contextualize results to the local city
      const query = encodeURIComponent(`${searchQuery}, Dhaka, Bangladesh`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data.map(item => ({
          name: item.display_name.split(',').slice(0, 3).join(','), // Shorten display name
          fullName: item.display_name,
          coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
        })));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Geocoding service error:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Trigger search when typing finishes or user hits Enter
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearchSubmit();
      } else {
        setSearchResults([]);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <>
      <div className="section-header">
        <div>
          <h1>Live Traffic Map</h1>
          <p>Real-time telemetry overlay of Dhaka's critical corridors and transit routes.</p>
        </div>
      </div>

      <section className="map-layout">
        <div className="map-frame" style={{ position: 'relative' }}>
          {/* Map Search Bar */}
          <form className="map-search-bar" onSubmit={handleSearchSubmit}>
            <div className="map-search-input-wrap">
              <span style={{ fontSize: '1rem' }}>🔍</span>
              <input
                className="map-search-input"
                placeholder={loadingSearch ? "Searching..." : "Search any address/landmark..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchMarker(null);
                    setMapCenter(dhakaCenter);
                  }}
                  style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', background: 'none', border: 'none' }}
                >
                  Clear
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="map-search-suggestions">
                {searchResults.map(loc => (
                  <button
                    key={loc.fullName}
                    type="button"
                    className="map-search-suggestion-item"
                    onClick={() => {
                      setMapCenter(loc.coordinates);
                      setSearchMarker({
                        coordinates: loc.coordinates,
                        name: loc.name
                      });
                      setSearchResults([]);
                      setSearchQuery(loc.name);
                    }}
                  >
                    {loc.fullName.split(',').slice(0, 4).join(',')}
                  </button>
                ))}
              </div>
            )}
          </form>

          <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <MapController center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://{s}.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
            {/* Mirpur to Farmgate Corridor (Severe) */}
            <Polyline
              positions={[[23.8067, 90.3686], [23.7807, 90.3792], [23.7561, 90.3897]]}
              pathOptions={{ color: '#ef4444', weight: 6, opacity: 0.85 }}
            />
            {/* Gulshan to Banani Corridor (Moderate) */}
            <Polyline
              positions={[[23.7937, 90.4003], [23.7801, 90.4072], [23.7619, 90.3895]]}
              pathOptions={{ color: '#fbbf24', weight: 6, opacity: 0.85 }}
            />
            {/* Uttara to Airport Corridor (Low) */}
            <Polyline
              positions={[[23.8759, 90.3795], [23.8516, 90.4048], [23.8103, 90.4125]]}
              pathOptions={{ color: '#10b981', weight: 6, opacity: 0.85 }}
            />

            {/* Custom Search Marker */}
            {searchMarker && (
              <CircleMarker
                center={searchMarker.coordinates}
                radius={14}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.8,
                  weight: 3
                }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>Search Result</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccc' }}>{searchMarker.name}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {visibleIncidents.map((incident) => {
              const [lng, lat] = incident.coordinates || incident.location?.coordinates || [90.4125, 23.8103];
              return (
                <CircleMarker
                  key={incident._id}
                  center={[lat, lng]}
                  radius={12}
                  pathOptions={{
                    color: severityColor[incident.severity] || '#10b981',
                    fillColor: severityColor[incident.severity] || '#10b981',
                    fillOpacity: 0.65,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>{incident.title}</strong>
                      <span className={`badge ${incident.severity === 'Critical' || incident.severity === 'High' ? 'danger' : 'warning'}`} style={{ marginBottom: '6px' }}>{incident.severity}</span>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#ccc' }}>Type: {incident.type}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>{incident.locationName}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
            {activeVehicles.map((vehicle) => {
              const [lng, lat] = vehicle.currentLocation.coordinates;
              return (
                <CircleMarker
                  key={vehicle._id}
                  center={[lat, lng]}
                  radius={8}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.8,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>{vehicle.vehicleNumber}</strong>
                      <span className="badge success">{vehicle.status}</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#ccc' }}>Fleet Type: {vehicle.type}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <aside className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <h2 className="panel-title" style={{ fontSize: '1.2rem' }}>Live Map Layers</h2>
          <p className="panel-subtitle" style={{ margin: 0 }}>Corridors indicate traffic speed. Markers indicate active field response assets and incidents.</p>
          
          <div className="status-list" style={{ marginTop: '8px' }}>
            <h3 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '4px' }}>Hotspot Corridors</h3>
            {traffic.corridors.slice(0, 3).map((corridor) => (
              <div className="status-item" key={corridor.id}>
                <div>
                  <strong>{corridor.area}</strong>
                  <span>{corridor.speedKph} km/h - {corridor.delayMin}m delay</span>
                </div>
                <span className={`badge ${corridor.congestion > 80 ? 'danger' : 'warning'}`}>{corridor.congestion}%</span>
              </div>
            ))}

            <h3 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '4px' }}>Active Incidents</h3>
            {visibleIncidents.map((incident) => (
              <div className="status-item" key={incident._id}>
                <div>
                  <strong>{incident.title}</strong>
                  <span>{incident.locationName}</span>
                </div>
                <span className={`badge ${incident.severity === 'High' || incident.severity === 'Critical' ? 'danger' : 'warning'}`}>{incident.severity}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
};

export default LiveMap;
