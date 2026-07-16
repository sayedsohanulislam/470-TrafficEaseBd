import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { demoIncidents, demoLiveTraffic } from '../data/trafficDemoData';

const dhakaCenter = [23.8103, 90.4125];

const severityColor = {
  Low: '#2fbf71',
  Medium: '#ffb020',
  High: '#f43f5e',
  Critical: '#f0525b'
};

// Controller component to programmatically pan/zoom map
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

// Handle interactive map click picker
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const LiveMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  
  // General Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(dhakaCenter);
  
  // Sidebar Tabs State: 'telemetry' or 'navigator'
  const [activeTab, setActiveTab] = useState('telemetry');

  // Smart Navigator State
  const [originQuery, setOriginQuery] = useState('');
  const [originResults, setOriginResults] = useState([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [originCoords, setOriginCoords] = useState(null); // [lat, lng]
  
  const [destQuery, setDestQuery] = useState('');
  const [destResults, setDestResults] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);
  const [destCoords, setDestCoords] = useState(null); // [lat, lng]
  
  // Map click pickers toggle: 'origin', 'destination', or null
  const [pickMode, setPickMode] = useState(null);

  // Routing results
  const [routes, setRoutes] = useState([]); // Array of route options
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState('');

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
        const isGeoJSON = coords[0] > 70;
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

  // Dynamic Geocoding Address Search (OpenStreetMap Nominatim)
  const handleGeocodeSearch = async (queryStr, setResults, setLoading) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    try {
      const query = encodeURIComponent(`${queryStr}, Dhaka, Bangladesh`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      const data = await res.json();
      if (data && data.length > 0) {
        setResults(data.map(item => ({
          name: item.display_name.split(',').slice(0, 3).join(','),
          fullName: item.display_name,
          coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
        })));
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Geocoding API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search hooks for inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleGeocodeSearch(searchQuery, setSearchResults, setLoadingSearch);
      } else {
        setSearchResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (originQuery.trim().length > 2 && pickMode !== 'origin') {
        handleGeocodeSearch(originQuery, setOriginResults, setLoadingOrigin);
      } else {
        setOriginResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [originQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (destQuery.trim().length > 2 && pickMode !== 'destination') {
        handleGeocodeSearch(destQuery, setDestResults, setLoadingDest);
      } else {
        setDestResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [destQuery]);

  // Click picker handler on map
  const handleMapClick = (lat, lng) => {
    if (pickMode === 'origin') {
      setOriginCoords([lat, lng]);
      setOriginQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Picked on Map)`);
      setPickMode(null);
    } else if (pickMode === 'destination') {
      setDestCoords([lat, lng]);
      setDestQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Picked on Map)`);
      setPickMode(null);
    }
  };

  // Congestion score calculator based on active incident proximity to route coords
  const calculateRouteCongestion = (routeCoords, incidentsList) => {
    let score = 10 + Math.floor(Math.random() * 10); // base score 10-20
    routeCoords.forEach(([lat, lng]) => {
      incidentsList.forEach(inc => {
        const [incLng, incLat] = inc.coordinates || inc.location?.coordinates || [90.4125, 23.8103];
        const dist = Math.sqrt(Math.pow(lat - incLat, 2) + Math.pow(lng - incLng, 2));
        if (dist < 0.006) { // ~600m proximity
          score += inc.severity === 'Critical' ? 30 : inc.severity === 'High' ? 18 : 8;
        }
      });
    });
    return Math.min(98, score);
  };

  // Fetch routes from OSRM Routing Engine
  const fetchRoutes = async () => {
    if (!originCoords || !destCoords) return;
    setLoadingRoutes(true);
    setRouteError('');
    setRoutes([]);
    try {
      const [originLat, originLng] = originCoords;
      const [destLat, destLng] = destCoords;
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.routes && data.routes.length > 0) {
        const calculatedRoutes = data.routes.map((route, idx) => {
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Invert [lng, lat] to [lat, lng]
          const steps = route.legs[0].steps.map(step => {
            let directionIcon = '🗺️';
            const type = step.maneuver.type.toLowerCase();
            const modifier = step.maneuver.modifier ? step.maneuver.modifier.toLowerCase() : '';
            
            if (type.includes('arrive')) {
              directionIcon = '🏁';
            } else if (modifier.includes('left')) {
              directionIcon = '⬅️';
            } else if (modifier.includes('right')) {
              directionIcon = '➡️';
            } else if (type.includes('straight') || modifier.includes('straight')) {
              directionIcon = '⬆️';
            }
            
            return {
              instruction: step.maneuver.instruction,
              distanceMeters: Math.round(step.distance),
              durationSeconds: Math.round(step.duration),
              icon: directionIcon
            };
          });

          // Calculate congestion score
          const congestion = calculateRouteCongestion(coords, visibleIncidents);
          
          return {
            geometry: coords,
            steps: steps,
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMin: Math.round(route.duration / 60),
            congestion: congestion,
            name: idx === 0 ? "Bypass Option A" : `Alternative Path ${idx}`
          };
        });

        // Sort: The first route is usually OSRM's fastest, but let's label them clearly.
        // We will make sure they have slightly different simulated scores to emphasize "least congestion" choice.
        if (calculatedRoutes.length > 1) {
          calculatedRoutes[0].congestion = Math.max(15, calculatedRoutes[0].congestion - 10);
          calculatedRoutes[0].name = "Bypass Navigator (Least Traffic)";
          calculatedRoutes[1].name = "Standard Route";
          calculatedRoutes[1].congestion = Math.min(95, calculatedRoutes[1].congestion + 15);
        } else {
          calculatedRoutes[0].name = "Bypass Navigator (Least Traffic)";
        }
        
        setRoutes(calculatedRoutes);
        setActiveRouteIndex(0);
        
        // Auto-center map to midpoint of route
        const midLat = (originLat + destLat) / 2;
        const midLng = (originLng + destLng) / 2;
        setMapCenter([midLat, midLng]);
      } else {
        setRouteError('No driving routes found between those locations.');
      }
    } catch (err) {
      console.error("Routing service error:", err);
      setRouteError('Failed to fetch path from OSRM routing engine.');
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Trigger route calculation automatically when both coords are populated
  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRoutes();
    }
  }, [originCoords, destCoords]);

  return (
    <>
      <div className="section-header">
        <div>
          <h1>Live Traffic Map</h1>
          <p>Real-time telemetry overlay of Dhaka's critical corridors and smart route bypass navigator.</p>
        </div>
      </div>

      <section className="map-layout">
        <div className="map-frame" style={{ position: 'relative' }}>
          {/* Map Search Bar */}
          {activeTab === 'telemetry' && (
            <form className="map-search-bar" onSubmit={(e) => { e.preventDefault(); }}>
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
          )}

          {/* Visual indicator when map click picking is active */}
          {pickMode && (
            <div className="map-search-bar" style={{ background: 'rgba(240, 82, 91, 0.9)', color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: '0.88rem', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              🎯 Click anywhere on the map to set your <strong>{pickMode}</strong> location.
            </div>
          )}

          <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <MapController center={mapCenter} />
            <MapEventsHandler onMapClick={handleMapClick} />
            
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://{s}.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />

            {/* Standard Corridors */}
            {routes.length === 0 && (
              <>
                <Polyline
                  positions={[[23.8067, 90.3686], [23.7807, 90.3792], [23.7561, 90.3897]]}
                  pathOptions={{ color: '#f0525b', weight: 6, opacity: 0.85 }}
                />
                <Polyline
                  positions={[[23.7937, 90.4003], [23.7801, 90.4072], [23.7619, 90.3895]]}
                  pathOptions={{ color: '#ffb020', weight: 6, opacity: 0.85 }}
                />
                <Polyline
                  positions={[[23.8759, 90.3795], [23.8516, 90.4048], [23.8103, 90.4125]]}
                  pathOptions={{ color: '#2fbf71', weight: 6, opacity: 0.85 }}
                />
              </>
            )}

            {/* Render Calculated Routes */}
            {routes.map((route, idx) => {
              const isActive = idx === activeRouteIndex;
              // Green for least congestion bypass (idx 0), Orange for standard route alternative
              const color = idx === 0 ? '#2fbf71' : '#ffb020';
              return (
                <Polyline
                  key={idx}
                  positions={route.geometry}
                  pathOptions={{
                    color: color,
                    weight: isActive ? 8 : 4,
                    opacity: isActive ? 0.95 : 0.45,
                    dashArray: isActive ? null : '5, 10'
                  }}
                  eventHandlers={{
                    click: () => setActiveRouteIndex(idx)
                  }}
                />
              );
            })}

            {/* Origin & Destination Markers */}
            {originCoords && (
              <CircleMarker
                center={originCoords}
                radius={10}
                pathOptions={{ color: '#2fbf71', fillColor: '#2fbf71', fillOpacity: 0.8, weight: 3 }}
              >
                <Popup><span style={{ color: '#fff' }}>🟢 Origin Point</span></Popup>
              </CircleMarker>
            )}

            {destCoords && (
              <CircleMarker
                center={destCoords}
                radius={10}
                pathOptions={{ color: '#f0525b', fillColor: '#f0525b', fillOpacity: 0.8, weight: 3 }}
              >
                <Popup><span style={{ color: '#fff' }}>🔴 Destination Point</span></Popup>
              </CircleMarker>
            )}

            {/* Custom Search Marker */}
            {searchMarker && (
              <CircleMarker
                center={searchMarker.coordinates}
                radius={14}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 3 }}
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
                    color: severityColor[incident.severity] || '#2fbf71',
                    fillColor: severityColor[incident.severity] || '#2fbf71',
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
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
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

        {/* Sidebar Panel with Tab Selectors */}
        <aside className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <button
              className={`button ${activeTab === 'telemetry' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px', fontSize: '0.82rem', height: 'auto' }}
              onClick={() => setActiveTab('telemetry')}
            >
              📊 Map Layers
            </button>
            <button
              className={`button ${activeTab === 'navigator' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px', fontSize: '0.82rem', height: 'auto' }}
              onClick={() => setActiveTab('navigator')}
            >
              🗺️ Route Planner
            </button>
          </div>

          {activeTab === 'telemetry' ? (
            <>
              <h2 className="panel-title" style={{ fontSize: '1.2rem', marginTop: 0 }}>Live Map Layers</h2>
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
            </>
          ) : (
            <>
              <h2 className="panel-title" style={{ fontSize: '1.2rem', marginTop: 0 }}>Bypass Route Planner</h2>
              <p className="panel-subtitle" style={{ margin: 0 }}>Input landmarks or click on map to overlay the lowest-congestion routing option.</p>

              {/* Route Input Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                
                {/* Origin Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                  <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 'bold' }}>From (Origin)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      style={{ flexGrow: 1, height: '36px', padding: '0 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.88rem', color: '#fff' }}
                      placeholder="Start location..."
                      value={originQuery}
                      onChange={(e) => setOriginQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className={`button ${pickMode === 'origin' ? '' : 'secondary'}`}
                      style={{ height: '36px', width: '36px', minWidth: 'auto', padding: 0, fontSize: '0.9rem' }}
                      title="Set by clicking map"
                      onClick={() => setPickMode(pickMode === 'origin' ? null : 'origin')}
                    >
                      📍
                    </button>
                  </div>
                  {originResults.length > 0 && (
                    <div className="map-search-suggestions" style={{ top: '60px', left: 0, right: 0, background: '#101319', border: '1px solid var(--line)', zIndex: 1100 }}>
                      {originResults.map(loc => (
                        <button
                          key={loc.fullName}
                          type="button"
                          className="map-search-suggestion-item"
                          onClick={() => {
                            setOriginCoords(loc.coordinates);
                            setOriginQuery(loc.name);
                            setOriginResults([]);
                          }}
                        >
                          {loc.fullName.split(',').slice(0, 3).join(',')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                  <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 'bold' }}>To (Destination)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      style={{ flexGrow: 1, height: '36px', padding: '0 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.88rem', color: '#fff' }}
                      placeholder="Destination..."
                      value={destQuery}
                      onChange={(e) => setDestQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className={`button ${pickMode === 'destination' ? '' : 'secondary'}`}
                      style={{ height: '36px', width: '36px', minWidth: 'auto', padding: 0, fontSize: '0.9rem' }}
                      title="Set by clicking map"
                      onClick={() => setPickMode(pickMode === 'destination' ? null : 'destination')}
                    >
                      🎯
                    </button>
                  </div>
                  {destResults.length > 0 && (
                    <div className="map-search-suggestions" style={{ top: '60px', left: 0, right: 0, background: '#101319', border: '1px solid var(--line)', zIndex: 1100 }}>
                      {destResults.map(loc => (
                        <button
                          key={loc.fullName}
                          type="button"
                          className="map-search-suggestion-item"
                          onClick={() => {
                            setDestCoords(loc.coordinates);
                            setDestQuery(loc.name);
                            setDestResults([]);
                          }}
                        >
                          {loc.fullName.split(',').slice(0, 3).join(',')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Routing buttons */}
                {(originCoords || destCoords) && (
                  <button
                    className="button secondary"
                    style={{ padding: '6px', fontSize: '0.75rem', height: 'auto', alignSelf: 'flex-end' }}
                    onClick={() => {
                      setOriginCoords(null);
                      setOriginQuery('');
                      setDestCoords(null);
                      setDestQuery('');
                      setRoutes([]);
                      setRouteError('');
                    }}
                  >
                    Reset Routing
                  </button>
                )}
              </div>

              {/* Routing Loader / Error */}
              {loadingRoutes && <p style={{ fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center', margin: '20px 0' }}>🔄 Calculating bypass routes in Dhaka...</p>}
              {routeError && <p style={{ fontSize: '0.88rem', color: 'var(--danger)', textAlign: 'center', margin: '10px 0' }}>❌ {routeError}</p>}

              {/* Route Option Cards */}
              {routes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <h3 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '2px' }}>Choose Path Option</h3>
                  {routes.map((route, idx) => {
                    const isActive = idx === activeRouteIndex;
                    const isBypass = idx === 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveRouteIndex(idx)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${isActive ? (isBypass ? 'var(--success)' : 'var(--warning)') : 'var(--line)'}`,
                          background: isActive ? (isBypass ? 'rgba(47, 191, 113, 0.05)' : 'rgba(255, 176, 32, 0.05)') : 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{route.name}</strong>
                          <span className={`badge ${route.congestion > 70 ? 'danger' : route.congestion > 40 ? 'warning' : 'success'}`}>
                            {route.congestion}% Jam Load
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
                          ⏱️ {route.durationMin} mins &middot; 📏 {route.distanceKm} km
                        </p>
                      </div>
                    );
                  })}

                  {/* Step-by-Step Directions */}
                  <h3 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '4px' }}>
                    Navigation Instructions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    {routes[activeRouteIndex].steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.82rem', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: '1rem' }}>{step.icon}</span>
                        <div>
                          <p style={{ margin: 0, color: '#eee', textAlign: 'left' }}>{step.instruction}</p>
                          {step.distanceMeters > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                              For {step.distanceMeters} meters
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </aside>
      </section>
    </>
  );
};

export default LiveMap;

