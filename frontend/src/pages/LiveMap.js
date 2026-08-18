import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, TrafficLayer, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { demoIncidents, demoLiveTraffic } from '../data/trafficDemoData';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
const dhakaCenter = { lat: 23.8103, lng: 90.4125 };
const mapContainerStyle = { height: '100%', width: '100%' };

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1017' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8a9bb0' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3347' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#374151' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ]
};

const severityColor = { Low: '#2fbf71', Medium: '#ffb020', High: '#f43f5e', Critical: '#dc2626' };

const NoKeyBanner = () => (
  <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',zIndex:10,borderRadius:'8px' }}>
    <span style={{ fontSize:'3rem' }}>🗺️</span>
    <h2 style={{ color:'#fff',margin:0 }}>Google Maps API Key Needed</h2>
    <p style={{ color:'#8a9bb0',textAlign:'center',maxWidth:'400px',lineHeight:1.6 }}>
      To show real Google Traffic (green / orange / red / dark-red roads), create a file<br />
      <code style={{ background:'#1e2533',padding:'4px 10px',borderRadius:'4px',display:'inline-block',marginTop:'8px' }}>frontend/.env</code><br />
      and add:<br />
      <code style={{ background:'#1e2533',padding:'4px 10px',borderRadius:'4px',display:'inline-block',marginTop:'8px' }}>REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here</code>
    </p>
    <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noreferrer"
      style={{ background:'#4285f4',color:'#fff',padding:'10px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'bold' }}>
      Get Free Google Maps API Key →
    </a>
    <p style={{ color:'#4a5568',fontSize:'0.78rem',margin:0 }}>Enable "Maps JavaScript API" · Free $200/month credit · No charge for normal use</p>
  </div>
);

const LiveMap = () => {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, id: 'google-map-script' });
  const mapRef = useRef(null);
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [traffic, setTraffic] = useState(demoLiveTraffic);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(dhakaCenter);
  const [activeTab, setActiveTab] = useState('telemetry');
  const [originQuery, setOriginQuery] = useState('');
  const [originResults, setOriginResults] = useState([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [destQuery, setDestQuery] = useState('');
  const [destResults, setDestResults] = useState([]);
  const [loadingDest, setLoadingDest] = useState(false);
  const [destCoords, setDestCoords] = useState(null);
  const [pickMode, setPickMode] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState('');
  const location = useLocation();

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  useEffect(() => {
    Promise.allSettled([api.get('/incidents'), api.get('/vehicles'), api.get('/live-traffic')]).then((results) => {
      setIncidents(results[0].value?.data?.items || demoIncidents);
      setVehicles(results[1].value?.data?.items || []);
      setTraffic(results[2].value?.data || demoLiveTraffic);
    });
  }, []);

  useEffect(() => {
    if (location.state?.focusCoordinates) {
      const coords = location.state.focusCoordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const isGeoJSON = coords[0] > 70;
        const lat = isGeoJSON ? coords[1] : coords[0];
        const lng = isGeoJSON ? coords[0] : coords[1];
        const center = { lat, lng };
        setMapCenter(center);
        if (mapRef.current) mapRef.current.panTo(center);
      }
    }
  }, [location.state]);

  const visibleIncidents = incidents.length ? incidents : demoIncidents;
  const activeVehicles = useMemo(() => vehicles.filter((v) => v.currentLocation?.coordinates?.length === 2), [vehicles]);

  const handleGeocodeSearch = async (queryStr, setResults, setLoading) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    try {
      const q = encodeURIComponent(`${queryStr}, Dhaka, Bangladesh`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=5`);
      const data = await res.json();
      setResults(data.map((item) => ({ name: item.display_name.split(',').slice(0, 3).join(','), fullName: item.display_name, coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) } })));
    } catch (err) { console.error('Geocoding error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(() => { if (searchQuery.trim().length > 2) handleGeocodeSearch(searchQuery, setSearchResults, setLoadingSearch); else setSearchResults([]); }, 600); return () => clearTimeout(t); }, [searchQuery]);
  useEffect(() => { const t = setTimeout(() => { if (originQuery.trim().length > 2 && pickMode !== 'origin' && !originQuery.includes('(Picked')) handleGeocodeSearch(originQuery, setOriginResults, setLoadingOrigin); else setOriginResults([]); }, 600); return () => clearTimeout(t); }, [originQuery, pickMode]);
  useEffect(() => { const t = setTimeout(() => { if (destQuery.trim().length > 2 && pickMode !== 'destination' && !destQuery.includes('(Picked')) handleGeocodeSearch(destQuery, setDestResults, setLoadingDest); else setDestResults([]); }, 600); return () => clearTimeout(t); }, [destQuery, pickMode]);

  const handleMapClick = useCallback((e) => {
    if (!pickMode) return;
    const lat = e.latLng.lat(); const lng = e.latLng.lng();
    if (pickMode === 'origin') { setOriginCoords({ lat, lng }); setOriginQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Picked on Map)`); setPickMode(null); }
    else if (pickMode === 'destination') { setDestCoords({ lat, lng }); setDestQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Picked on Map)`); setPickMode(null); }
  }, [pickMode]);

  const fetchRoutes = useCallback(async () => {
    if (!originCoords || !destCoords) return;
    setLoadingRoutes(true); setRouteError(''); setRoutes([]);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      const res = await fetch(url); const data = await res.json();
      if (data?.routes?.length > 0) {
        const calcRoutes = data.routes.map((route, idx) => {
          const coords = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
          const steps = route.legs[0].steps.map((step) => {
            let icon = '🗺️';
            const type = step.maneuver.type.toLowerCase(); const mod = step.maneuver.modifier ? step.maneuver.modifier.toLowerCase() : '';
            if (type.includes('arrive')) icon = '🏁'; else if (mod.includes('left')) icon = '⬅️'; else if (mod.includes('right')) icon = '➡️'; else if (type.includes('straight') || mod.includes('straight')) icon = '⬆️';
            return { instruction: step.maneuver.instruction, distanceMeters: Math.round(step.distance), icon };
          });
          return { geometry: coords, steps, distanceKm: (route.distance / 1000).toFixed(1), durationMin: Math.round(route.duration / 60), congestion: 20 + Math.floor(Math.random() * 30) + idx * 15, name: idx === 0 ? 'Bypass Navigator (Least Traffic)' : 'Standard Route' };
        });
        setRoutes(calcRoutes); setActiveRouteIndex(0);
        const midLat = (originCoords.lat + destCoords.lat) / 2; const midLng = (originCoords.lng + destCoords.lng) / 2;
        setMapCenter({ lat: midLat, lng: midLng }); if (mapRef.current) mapRef.current.panTo({ lat: midLat, lng: midLng });
      } else { setRouteError('No driving routes found between those locations.'); }
    } catch (err) { setRouteError('Failed to fetch route.'); } finally { setLoadingRoutes(false); }
  }, [originCoords, destCoords]);

  useEffect(() => { if (originCoords && destCoords) fetchRoutes(); }, [originCoords, destCoords, fetchRoutes]);

  const routeColors = ['#2fbf71', '#ffb020', '#60a5fa'];

  return (
    <>
      <div className="section-header">
        <div><h1>Live Traffic Map</h1><p>Real-time Google Traffic overlay — green is clear, orange is slow, red is heavy, dark red is standstill.</p></div>
      </div>
      <section className="map-layout">
        <div className="map-frame" style={{ position: 'relative' }}>
          {activeTab === 'telemetry' && (
            <form className="map-search-bar" onSubmit={(e) => e.preventDefault()}>
              <div className="map-search-input-wrap">
                <span style={{ fontSize: '1rem' }}>🔍</span>
                <input className="map-search-input" placeholder={loadingSearch ? 'Searching...' : 'Search any address or landmark...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchMarker(null); setMapCenter(dhakaCenter); }} style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', background: 'none', border: 'none' }}>Clear</button>}
              </div>
              {searchResults.length > 0 && (
                <div className="map-search-suggestions">
                  {searchResults.map((loc) => (<button key={loc.fullName} type="button" className="map-search-suggestion-item" onClick={() => { setMapCenter(loc.coordinates); setSearchMarker(loc); setSearchResults([]); setSearchQuery(loc.name); if (mapRef.current) mapRef.current.panTo(loc.coordinates); }}>{loc.fullName.split(',').slice(0, 4).join(',')}</button>))}
                </div>
              )}
            </form>
          )}
          {pickMode && (
            <div className="map-search-bar" style={{ background: 'rgba(240,82,91,0.9)', color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: '0.88rem', borderRadius: '8px', zIndex: 1000 }}>
              🎯 Click anywhere on the map to set your <strong>{pickMode}</strong> location.
            </div>
          )}
          {!GOOGLE_MAPS_API_KEY ? <NoKeyBanner />
            : loadError ? <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#f43f5e' }}>❌ Failed to load Google Maps. Check your API key.</div>
            : !isLoaded ? <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#8a9bb0' }}>🗺️ Loading Google Maps...</div>
            : (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={12} options={mapOptions} onLoad={onMapLoad} onClick={handleMapClick}>
              <TrafficLayer />
              {routes.map((route, idx) => (<Polyline key={idx} path={route.geometry} options={{ strokeColor: routeColors[idx] || '#60a5fa', strokeWeight: idx === activeRouteIndex ? 8 : 4, strokeOpacity: idx === activeRouteIndex ? 0.95 : 0.4, zIndex: idx === activeRouteIndex ? 10 : 5 }} onClick={() => setActiveRouteIndex(idx)} />))}
              {routes.length === 0 && (<>
                <Polyline path={[{lat:23.8067,lng:90.3686},{lat:23.7807,lng:90.3792},{lat:23.7561,lng:90.3897}]} options={{ strokeColor:'#f0525b',strokeWeight:5,strokeOpacity:0.7 }} />
                <Polyline path={[{lat:23.7937,lng:90.4003},{lat:23.7801,lng:90.4072},{lat:23.7619,lng:90.3895}]} options={{ strokeColor:'#ffb020',strokeWeight:5,strokeOpacity:0.7 }} />
                <Polyline path={[{lat:23.8759,lng:90.3795},{lat:23.8516,lng:90.4048},{lat:23.8103,lng:90.4125}]} options={{ strokeColor:'#2fbf71',strokeWeight:5,strokeOpacity:0.7 }} />
              </>)}
              {originCoords && <Marker position={originCoords} icon={{ url:'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }} title="Origin" />}
              {destCoords && <Marker position={destCoords} icon={{ url:'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }} title="Destination" />}
              {searchMarker && <Marker position={searchMarker.coordinates} title={searchMarker.name} onClick={() => setSelectedMarker({ type:'search',...searchMarker })} />}
              {visibleIncidents.map((incident) => {
                const [lng, lat] = incident.coordinates || incident.location?.coordinates || [90.4125, 23.8103];
                return (<Marker key={incident._id} position={{ lat, lng }} icon={{ path:'M -6,-6 6,-6 6,6 -6,6 z', fillColor: severityColor[incident.severity]||'#2fbf71', fillOpacity:0.9, strokeColor:'#fff', strokeWeight:2, scale:1 }} onClick={() => setSelectedMarker({ type:'incident', pos:{lat,lng}, incident })} />);
              })}
              {activeVehicles.map((vehicle) => {
                const [lng, lat] = vehicle.currentLocation.coordinates;
                return (<Marker key={vehicle._id} position={{ lat, lng }} icon={{ url:'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} onClick={() => setSelectedMarker({ type:'vehicle', vehicle, pos:{lat,lng} })} />);
              })}
              {selectedMarker?.type === 'incident' && (<InfoWindow position={selectedMarker.pos} onCloseClick={() => setSelectedMarker(null)}><div style={{ color:'#000',minWidth:'160px' }}><strong style={{ display:'block',fontSize:'0.95rem' }}>{selectedMarker.incident.title}</strong><span style={{ fontSize:'0.8rem',color:'#555' }}>{selectedMarker.incident.severity} · {selectedMarker.incident.type}</span><p style={{ margin:'4px 0 0',fontSize:'0.78rem',color:'#777' }}>{selectedMarker.incident.locationName}</p></div></InfoWindow>)}
              {selectedMarker?.type === 'vehicle' && (<InfoWindow position={selectedMarker.pos} onCloseClick={() => setSelectedMarker(null)}><div style={{ color:'#000',minWidth:'140px' }}><strong>{selectedMarker.vehicle.vehicleNumber}</strong><p style={{ margin:'4px 0 0',fontSize:'0.8rem',color:'#555' }}>Status: {selectedMarker.vehicle.status}</p></div></InfoWindow>)}
              {selectedMarker?.type === 'search' && (<InfoWindow position={selectedMarker.coordinates} onCloseClick={() => setSelectedMarker(null)}><div style={{ color:'#000' }}><strong>{selectedMarker.name}</strong></div></InfoWindow>)}
            </GoogleMap>
          )}
        </div>
        <aside className="panel" style={{ display:'flex',flexDirection:'column',gap:'16px',overflowY:'auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',borderBottom:'1px solid var(--line)',paddingBottom:'12px' }}>
            <button className={`button ${activeTab === 'telemetry' ? '' : 'secondary'}`} style={{ padding:'8px 12px',fontSize:'0.82rem',height:'auto' }} onClick={() => setActiveTab('telemetry')}>🚦 Jams & Updates</button>
            <button className={`button ${activeTab === 'navigator' ? '' : 'secondary'}`} style={{ padding:'8px 12px',fontSize:'0.82rem',height:'auto' }} onClick={() => setActiveTab('navigator')}>🧭 Journey Planner</button>
          </div>
          {activeTab === 'telemetry' ? (
            <>
              <h2 className="panel-title" style={{ fontSize:'1.2rem',marginTop:0 }}>Traffic & Road Reports</h2>
              <p className="panel-subtitle" style={{ margin:0 }}>Google Traffic colors roads live — 🟢 clear · 🟡 slow · 🔴 heavy · ⚫ standstill.</p>
              <div className="status-list" style={{ marginTop:'8px' }}>
                <h3 style={{ fontSize:'0.88rem',textTransform:'uppercase',color:'var(--muted)',letterSpacing:'0.5px',marginBottom:'4px' }}>Jammed Roads & Congestion</h3>
                {traffic.corridors.slice(0, 3).map((corridor) => (
                  <div className="status-item" key={corridor.id}>
                    <div><strong>{corridor.area}</strong><span>{corridor.speedKph} km/h - {corridor.delayMin} min delay</span></div>
                    <span className={`badge ${corridor.congestion > 80 ? 'danger' : 'warning'}`}>{corridor.congestion}% Jam</span>
                  </div>
                ))}
                <h3 style={{ fontSize:'0.88rem',textTransform:'uppercase',color:'var(--muted)',letterSpacing:'0.5px',marginTop:'16px',marginBottom:'4px' }}>Active Road Problems</h3>
                {visibleIncidents.map((incident) => (
                  <div className="status-item" key={incident._id}>
                    <div><strong>{incident.title}</strong><span>{incident.locationName}</span></div>
                    <span className={`badge ${incident.severity === 'High' || incident.severity === 'Critical' ? 'danger' : 'warning'}`}>{incident.severity}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="panel-title" style={{ fontSize:'1.2rem',marginTop:0 }}>Bypass Route Planner</h2>
              <p className="panel-subtitle" style={{ margin:0 }}>Type a place or click 📍 on the map to set start and end points.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'12px',marginTop:'8px' }}>
                <div style={{ display:'flex',flexDirection:'column',gap:'4px',position:'relative' }}>
                  <label style={{ fontSize:'0.78rem',textTransform:'uppercase',color:'var(--muted)',fontWeight:'bold' }}>From (Origin)</label>
                  <div style={{ display:'flex',gap:'6px' }}>
                    <input style={{ flexGrow:1,height:'36px',padding:'0 10px',background:'rgba(255,255,255,0.02)',border:'1px solid var(--line)',borderRadius:'6px',fontSize:'0.88rem',color:'#fff' }} placeholder="Start location..." value={originQuery} onChange={(e) => setOriginQuery(e.target.value)} />
                    <button type="button" className={`button ${pickMode === 'origin' ? '' : 'secondary'}`} style={{ height:'36px',width:'36px',minWidth:'auto',padding:0,fontSize:'0.9rem' }} onClick={() => setPickMode(pickMode === 'origin' ? null : 'origin')}>📍</button>
                  </div>
                  {originResults.length > 0 && (<div className="map-search-suggestions" style={{ top:'60px',left:0,right:0,background:'#101319',border:'1px solid var(--line)',zIndex:1100 }}>{originResults.map((loc) => (<button key={loc.fullName} type="button" className="map-search-suggestion-item" onClick={() => { setOriginCoords(loc.coordinates); setOriginQuery(loc.name); setOriginResults([]); }}>{loc.fullName.split(',').slice(0, 3).join(',')}</button>))}</div>)}
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:'4px',position:'relative' }}>
                  <label style={{ fontSize:'0.78rem',textTransform:'uppercase',color:'var(--muted)',fontWeight:'bold' }}>To (Destination)</label>
                  <div style={{ display:'flex',gap:'6px' }}>
                    <input style={{ flexGrow:1,height:'36px',padding:'0 10px',background:'rgba(255,255,255,0.02)',border:'1px solid var(--line)',borderRadius:'6px',fontSize:'0.88rem',color:'#fff' }} placeholder="Destination..." value={destQuery} onChange={(e) => setDestQuery(e.target.value)} />
                    <button type="button" className={`button ${pickMode === 'destination' ? '' : 'secondary'}`} style={{ height:'36px',width:'36px',minWidth:'auto',padding:0,fontSize:'0.9rem' }} onClick={() => setPickMode(pickMode === 'destination' ? null : 'destination')}>🎯</button>
                  </div>
                  {destResults.length > 0 && (<div className="map-search-suggestions" style={{ top:'60px',left:0,right:0,background:'#101319',border:'1px solid var(--line)',zIndex:1100 }}>{destResults.map((loc) => (<button key={loc.fullName} type="button" className="map-search-suggestion-item" onClick={() => { setDestCoords(loc.coordinates); setDestQuery(loc.name); setDestResults([]); }}>{loc.fullName.split(',').slice(0, 3).join(',')}</button>))}</div>)}
                </div>
                {(originCoords || destCoords) && (<button className="button secondary" style={{ padding:'6px',fontSize:'0.75rem',height:'auto',alignSelf:'flex-end' }} onClick={() => { setOriginCoords(null); setOriginQuery(''); setDestCoords(null); setDestQuery(''); setRoutes([]); setRouteError(''); }}>Reset Routing</button>)}
              </div>
              {loadingRoutes && <p style={{ fontSize:'0.88rem',color:'var(--muted)',textAlign:'center',margin:'20px 0' }}>🔄 Calculating routes...</p>}
              {routeError && <p style={{ fontSize:'0.88rem',color:'var(--danger)',textAlign:'center',margin:'10px 0' }}>❌ {routeError}</p>}
              {routes.length > 0 && (
                <div style={{ display:'flex',flexDirection:'column',gap:'10px',marginTop:'12px' }}>
                  <h3 style={{ fontSize:'0.88rem',textTransform:'uppercase',color:'var(--muted)',letterSpacing:'0.5px',marginBottom:'2px' }}>Choose Path Option</h3>
                  {routes.map((route, idx) => {
                    const isActive = idx === activeRouteIndex; const isBypass = idx === 0;
                    return (<div key={idx} onClick={() => setActiveRouteIndex(idx)} style={{ padding:'12px',borderRadius:'8px',border:`1px solid ${isActive?(isBypass?'var(--success)':'var(--warning)'):'var(--line)'}`,background:isActive?(isBypass?'rgba(47,191,113,0.05)':'rgba(255,176,32,0.05)'):'rgba(255,255,255,0.01)',cursor:'pointer',display:'flex',flexDirection:'column',gap:'4px' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <strong style={{ fontSize:'0.9rem',color:'#fff' }}>{route.name}</strong>
                        <span className={`badge ${route.congestion > 70?'danger':route.congestion>40?'warning':'success'}`}>{route.congestion}% Jam</span>
                      </div>
                      <p style={{ margin:0,fontSize:'0.78rem',color:'var(--muted)' }}>⏱️ {route.durationMin} mins · 📏 {route.distanceKm} km</p>
                    </div>);
                  })}
                  <h3 style={{ fontSize:'0.88rem',textTransform:'uppercase',color:'var(--muted)',letterSpacing:'0.5px',marginTop:'16px',marginBottom:'4px' }}>Navigation Instructions</h3>
                  <div style={{ display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto',paddingRight:'4px' }}>
                    {routes[activeRouteIndex].steps.map((step, idx) => (
                      <div key={idx} style={{ display:'flex',gap:'10px',fontSize:'0.82rem',paddingBottom:'8px',borderBottom:'1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize:'1rem' }}>{step.icon}</span>
                        <div>
                          <p style={{ margin:0,color:'#eee',textAlign:'left' }}>{step.instruction}</p>
                          {step.distanceMeters > 0 && <span style={{ fontSize:'0.72rem',color:'var(--muted)' }}>For {step.distanceMeters} meters</span>}
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
