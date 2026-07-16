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

// Rain shelters list (Feature 3)
const rainShelters = [
  { name: "Mirpur 10 Metro Station Underpass", coords: [23.8069, 90.3687], capacity: 250 },
  { name: "Farmgate Metro Station Canopy", coords: [23.7562, 90.3896], capacity: 300 },
  { name: "Mohakhali Flyover Shade Zone", coords: [23.7780, 90.4005], capacity: 150 },
  { name: "Jamuna Future Park Plaza Shelter", coords: [23.8135, 90.4242], capacity: 400 }
];

// Volcanizer emergency tire repair locations (Feature 13)
const volcanizers = [
  { name: "Siddique Tyre Works (Mirpur 10)", coords: [23.8055, 90.3695], contact: "01712-345678" },
  { name: "Karwan Bazar Volcanizing & Alignment", coords: [23.7510, 90.3920], contact: "01815-987654" },
  { name: "Banani Filling Station Vulcanizer", coords: [23.7940, 90.4020], contact: "01911-554433" }
];

// Ride-sharing bike stands / pick hotzones (Feature 16)
const rideStands = [
  { name: "Farmgate Ananda Cinema Stand", coords: [23.7565, 90.3885], activeBikes: 24 },
  { name: "Banani Kakoli Crossing Hub", coords: [23.7995, 90.4035], activeBikes: 45 },
  { name: "Shahbagh Intersection Stand", coords: [23.7385, 90.3965], activeBikes: 18 }
];

// Pothole water-puddle camouflage warnings (Feature 20)
const camouflagedPuddles = [
  { name: "Mirpur 1 Hidden Pothole Puddle", coords: [23.8010, 90.3550] },
  { name: "Kazipara Outer Lane Water Puddle", coords: [23.7950, 90.3730] }
];

// Pedestrian streetlight blackout zones (Feature 18)
const blackoutStreets = [
  { coords: [[23.7970, 90.3720], [23.7950, 90.3700]], name: "Kazipara Lane 4 (Unlit Alleys)" },
  { coords: [[23.7630, 90.3950], [23.7610, 90.3980]], name: "Tejgaon Industrial Secondary Lane" }
];

// Bus track coordinates (Feature 2)
const busTrackCoords = [
  [23.8759, 90.3795], // Uttara
  [23.8516, 90.4048], // Airport
  [23.8103, 90.4125], // Banani
  [23.7801, 90.4072], // Gulshan
  [23.7561, 90.3897], // Farmgate
  [23.7250, 90.4000]  // Motijheel
];

// Ambulance track coordinates (Feature 8)
const ambulanceTrackCoords = [
  [23.8067, 90.3686], // Mirpur
  [23.7807, 90.3792], // Kazipara
  [23.7561, 90.3897], // Farmgate
  [23.7505, 90.3930]  // Karwan Bazar
];

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

// Helper function: check if a line segment passes near a point
const linePassesNearPoint = (p1, p2, target, threshold = 0.015) => {
  const [y1, x1] = p1;
  const [y2, x2] = p2;
  const [yt, xt] = target;
  
  const A = yt - y1;
  const B = xt - x1;
  const C = y2 - y1;
  const D = x2 - x1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    yy = y1;
    xx = x1;
  } else if (param > 1) {
    yy = y2;
    xx = x2;
  } else {
    yy = y1 + param * C;
    xx = x1 + param * D;
  }
  
  const dist = Math.sqrt(Math.pow(yt - yy, 2) + Math.pow(xt - xx, 2));
  return dist < threshold;
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
  
  // Sidebar Tabs State: 'telemetry', 'navigator', or 'smarthub'
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
  
  // Map click pickers toggle: 'origin', 'destination', 'hazard', or null
  const [pickMode, setPickMode] = useState(null);

  // Dhaka-specific routing state toggles
  const [vehicleClass, setVehicleClass] = useState('car'); // 'car', 'cng', 'rickshaw'
  const [vipProtocolActive, setVipProtocolActive] = useState(false);
  const [monsoonBypassActive, setMonsoonBypassActive] = useState(false);
  const [rickshawWarning, setRickshawWarning] = useState('');
  const [activeDetours, setActiveDetours] = useState([]);

  // Routing results
  const [routes, setRoutes] = useState([]); // Array of route options
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState('');

  // --- 20 Smart Hub States ---
  // Category 1: Commuters & Tolls
  const [cngDistInput, setCngDistInput] = useState('');
  const [showVolcanizers, setShowVolcanizers] = useState(false);
  
  // Category 2: Transit Deck
  const [selectedBusRoute, setSelectedBusRoute] = useState('Raida');
  const [isBusTracking, setIsBusTracking] = useState(false);
  const [busIndex, setBusIndex] = useState(0);
  const [mrtStations, setMrtStations] = useState([
    { name: "Uttara North Station", waitMin: 5, cardStock: "100% Stocked" },
    { name: "Mirpur 10 Station", waitMin: 18, cardStock: "Out of Cards - Counter Only" },
    { name: "Farmgate Station", waitMin: 25, cardStock: "20% Cards Left" },
    { name: "Motijheel Station", waitMin: 12, cardStock: "100% Stocked" }
  ]);
  const [terminalQueues, setTerminalQueues] = useState({
    gabtoli: 35,
    sayedabad: 15,
    mohakhali: 20
  });

  // Category 3: Monsoon & Hydrology
  const [showRainOverlay, setShowRainOverlay] = useState(false);
  const [isSlipperyWeather, setIsSlipperyWeather] = useState(false);
  const [showCamouflagedPuddles, setShowCamouflagedPuddles] = useState(false);
  const [showCngEngineWarning, setShowCngEngineWarning] = useState(false);

  // Category 4: Urban Safety & Reports
  const [reportedHazards, setReportedHazards] = useState([
    { coords: [23.7925, 90.4020], severity: "Deep Pothole" },
    { coords: [23.7380, 90.3850], severity: "Road Surface Scratch" }
  ]);
  const [tempHazardSeverity, setTempHazardSeverity] = useState('Deep Pothole');
  const [weeklyBazaarActive, setWeeklyBazaarActive] = useState(false);
  const [isAmbulanceSimActive, setIsAmbulanceSimActive] = useState(false);
  const [ambulanceIndex, setAmbulanceIndex] = useState(0);
  const [useAqiRouting, setUseAqiRouting] = useState(false);
  const [showRideStands, setShowRideStands] = useState(false);
  const [showBlackoutZones, setShowBlackoutZones] = useState(false);
  const [gasStationStatus, setGasStationStatus] = useState("High Pressure"); // CNG Pressure state
  const [overbridgeCondition, setOverbridgeCondition] = useState({ name: "Farmgate Overbridge", state: "Blocked by Hawkers" });

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

  // Simulation loops
  useEffect(() => {
    const timer = setInterval(() => {
      if (isBusTracking) {
        setBusIndex((prev) => (prev + 1) % busTrackCoords.length);
      }
      if (isAmbulanceSimActive) {
        setAmbulanceIndex((prev) => {
          if (prev + 1 >= ambulanceTrackCoords.length) {
            setIsAmbulanceSimActive(false);
            return 0;
          }
          return prev + 1;
        });
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [isBusTracking, isAmbulanceSimActive]);

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
      if (originQuery.trim().length > 2 && pickMode !== 'origin' && !originQuery.includes('(Picked')) {
        handleGeocodeSearch(originQuery, setOriginResults, setLoadingOrigin);
      } else {
        setOriginResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [originQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (destQuery.trim().length > 2 && pickMode !== 'destination' && !destQuery.includes('(Picked')) {
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
    } else if (pickMode === 'hazard') {
      setReportedHazards((prev) => [...prev, { coords: [lat, lng], severity: tempHazardSeverity }]);
      setPickMode(null);
    }
  };

  // Congestion score calculator based on active incident proximity to route coords
  const calculateRouteCongestion = (routeCoords, incidentsList) => {
    let score = 10 + Math.floor(Math.random() * 10);
    routeCoords.forEach(([lat, lng]) => {
      incidentsList.forEach(inc => {
        const [incLng, incLat] = inc.coordinates || inc.location?.coordinates || [90.4125, 23.8103];
        const dist = Math.sqrt(Math.pow(lat - incLat, 2) + Math.pow(lng - incLng, 2));
        if (dist < 0.006) {
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
    setRickshawWarning('');
    setActiveDetours([]);
    setShowCngEngineWarning(false);

    try {
      const [originLat, originLng] = originCoords;
      const [destLat, destLng] = destCoords;
      
      const vipTarget = [23.7684, 90.3789];
      const floodTarget = [23.7561, 90.3897];
      const airportTarget = [23.8300, 90.4100];
      const bazaarTarget = [23.7505, 90.3930];

      let waypoints = [[originLat, originLng]];
      let detoursList = [];
      let rWarning = '';

      // 1. Check VIP blockade detour
      if (vipProtocolActive && linePassesNearPoint([originLat, originLng], [destLat, destLng], vipTarget, 0.015)) {
        waypoints.push([23.7807, 90.3792]);
        detoursList.push("VIP Protocol Active at Bijoy Sarani (Detouring via Rokeya Sarani)");
      }

      // 2. Check Monsoon Flooding blockade detour
      if (monsoonBypassActive && linePassesNearPoint([originLat, originLng], [destLat, destLng], floodTarget, 0.012)) {
        waypoints.push([23.7710, 90.3640]);
        detoursList.push("Severe waterlogging at Farmgate (Detouring via Mirpur Road)");
        
        // CNG Engine Ingest alert trigger (Feature 17)
        if (vehicleClass === 'cng') {
          setShowCngEngineWarning(true);
        }
      }

      // 3. Check Weekly Bazaar roadblock detour
      if (weeklyBazaarActive && linePassesNearPoint([originLat, originLng], [destLat, destLng], bazaarTarget, 0.012)) {
        waypoints.push([23.7619, 90.3895]);
        detoursList.push("Karwan Bazar weekly street vendor block (Detouring via Tejgaon)");
      }

      // 4. Check Rickshaw restriction on Airport Road highway
      if (vehicleClass === 'rickshaw' && linePassesNearPoint([originLat, originLng], [destLat, destLng], airportTarget, 0.025)) {
        waypoints.push([23.8160, 90.4220]);
        rWarning = "Traditional Rickshaws are prohibited on Airport Road highway! Diverting through secondary lanes.";
        detoursList.push("Rickshaw highway restriction (Routing via residential lanes)");
      }

      // 5. If Clean Air Route is toggled, insert bypass away from high pollution zone (Tejgaon/Jatrabari)
      if (useAqiRouting && linePassesNearPoint([originLat, originLng], [destLat, destLng], [23.7600, 90.4120], 0.025)) {
        waypoints.push([23.7900, 90.4250]);
        detoursList.push("Clean Air Mode: Detouring away from high PM2.5/Construction smog");
      }

      waypoints.push([destLat, destLng]);
      setActiveDetours(detoursList);
      setRickshawWarning(rWarning);

      const coordinateString = waypoints.map(w => `${w[1]},${w[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.routes && data.routes.length > 0) {
        const calculatedRoutes = data.routes.map((route, idx) => {
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          const steps = route.legs.flatMap(leg => leg.steps).map(step => {
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

          const congestion = calculateRouteCongestion(coords, visibleIncidents);

          let durationMin = Math.round(route.duration / 60);
          if (vehicleClass === 'cng') {
            durationMin = Math.round(durationMin * 1.25);
          } else if (vehicleClass === 'rickshaw') {
            durationMin = Math.round(durationMin * 3.2);
          }
          
          return {
            geometry: coords,
            steps: steps,
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMin: durationMin,
            congestion: congestion,
            name: idx === 0 ? "Bypass Navigator (Least Traffic)" : `Alternative Path ${idx}`
          };
        });

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

  useEffect(() => {
    if (originCoords && destCoords) {
      fetchRoutes();
    }
  }, [originCoords, destCoords, vehicleClass, vipProtocolActive, monsoonBypassActive, weeklyBazaarActive, useAqiRouting]);

  // Fare Details CNG (Feature 1)
  const getCngFareDetails = () => {
    const km = parseFloat(cngDistInput) || (routes[activeRouteIndex] ? parseFloat(routes[activeRouteIndex].distanceKm) : 0) || 5;
    const govtFare = Math.round(40 + Math.max(0, km - 2) * 12 + 15);
    const marketFare = Math.round(km * 28 + 120);
    const suggestMin = Math.round(govtFare * 1.35);
    const suggestMax = Math.round(govtFare * 1.55);
    return { govtFare, marketFare, suggestMin, suggestMax, km };
  };

  const fareInfo = getCngFareDetails();

  // Toll Calculator details (Feature 19)
  const getRouteTollFees = () => {
    if (!routes[activeRouteIndex]) return 0;
    const path = routes[activeRouteIndex].geometry;
    let toll = 0;
    // Padma coordinates approximation
    const passesPadma = path.some(([lat, lng]) => lat < 23.6 && lng < 90.3);
    const passesHanif = path.some(([lat, lng]) => lat < 23.72 && lat > 23.70 && lng > 90.41);
    
    if (passesPadma) toll += 1500; // Padma Bridge
    if (passesHanif) toll += 60;   // Hanif Flyover
    return toll;
  };

  const activeTollFee = getRouteTollFees();

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

          {/* Ambulance flashing siren alert banner */}
          {isAmbulanceSimActive && (
            <div style={{ position: 'absolute', top: '70px', left: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.95)', color: '#fff', border: '1px solid #ff8888', borderRadius: '8px', padding: '12px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>🚨</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>EMERGENCY SIREN DETECTED (Mirpur Road)</strong>
                <span style={{ fontSize: '0.78rem', color: '#ffd1d1' }}>Ambulance priority wave active. All vehicles please shift left and clear lanes!</span>
              </div>
            </div>
          )}

          {/* CNG Water intake warning card (Feature 17) */}
          {showCngEngineWarning && (
            <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px', background: 'rgba(240, 82, 91, 0.95)', color: '#fff', border: '1px solid #ffaaad', borderRadius: '8px', padding: '12px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <strong>❌ CNG ENGINE FLOOD INGESTION RISK</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ffdddf' }}>Farmgate water depth is 18 inches. Air intake of CNG auto-rickshaws is low; do not cross to prevent engine lock!</p>
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

            {/* Render VIP blockade circle */}
            {vipProtocolActive && (
              <CircleMarker
                center={[23.7684, 90.3789]}
                radius={25}
                pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.35, weight: 3, dashArray: '5, 5' }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#a855f7' }}>🛑 VIP Protocol active</strong>
                    <span>Bijoy Sarani intersection blocked. Detour required.</span>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Render Monsoon flood sensor circle */}
            {monsoonBypassActive && (
              <CircleMarker
                center={[23.7561, 90.3897]}
                radius={20}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#f0525b' }}>⚠️ Severe Waterlogging</strong>
                    <span>Farmgate depth exceeds 18 inches. Slow clearance.</span>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Render Rain Shelter Markers (Feature 3) */}
            {showRainOverlay && rainShelters.map((sh, idx) => (
              <CircleMarker
                key={idx}
                center={sh.coords}
                radius={12}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#60a5fa' }}>☂️ Monsoon Rain Shelter</strong>
                    <strong>{sh.name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ccc' }}>Capacity: {sh.capacity} people dry space</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Render Volcanizer Emergency Repair Markers (Feature 13) */}
            {showVolcanizers && volcanizers.map((vc, idx) => (
              <CircleMarker
                key={idx}
                center={vc.coords}
                radius={12}
                pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#fbbf24' }}>🛠️ Emergency Tire Repair (Volcanizer)</strong>
                    <strong>{vc.name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ccc' }}>Phone: {vc.contact}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Render Ride stands bike markers (Feature 16) */}
            {showRideStands && rideStands.map((stand, idx) => (
              <CircleMarker
                key={idx}
                center={stand.coords}
                radius={12}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#34d399' }}>🏍️ Ride-Share Bike Stand Hub</strong>
                    <strong>{stand.name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ccc' }}>Active Pathao/Obhai Riders waiting: {stand.activeBikes}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Render Pothole and Road Damage Hazard Pins (Feature 5) */}
            {reportedHazards.map((haz, idx) => (
              <CircleMarker
                key={idx}
                center={haz.coords}
                radius={10}
                pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#facc15' }}>🕳️ Road Damage Hazard</strong>
                    <span>Type: {haz.severity}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Render Camouflaged Puddles (Feature 20) */}
            {showCamouflagedPuddles && camouflagedPuddles.map((pud, idx) => (
              <CircleMarker
                key={idx}
                center={pud.coords}
                radius={14}
                pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.6, weight: 2 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#22d3ee' }}>💧 Camouflaged Puddle Alert</strong>
                    <span>Warning: Large puddle hiding a deep pothole beneath!</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Render streetlight blackout zone polylines (Feature 18) */}
            {showBlackoutZones && blackoutStreets.map((st, idx) => (
              <Polyline
                key={idx}
                positions={st.coords}
                pathOptions={{ color: '#6b7280', weight: 6, opacity: 0.8, dashArray: '2, 6' }}
              />
            ))}

            {/* Render slippery flyover indicators if Slippery toggle is ON (Feature 6) */}
            {isSlipperyWeather && (
              <>
                <CircleMarker
                  center={[23.7780, 90.4005]}
                  radius={30}
                  pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 0.15, weight: 2, dashArray: '3, 3' }}
                >
                  <Popup><span style={{ color: '#fff' }}>🏍️ Mohakhali Flyover Slippery Warning (Rain)</span></Popup>
                </CircleMarker>
                <CircleMarker
                  center={[23.7180, 90.4250]}
                  radius={35}
                  pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 0.15, weight: 2, dashArray: '3, 3' }}
                >
                  <Popup><span style={{ color: '#fff' }}>🏍️ Hanif Flyover Slippery Warning (Rain)</span></Popup>
                </CircleMarker>
              </>
            )}

            {/* Render Weekly Bazaar Block marker (Feature 7) */}
            {weeklyBazaarActive && (
              <CircleMarker
                center={[23.7505, 90.3930]}
                radius={18}
                pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.8, weight: 3 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#fda4af' }}>🛍️ Weekly Bazaar Road Block</strong>
                    <span>Karwan Bazar wholesale vendor market blocking lane. Detour active.</span>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Render Animated Bus Tracker Pin (Feature 2) */}
            {isBusTracking && (
              <CircleMarker
                center={busTrackCoords[busIndex]}
                radius={12}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9, weight: 3 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#34d399' }}>🚌 Bus Tracker (Live)</strong>
                    <span>Route: {selectedBusRoute} Fleet</span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#ccc' }}>Simulated via commuter GPS signals</span>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Render Simulated Ambulance pathing pin (Feature 8) */}
            {isAmbulanceSimActive && (
              <CircleMarker
                center={ambulanceTrackCoords[ambulanceIndex]}
                radius={13}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9, weight: 4 }}
              >
                <Popup>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <strong style={{ display: 'block', color: '#f87171' }}>🚑 Emergency Ambulance</strong>
                    <span>Sirens Active. Moving to hospital.</span>
                  </div>
                </Popup>
              </CircleMarker>
            )}

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <button
              className={`button ${activeTab === 'telemetry' ? '' : 'secondary'}`}
              style={{ padding: '8px 4px', fontSize: '0.75rem', height: 'auto' }}
              onClick={() => setActiveTab('telemetry')}
            >
              📊 Telemetry
            </button>
            <button
              className={`button ${activeTab === 'navigator' ? '' : 'secondary'}`}
              style={{ padding: '8px 4px', fontSize: '0.75rem', height: 'auto' }}
              onClick={() => setActiveTab('navigator')}
            >
              🗺️ Routing
            </button>
            <button
              className={`button ${activeTab === 'smarthub' ? '' : 'secondary'}`}
              style={{ padding: '8px 4px', fontSize: '0.75rem', height: 'auto', border: activeTab === 'smarthub' ? '1px solid #a855f7' : 'none' }}
              onClick={() => setActiveTab('smarthub')}
            >
              🚀 Smart Hub
            </button>
          </div>

          {activeTab === 'telemetry' && (
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
          )}

          {activeTab === 'navigator' && (
            <>
              <h2 className="panel-title" style={{ fontSize: '1.2rem', marginTop: 0 }}>Bypass Route Planner</h2>
              <p className="panel-subtitle" style={{ margin: 0 }}>Select vehicle, active smart constraints, or click map to set route pins.</p>

              {/* Advanced Dhaka-Specific Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 'bold' }}>Vehicle Type</label>
                  <select
                    style={{ height: '36px', padding: '0 8px', background: '#101319', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.82rem', color: '#fff', width: '100%' }}
                    value={vehicleClass}
                    onChange={(e) => setVehicleClass(e.target.value)}
                  >
                    <option value="car">🚘 Private Car (Standard)</option>
                    <option value="cng">🛺 CNG Auto-Rickshaw</option>
                    <option value="rickshaw">🚲 Traditional Rickshaw (Highway Restricted)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: '#ccc' }}>⛔ Avoid VIP Protocol Blocks</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={vipProtocolActive}
                        onChange={(e) => setVipProtocolActive(e.target.checked)}
                      />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: '#ccc' }}>🌧️ Avoid Monsoon Floods (Farmgate)</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={monsoonBypassActive}
                        onChange={(e) => setMonsoonBypassActive(e.target.checked)}
                      />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Warning notifications for routing */}
              {rickshawWarning && (
                <div className="message error" style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '6px', margin: '4px 0' }}>
                  ⚠️ {rickshawWarning}
                </div>
              )}

              {activeDetours.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(168, 85, 247, 0.08)', border: '1px dashed #a855f7', padding: '10px', borderRadius: '6px', margin: '4px 0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase' }}>Active Detours Applied:</span>
                  {activeDetours.map((det, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: '#e9d5ff' }}>• {det}</span>
                  ))}
                </div>
              )}

              {/* Route Input Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                
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
                      setRickshawWarning('');
                      setActiveDetours([]);
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

          {activeTab === 'smarthub' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 className="panel-title" style={{ fontSize: '1.25rem', marginTop: 0, color: '#a855f7' }}>🚀 Dhaka Smart Hub</h2>
                <p className="panel-subtitle" style={{ margin: 0 }}>Advanced localized commute cockpit. 20 smart city planning features.</p>
              </div>

              {/* ================= CATEGORY 1: COMMUTER ASSISTANCE & TOLLS ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', margin: 0, color: '#c084fc', textTransform: 'uppercase' }}>💸 Commuters & Tolls</h4>
                
                {/* CNG Price check */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>🛺 CNG "Fair-Fare" Pricing</strong>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <input
                      type="number"
                      style={{ flexGrow: 1, height: '28px', padding: '0 8px', background: '#101319', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.75rem', color: '#fff' }}
                      placeholder="trip km..."
                      value={cngDistInput}
                      onChange={(e) => setCngDistInput(e.target.value)}
                    />
                    {routes.length > 0 && (
                      <button
                        className="button secondary"
                        style={{ height: '28px', padding: '0 8px', fontSize: '0.7rem', minWidth: 'auto' }}
                        onClick={() => setCngDistInput(routes[activeRouteIndex].distanceKm)}
                      >
                        Use Dist
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Govt Fare: {fareInfo.govtFare} BDT</span>
                      <span style={{ color: '#fbbf24' }}>Offer: {fareInfo.suggestMin}-{fareInfo.suggestMax} BDT</span>
                    </div>
                  </div>
                </div>

                {/* Toll Plaza sum */}
                {routes.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff' }}>🪙 Route Toll Plaza Sum</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Calculated along active path</span>
                    </div>
                    <strong style={{ color: '#2fbf71', fontSize: '0.9rem' }}>{activeTollFee} BDT</strong>
                  </div>
                )}

                {/* Volcanizer repair shops and CNG Pressure */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🛠️ Show Emergency Tire Shops</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={showVolcanizers} onChange={(e) => setShowVolcanizers(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>⛽ CNG Pump Pressure</span>
                    <select
                      style={{ height: '24px', padding: '0 4px', background: '#101319', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.72rem', color: '#fff' }}
                      value={gasStationStatus}
                      onChange={(e) => setGasStationStatus(e.target.value)}
                    >
                      <option value="High Pressure">⛽ High Pressure (Fast)</option>
                      <option value="Low Pressure">⛽ Low Pressure (Queues)</option>
                      <option value="Loadshedding/Closed">⚡ Loadshedding (Closed)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ================= CATEGORY 2: PUBLIC TRANSIT DECK ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', margin: 0, color: '#c084fc', textTransform: 'uppercase' }}>🚌 Public Transit Deck</h4>
                
                {/* Bus Kothay */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff', marginBottom: '4px' }}>🚌 "Bus Kothay" Crowdsourced GPS</strong>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      style={{ flexGrow: 1, height: '26px', padding: '0 4px', background: '#101319', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}
                      value={selectedBusRoute}
                      onChange={(e) => setSelectedBusRoute(e.target.value)}
                    >
                      <option value="Raida">Raida Bus</option>
                      <option value="Bikash">Bikash Bus</option>
                      <option value="Turag">Turag Bus</option>
                    </select>
                    <button
                      className={`button ${isBusTracking ? 'danger' : ''}`}
                      style={{ height: '26px', padding: '0 8px', fontSize: '0.7rem', minWidth: 'auto' }}
                      onClick={() => setIsBusTracking(!isBusTracking)}
                    >
                      {isBusTracking ? "Stop Tracker" : "Track Bus"}
                    </button>
                  </div>
                </div>

                {/* MRT Station cards with vending stock status */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>🚇 Metro Station Cards Stock</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                    {mrtStations.map((st, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ccc' }}>{st.name.split(' ')[0]}</span>
                        <span style={{ color: st.cardStock.includes('Out') ? '#f0525b' : '#2fbf71' }}>{st.cardStock}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inter-District Terminal Queue status */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>🏬 Bus Terminal Ticket Counters</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ccc' }}>Gabtoli Terminal Counters:</span>
                      <span className="badge danger">{terminalQueues.gabtoli}m wait</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ccc' }}>Sayedabad Terminal Counters:</span>
                      <span className="badge success">{terminalQueues.sayedabad}m wait</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CATEGORY 3: MONSOON & HYDROLOGY ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', margin: 0, color: '#c084fc', textTransform: 'uppercase' }}>🌦️ Monsoon & Hydrology</h4>
                
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>☂️ Show Rain Shelters Overlay</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={showRainOverlay} onChange={(e) => setShowRainOverlay(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🏍️ Slippery Flyover Safety Warnings</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={isSlipperyWeather} onChange={(e) => setIsSlipperyWeather(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>💧 Show Camouflaged Puddles</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={showCamouflagedPuddles} onChange={(e) => setShowCamouflagedPuddles(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* ================= CATEGORY 4: URBAN SAFETY & REPORTS ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', margin: 0, color: '#c084fc', textTransform: 'uppercase' }}>🚶 Urban Safety & Reports</h4>
                
                {/* Overbridge block */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <strong style={{ display: 'block', color: '#fff', marginBottom: '2px' }}>🚶 Foot-Overbridge Safety</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ color: '#ccc' }}>{overbridgeCondition.name}:</span>
                    <span style={{ color: '#fbbf24' }}>{overbridgeCondition.state}</span>
                  </div>
                </div>

                {/* Ride stand indicators & blackout toggle */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🏍️ Ride-Share Stands (Pathao Hotspots)</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={showRideStands} onChange={(e) => setShowRideStands(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🕯️ Streetlight Blackout Zones</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={showBlackoutZones} onChange={(e) => setShowBlackoutZones(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🌫️ Clean Air Route Optimizer</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={useAqiRouting} onChange={(e) => setUseAqiRouting(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Pothole reporter */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#fff', marginBottom: '4px' }}>🕳️ Crowdsourced Hazard Reporter</strong>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      style={{ flexGrow: 1, height: '26px', padding: '0 4px', background: '#101319', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}
                      value={tempHazardSeverity}
                      onChange={(e) => setTempHazardSeverity(e.target.value)}
                    >
                      <option value="Deep Pothole">Deep Pothole</option>
                      <option value="Water Puddle">Water Puddle</option>
                      <option value="Engine Breaker">Engine Breaker Pit</option>
                    </select>
                    <button
                      className={`button ${pickMode === 'hazard' ? '' : 'secondary'}`}
                      style={{ height: '26px', padding: '0 8px', fontSize: '0.7rem', minWidth: 'auto' }}
                      onClick={() => setPickMode(pickMode === 'hazard' ? null : 'hazard')}
                    >
                      Drop Pin
                    </button>
                  </div>
                </div>

                {/* Ambulance wave and Weekly bazaar */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🛍️ Weekly Bazaar (Karwan Bazar)</span>
                    <label className="sim-toggle" style={{ margin: 0 }}>
                      <input type="checkbox" checked={weeklyBazaarActive} onChange={(e) => setWeeklyBazaarActive(e.target.checked)} />
                      <span className="sim-toggle-slider" />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#ccc' }}>🚑 Ambulance Dispatch wave</span>
                    <button
                      className="button secondary"
                      style={{ height: '24px', padding: '0 8px', fontSize: '0.65rem', minWidth: 'auto' }}
                      onClick={() => {
                        setIsAmbulanceSimActive(!isAmbulanceSimActive);
                        setAmbulanceIndex(0);
                      }}
                    >
                      {isAmbulanceSimActive ? "Stop Dispatch" : "Dispatch"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Toll plazas exit delay predictors */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--line)', padding: '12px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.82rem', margin: '0 0 8px 0', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🌉 Toll exit plaza delay predictor</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ccc' }}>Padma Bridge Toll:</span>
                    <span className="badge success">{tollDelays.padma}m queue</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ccc' }}>Hanif Flyover Toll:</span>
                    <span className="badge danger">{tollDelays.hanif}m queue</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
};

export default LiveMap;
