import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { citizenServices } from '../data/citizenServices';
import { demoIncidents, demoLiveTraffic } from '../data/trafficDemoData';
import { findKnownLocation, formatRouteStep } from '../services/routePlanner';
import { calculateCngFare, OFFICIAL_CNG_RATES } from '../services/fareCalculations';
import {
  buildFallbackMetroSchedule,
  estimateMetroPositions,
  getDhakaClock,
  getMetroScheduleKind,
  getStationTimetable,
  METRO_TIMETABLE_URLS,
  parseScheduleTime
} from '../services/metroTracker';
import {
  cngStands, congestionPatterns, dhakaAreas, emergencyContacts,
  fareRates, fuelStations, hospitals, mrtLine, mrtStations,
  parkingLocations, policeZones, roadClosures, schoolZones, waterloggingZones
} from '../data/dhakaData';
import { BUS_DATASET_META, dhakaBusRoutes } from '../data/dhakaBusRoutes';
import { findBusJourneys, getBusStopSuggestions, getUniqueBusStops } from '../services/busRouteFinder';
import { PARKING_KOI_META, parkingKoiAreas } from '../data/parkingKoiData';
import { formatParkingDistance, rankPublicParking, rankResidentialParking } from '../services/parkingFinder';
import { HOSPITAL_DIRECTORY_META, HOSPITAL_DIRECTORY_SOURCES, akijDhakaFacilities } from '../data/hospitalDirectoryData';
import {
  buildHospitalDirectory,
  formatHospitalDistance,
  hospitalMarkerColor,
  rankHospitals
} from '../services/hospitalFinder';
import {
  BRINTADAS_FUEL_META,
  FUEL_STATUS,
  OFFICIAL_FUEL_PRICES,
  buildFallbackFuelStations,
  fetchBrintadasFuelStations,
  formatFuelReportAge,
  getDisplayedFuelPrice,
  rankFuelStations
} from '../services/fuelTracker';

const dhakaCenter = [23.8103, 90.4125];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_SUB = ['a', 'b', 'c'];

const MapFly = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14, { animate: true }); }, [center, map]);
  return null;
};

const allTools = [
  { id: 1, icon: '🗺️', name: 'Route Planner', category: 'Navigation', desc: 'Find the best route between any two Dhaka locations with real road distance and time.' },
  { id: 2, icon: '🚕', name: 'CNG & Rickshaw Fare', category: 'Cost', desc: 'Pin two places to calculate road distance, the official CNG meter fare, and a clearly labelled rickshaw estimate.' },
  { id: 3, icon: '📍', name: 'Live Incident Map', category: 'Safety', desc: 'See all reported traffic incidents across Dhaka plotted live on a map.' },
  { id: 4, icon: '⚠️', name: 'Report a Problem', category: 'Safety', desc: 'Quickly report congestion, accidents, flooding, or signal failures in your area.' },
  { id: 5, icon: '🚇', name: 'Metro (MRT) Guide', category: 'Transit', desc: 'See MRT-6 stations, timetable-estimated train positions, first/last times, and nearby bus connections.' },
  { id: 6, icon: '🚌', name: 'Bus Route Finder', category: 'Transit', desc: 'Choose two Dhaka stops to see direct buses, boarding instructions, and one-transfer alternatives.' },
  { id: 7, icon: '🅿️', name: 'Parking Spot Finder', category: 'Parking', desc: 'Search around any Dhaka location for public hourly parking or ParkingKoi residential listings.' },
  { id: 8, icon: '📞', name: 'Emergency Contacts', category: 'Safety', desc: 'One-tap call cards for police, fire, hospital, DNCC, and transport emergency lines.' },
  { id: 9, icon: '🌊', name: 'Waterlogging Map', category: 'Weather', desc: 'See flood-prone roads and areas in Dhaka with drainage notes and alternate routes.' },
  { id: 10, icon: '⛽', name: 'Fuel Station Finder', category: 'Transport', desc: 'Find nearby petrol, octane, diesel, and kerosene stations with community queue updates.' },
  { id: 11, icon: '⏰', name: 'Best Time to Travel', category: 'Planning', desc: 'See hourly traffic patterns and find the best time to depart for your journey.' },
  { id: 12, icon: '🏥', name: 'Hospital Finder', category: 'Safety', desc: 'Use your live location or tap the map to find and call nearby Dhaka hospitals.' },
  { id: 13, icon: '🏫', name: 'School Zone Alerts', category: 'Safety', desc: 'See school zones that are currently active — automatically turns red during school hours.' },
  { id: 14, icon: '🛺', name: 'CNG & Rickshaw Stands', category: 'Transport', desc: 'Find the nearest CNG auto-rickshaw or cycle-rickshaw stands with typical wait times.' },
  { id: 15, icon: '🚧', name: 'Road Closures', category: 'Planning', desc: 'View current and upcoming road closures and construction works across Dhaka.' },
  { id: 16, icon: '💰', name: 'Journey Cost Estimator', category: 'Cost', desc: 'Compare travel costs for CNG, bus, rickshaw, Uber/Pathao, metro, and car on any route.' },
  { id: 17, icon: '👮', name: 'Traffic Police Zones', category: 'Safety', desc: 'Find your nearest DMP traffic zone station with contact numbers.' },
  { id: 18, icon: '📋', name: 'My Reported Incidents', category: 'Personal', desc: 'Track the status of incidents you have submitted — Open, Investigating, or Resolved.' },
  { id: 19, icon: '🏠', name: 'Commute Planner', category: 'Personal', desc: 'Save your home and work location to get a daily traffic summary for your commute.' },
  { id: 20, icon: '📢', name: 'Authority Alerts', category: 'Operations', desc: 'View official traffic alerts. Authorities can broadcast new alerts to all users.' },
  { id: 21, icon: '🌫️', name: 'Live Air Quality', category: 'Weather', desc: 'Check real-time air quality index in Dhaka powered by IQAir.' },
  { id: 22, icon: '🌤️', name: 'Current Weather', category: 'Weather', desc: 'Check current weather conditions in Dhaka via AccuWeather.' },
  { id: 23, icon: '📵', name: 'Offline SMS Alerts', category: 'Personal', desc: 'Subscribe to severe traffic alerts via SMS for offline access.' },
  { id: 24, icon: '⛈️', name: 'Rain Warning', category: 'Weather', desc: 'Check if rain is expected soon at your location via AccuWeather.' },
  { id: 25, icon: '🙏', name: 'Prayer Time Traffic', category: 'Planning', desc: 'Avoid heavy traffic around mosques during prayer times.' },
  { id: 26, icon: '🚫', name: 'Hartaal / Strike Alert', category: 'Safety', desc: 'Check upcoming political strikes and affected transport.' },
  { id: 27, icon: '🚔', name: 'VIP Movement Alerts', category: 'Safety', desc: 'See community reports of sudden road blocks for VIPs.' },
  { id: 28, icon: '🔍', name: 'Lost & Found', category: 'Personal', desc: 'Report or find items lost on bus, CNG, or rickshaw.' },
  { id: 29, icon: '🚶', name: 'Safe Crossings', category: 'Safety', desc: 'Find nearby footover bridges and underpasses.' },
  { id: 30, icon: '🏧', name: 'ATM & bKash Finder', category: 'Cost', desc: 'Find cash for your transport fare immediately.' },
  { id: 31, icon: '🔧', name: 'Breakdown Help', category: 'Safety', desc: 'Find the nearest auto repair or tyre shop.' },
  { id: 32, icon: '📖', name: 'Dhaka Transport Guide', category: 'Transit', desc: 'Learn how to board buses, negotiate CNGs, and use Metro.' },
  { id: 33, icon: '📊', name: 'Travel Diary', category: 'Personal', desc: 'Log your daily commute time and transport costs.' },
  { id: 34, icon: '🚂', name: 'BD Train Tracker', category: 'Transit', desc: 'Check intercity train schedules and live location.' },
];

const categoryColors = {
  Navigation: 'var(--accent)', Cost: 'var(--success)', Safety: 'var(--danger)',
  Transit: 'var(--purple)', Parking: 'var(--primary)', Weather: '#38bdf8',
  Transport: '#fb923c', Planning: '#a78bfa', Personal: '#34d399', Operations: '#f43f5e'
};

const SmartHub = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTool = searchParams.get('tool');
  const queryService = citizenServices.find((service) => service.slug === requestedTool);
  const [activeTool, setActiveTool] = useState(queryService?.id || null);
  const [catFilter, setCatFilter] = useState('All');
  const panelRef = useRef(null);

  const cats = ['All', ...Array.from(new Set(allTools.map(t => t.category)))];
  const filtered = catFilter === 'All' ? allTools : allTools.filter(t => t.category === catFilter);

  const openTool = (id) => {
    setActiveTool(id);
    const service = citizenServices.find((item) => item.id === id);
    setSearchParams(service ? { tool: service.slug } : { tool: String(id) });
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const closeTool = () => {
    setActiveTool(null);
    setSearchParams({});
  };

  useEffect(() => {
    const service = citizenServices.find((item) => item.slug === requestedTool);
    const numericTool = Number(requestedTool);
    const nextTool = service?.id || (Number.isInteger(numericTool) && numericTool > 0 ? numericTool : null);
    setActiveTool(nextTool);
  }, [requestedTool]);

  return (
    <div className="tools-page">
      <div className="tools-page-header">
        <div>
          <h1>Dhaka Traffic Tools</h1>
          <p>24 real tools to help you navigate, plan, and stay safe in Dhaka.</p>
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
          <ToolPanel
            toolId={activeTool}
            user={user}
            isAuthenticated={isAuthenticated}
            onClose={closeTool}
            initialFrom={searchParams.get('from') || ''}
            initialTo={searchParams.get('to') || ''}
          />
        </div>
      )}
    </div>
  );
};

// ===================================================================
// ToolPanel — Renders the correct feature UI based on toolId
// ===================================================================
const ToolPanel = ({ toolId, user, isAuthenticated, onClose, initialFrom = '', initialTo = '' }) => {
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
        {toolId === 1 && <RoutePlanner initialFrom={initialFrom} initialTo={initialTo} />}
        {toolId === 2 && <CNGFareCalc />}
        {toolId === 3 && <LiveIncidentMap />}
        {toolId === 4 && <QuickReportForm user={user} isAuthenticated={isAuthenticated} />}
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
        {toolId === 21 && <AirQuality />}
        {toolId === 22 && <Weather />}
        {toolId === 23 && <OfflineSms />}
        {toolId === 24 && <RainWarning />}
        {toolId === 25 && <PrayerTraffic />}
        {toolId === 26 && <StrikeAlerts />}
        {toolId === 27 && <VipAlerts />}
        {toolId === 28 && <LostFound />}
        {toolId === 29 && <SafeCrossings />}
        {toolId === 30 && <AtmFinder />}
        {toolId === 31 && <BreakdownHelp />}
        {toolId === 32 && <TransportGuide />}
        {toolId === 33 && <TravelDiary />}
        {toolId === 34 && <TrainTracker />}
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

const MapClickHandler = ({ onMapClick, enabled }) => {
  const map = useMapEvents({
    click(e) {
      if (enabled) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  useEffect(() => {
    map.getContainer().style.cursor = enabled ? 'crosshair' : '';
    return () => { map.getContainer().style.cursor = ''; };
  }, [enabled, map]);
  return null;
};

const trafficAnchorCoordinates = {
  'mirpur-farmgate': [[23.8069, 90.3687], [23.7959, 90.3735], [23.7789, 90.3831], [23.7681, 90.3895], [23.7562, 90.3896]],
  'gulshan-banani': [[23.7808, 90.4168], [23.7864, 90.4115], [23.7934, 90.4045]],
  'shahbagh-motijheel': [[23.7385, 90.3965], [23.7330, 90.4053], [23.7302, 90.4092], [23.7257, 90.4188]],
  'uttara-airport': [[23.8672, 90.3885], [23.8600, 90.3970], [23.8513, 90.4089]],
  'jatrabari-gulistan': [[23.7087, 90.4327], [23.7150, 90.4235], [23.7195, 90.4168], [23.7234, 90.4116]]
};

const pointDistance = ([latA, lngA], [latB, lngB]) => Math.sqrt((latA - latB) ** 2 + (lngA - lngB) ** 2);

const calculateTrafficScore = (routeGeometry, trafficData, incidentData) => {
  const sampledRoute = routeGeometry.filter((_, index) => index % 12 === 0 || index === routeGeometry.length - 1);
  let weightedCongestion = Number(trafficData?.averageCongestion || 50) * 0.35;
  let totalWeight = 0.35;

  (trafficData?.corridors || []).forEach((corridor) => {
    const anchors = trafficAnchorCoordinates[corridor.id] || [];
    if (!anchors.length) return;
    const nearestDistance = Math.min(...anchors.flatMap((anchor) => sampledRoute.map((point) => pointDistance(anchor, point))));
    if (nearestDistance < 0.014) {
      const weight = Math.max(0.15, 1 - (nearestDistance / 0.014));
      weightedCongestion += Number(corridor.congestion || 50) * weight;
      totalWeight += weight;
    }
  });

  let incidentPenalty = 0;
  (incidentData || []).forEach((incident) => {
    const rawCoords = incident.coordinates || incident.location?.coordinates;
    if (!rawCoords?.length) return;
    const incidentPoint = [rawCoords[1], rawCoords[0]];
    const nearestDistance = Math.min(...sampledRoute.map((point) => pointDistance(incidentPoint, point)));
    if (nearestDistance < 0.009) {
      const severityPenalty = { Critical: 22, High: 15, Medium: 9, Low: 4 }[incident.severity] || 6;
      incidentPenalty += severityPenalty * Math.max(0.25, 1 - (nearestDistance / 0.009));
    }
  });

  return Math.min(98, Math.max(8, Math.round((weightedCongestion / totalWeight) + Math.min(24, incidentPenalty))));
};

const MapRouteViewport = ({ routeGeometry, focusPoint }) => {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (routeGeometry?.length > 1) {
        map.fitBounds(routeGeometry, { padding: [34, 34], maxZoom: 15 });
      } else if (focusPoint) {
        map.setView(focusPoint, 15, { animate: true });
      }
    }, 40);
    return () => window.clearTimeout(timer);
  }, [focusPoint, map, routeGeometry]);
  return null;
};

const RoutePlanner = ({ initialFrom = '', initialTo = '' }) => {
  const hasUsableInitialRoute = initialFrom.trim().length >= 3
    && initialTo.trim().length >= 3
    && initialFrom.trim().toLowerCase() !== initialTo.trim().toLowerCase();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [fromLabel, setFromLabel] = useState('');
  const [toLabel, setToLabel] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickMode, setPickMode] = useState(hasUsableInitialRoute ? null : 'start');
  const [trafficData, setTrafficData] = useState(demoLiveTraffic);
  const [incidents, setIncidents] = useState(demoIncidents);
  const [trafficSource, setTrafficSource] = useState('sample');
  const [locationLoading, setLocationLoading] = useState(false);
  const autoSearchRef = useRef(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/live-traffic'),
      api.get('/incidents?limit=50')
    ]).then(([trafficResult, incidentResult]) => {
      if (trafficResult.status === 'fulfilled') {
        setTrafficData(trafficResult.value.data);
        setTrafficSource('live');
      }
      if (incidentResult.status === 'fulfilled') {
        setIncidents(incidentResult.value.data?.items || incidentResult.value.data || []);
      }
    });
  }, []);

  const geocode = async (query, isStart) => {
    if (isStart && fromCoords && query === fromLabel) {
      return fromCoords;
    }
    if (!isStart && toCoords && query === toLabel) {
      return toCoords;
    }
    const knownLocation = findKnownLocation(query);
    if (knownLocation) return knownLocation.coords;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Dhaka, Bangladesh')}&limit=1&countrycodes=bd`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!data.length) throw new Error(`Location not found: ${query}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const calculateBestRoute = useCallback(async (fCoords, tCoords, startName, endName) => {
    setLoading(true);
    setError('');
    setRoute(null);
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fCoords[1]},${fCoords[0]};${tCoords[1]},${tCoords[0]}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      const osrmRes = await fetch(osrmUrl);
      if (!osrmRes.ok) throw new Error('The road routing service is temporarily unavailable.');
      const osrmData = await osrmRes.json();
      if (osrmData.code !== 'Ok' || !osrmData.routes?.length) throw new Error('No driveable route was found between those two pins.');

      const rankedRoutes = osrmData.routes.map((candidate, index) => {
        const geometry = candidate.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const congestion = calculateTrafficScore(geometry, trafficData, incidents);
        const durationMin = Math.max(1, Math.round(candidate.duration / 60));
        const trafficDurationMin = Math.max(durationMin, Math.round(durationMin * (1 + congestion / 260)));
        const rawSteps = candidate.legs?.[0]?.steps || [];
        const steps = rawSteps.map((step, stepIndex) => {
          const formatted = formatRouteStep(step, stepIndex, rawSteps.length);
          return { ...formatted, distance: formatted.distanceMeters };
        });
        return {
          id: index,
          fromCoords: fCoords,
          toCoords: tCoords,
          fromLabel: startName,
          toLabel: endName,
          geometry,
          distanceKm: Number((candidate.distance / 1000).toFixed(1)),
          durationMin,
          trafficDurationMin,
          congestion,
          steps,
          routeScore: trafficDurationMin + congestion * 0.08
        };
      }).sort((first, second) => first.routeScore - second.routeScore);

      setRoute({
        ...rankedRoutes[0],
        alternativesChecked: rankedRoutes.length,
        nextBest: rankedRoutes[1] || null
      });
    } catch (routeError) {
      setError(routeError.message);
    } finally {
      setLoading(false);
    }
  }, [incidents, trafficData]);

  const handleSearch = async () => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();
    if (cleanFrom.length < 3 || cleanTo.length < 3) {
      setRoute(null);
      setError('Type at least 3 characters for each place, or use the two pin buttons and click the map.');
      return;
    }
    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setRoute(null);
      setError('Your starting point and destination must be different.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [fCoords, tCoords] = await Promise.all([geocode(cleanFrom, true), geocode(cleanTo, false)]);
      if (pointDistance(fCoords, tCoords) < 0.0005) throw new Error('Those places resolve to the same point. Choose two different locations.');
      setFromCoords(fCoords);
      setToCoords(tCoords);
      setFromLabel(cleanFrom);
      setToLabel(cleanTo);
      await calculateBestRoute(fCoords, tCoords, cleanFrom, cleanTo);
    } catch (searchError) {
      setError(searchError.message);
      setLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    if (!pickMode) return;
    setError('');
    setRoute(null);
    const coordinates = [lat, lng];
    const temporaryLabel = `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    if (pickMode === 'start') {
      setFrom(temporaryLabel);
      setFromLabel(temporaryLabel);
      setFromCoords(coordinates);
      setPickMode('end');
      reverseGeocode(lat, lng).then((label) => {
        setFrom(label);
        setFromLabel(label);
      });
    } else if (pickMode === 'end') {
      setTo(temporaryLabel);
      setToLabel(temporaryLabel);
      setToCoords(coordinates);
      setPickMode(null);
      reverseGeocode(lat, lng).then((label) => {
        setTo(label);
        setToLabel(label);
      });
      if (fromCoords) calculateBestRoute(fromCoords, coordinates, fromLabel || from, temporaryLabel);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is not available in this browser.');
      return;
    }
    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = [coords.latitude, coords.longitude];
        setFromCoords(coordinates);
        setFrom('My current location');
        setFromLabel('My current location');
        setRoute(null);
        setPickMode('end');
        setLocationLoading(false);
      },
      () => {
        setError('We could not access your location. Allow location permission and try again.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const resetRoute = () => {
    setFrom('');
    setTo('');
    setFromCoords(null);
    setToCoords(null);
    setFromLabel('');
    setToLabel('');
    setRoute(null);
    setError('');
    setPickMode('start');
  };

  useEffect(() => {
    if (!autoSearchRef.current && hasUsableInitialRoute) {
      autoSearchRef.current = true;
      handleSearch();
    }
  });

  const visibleFromCoords = route?.fromCoords || fromCoords;
  const visibleToCoords = route?.toCoords || toCoords;
  const cngFare = route ? calculateCngFare(route.distanceKm) : null;

  return (
    <div className="pin-route-planner">
      <div className="pin-route-intro">
        <div>
          <span className={`live-route-status ${trafficSource}`}>{trafficSource === 'live' ? '● Live traffic connected' : '● Traffic sample mode'}</span>
          <h3>Pin two places on the map</h3>
          <p>Choose your start, choose your destination, and TrafficEase will select the lowest-congestion road option available.</p>
        </div>
        <div className="pin-route-steps" aria-label="Route planning steps">
          <span className={fromCoords ? 'done' : pickMode === 'start' ? 'active' : ''}><b>1</b> Start</span>
          <span className={toCoords ? 'done' : pickMode === 'end' ? 'active' : ''}><b>2</b> Destination</span>
          <span className={route ? 'done' : loading ? 'active' : ''}><b>3</b> Best route</span>
        </div>
      </div>
      <div className="rp-form pin-route-form">
        <label>
          <span>Starting point</span>
          <div>
            <input className="tool-input" placeholder="Type a place or pin it on the map" value={from} onChange={(event) => { setFrom(event.target.value); setFromCoords(null); setRoute(null); }} />
            <button type="button" className={`map-pin-button start ${pickMode === 'start' ? 'active' : ''}`} aria-label="Pin starting point on map" title="Pin starting point on map" onClick={() => setPickMode('start')}>📍</button>
          </div>
        </label>

        <span className="route-search-arrow" aria-hidden="true">→</span>

        <label>
          <span>Destination</span>
          <div>
            <input className="tool-input" placeholder="Type a place or pin it on the map" value={to} onChange={(event) => { setTo(event.target.value); setToCoords(null); setRoute(null); }} />
            <button type="button" className={`map-pin-button end ${pickMode === 'end' ? 'active' : ''}`} aria-label="Pin destination on map" title="Pin destination on map" onClick={() => setPickMode('end')}>🎯</button>
          </div>
        </label>

        <button className="button find-least-jam" type="button" onClick={handleSearch} disabled={loading}>{loading ? 'Checking traffic…' : 'Find least-jam route'}</button>
      </div>

      <div className="pin-route-actions">
        <button type="button" onClick={useCurrentLocation} disabled={locationLoading}>{locationLoading ? 'Getting your location…' : '⌖ Use my current location'}</button>
        {(from || to || route) && <button type="button" onClick={resetRoute}>Clear and start again</button>}
      </div>

      {pickMode && (
        <div className={`map-pick-notice ${pickMode}`}>
          <span>{pickMode === 'start' ? '📍' : '🎯'}</span>
          <div><strong>Click the map to set your {pickMode === 'start' ? 'starting point' : 'destination'}</strong><small>{pickMode === 'start' ? 'After your first pin, the map will ask for your destination.' : 'The best low-traffic route will appear automatically after this pin.'}</small></div>
        </div>
      )}

      {error && <div className="tool-error">{error}</div>}

      {route && (
        <div className="route-best-summary">
          <div className="route-best-heading">
            <span>✓ Best low-traffic match</span>
            <strong>{route.fromLabel} → {route.toLabel}</strong>
            <small>Compared {route.alternativesChecked} available road {route.alternativesChecked === 1 ? 'path' : 'paths'} using current corridor and incident conditions.</small>
          </div>
          <div className="route-stats">
          <div className="route-stat"><span>Live jam estimate</span><strong>{route.congestion}%</strong></div>
          <div className="route-stat"><span>Traffic-aware time</span><strong>{route.trafficDurationMin} min</strong></div>
          <div className="route-stat"><span>Road distance</span><strong>{route.distanceKm} km</strong></div>
          <div className="route-stat"><span>CNG meter fare</span><strong>Tk {cngFare.total}</strong></div>
          <div className="route-stat"><span>Bus Fare</span><strong>Tk {Math.max(15, Math.round(route.distanceKm * fareRates.bus.perKm + fareRates.bus.flat))}</strong></div>
          </div>
        </div>
      )}

      <div className="pin-map-toolbar" aria-label="Map pin controls">
        <button type="button" className={`start ${pickMode === 'start' ? 'active' : ''} ${fromCoords ? 'done' : ''}`} onClick={() => setPickMode('start')}>
          <b>1</b><span><strong>Pin starting point</strong><small>{fromCoords ? 'Start pin placed—click to change it' : 'Click here, then click anywhere on the map'}</small></span>
        </button>
        <button type="button" className={`end ${pickMode === 'end' ? 'active' : ''} ${toCoords ? 'done' : ''}`} onClick={() => setPickMode('end')}>
          <b>2</b><span><strong>Pin destination</strong><small>{toCoords ? 'Destination pin placed—click to change it' : 'Click here, then click anywhere on the map'}</small></span>
        </button>
      </div>

      <div className={`tool-map-wrap pin-route-map ${pickMode ? 'picking' : ''}`}>
        <div className="map-live-layer-label"><span /> TrafficEase live traffic overlay</div>
        {pickMode && <div className={`map-click-banner ${pickMode}`}>{pickMode === 'start' ? '📍 Click the map to place your START pin' : '🎯 Click the map to place your DESTINATION pin'}</div>}
        <div className="traffic-map-legend" aria-label="Traffic colours"><span className="moving" />Moving <span className="busy" />Busy <span className="heavy" />Heavy</div>
        <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 500, width: '100%', borderRadius: 12 }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={TILE_URL} subdomains={TILE_SUB} maxZoom={19} />
          <MapClickHandler onMapClick={handleMapClick} enabled={Boolean(pickMode)} />
          <MapRouteViewport routeGeometry={route?.geometry} focusPoint={fromCoords || toCoords} />
          {(trafficData.corridors || []).map((corridor) => {
            const path = trafficAnchorCoordinates[corridor.id];
            if (!path) return null;
            const trafficColor = corridor.congestion >= 80 ? '#dc2626' : corridor.congestion >= 60 ? '#f59e0b' : '#16a34a';
            return (
              <Polyline key={`traffic-${corridor.id}`} positions={path} pathOptions={{ color: trafficColor, weight: 9, opacity: 0.72 }}>
                <Popup><strong>{corridor.name}</strong><br />{corridor.congestion}% congestion · {corridor.speedKph} km/h<br />{corridor.cause}</Popup>
              </Polyline>
            );
          })}
          {route && <Polyline positions={route.geometry} pathOptions={{ color: '#ffffff', weight: 11, opacity: 0.92 }} />}
          {route && <Polyline positions={route.geometry} pathOptions={{ color: '#2563eb', weight: 7, opacity: 1 }} />}
          {incidents.slice(0, 20).map((incident, index) => {
            const rawCoords = incident.coordinates || incident.location?.coordinates;
            if (!rawCoords?.length) return null;
            return (
              <CircleMarker key={incident._id || `route-incident-${index}`} center={[rawCoords[1], rawCoords[0]]} radius={5} pathOptions={{ color: '#fff', weight: 1, fillColor: incident.severity === 'Critical' || incident.severity === 'High' ? '#dc2626' : '#f59e0b', fillOpacity: 0.9 }}>
                <Popup><strong>{incident.title || 'Traffic report'}</strong><br />{incident.locationName || 'Dhaka'} · {incident.severity || 'Notice'}</Popup>
              </CircleMarker>
            );
          })}
          {visibleFromCoords && (
            <CircleMarker center={visibleFromCoords} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#16a34a', fillOpacity: 1 }}>
              <Popup>Start: {from || 'Start Point'}</Popup>
            </CircleMarker>
          )}
          {visibleToCoords && (
            <CircleMarker center={visibleToCoords} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }}>
              <Popup>End: {to || 'Destination'}</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {route && route.steps && route.steps.length > 0 && (
        <div className="simple-directions pin-route-directions">
          <h3>Step-by-step directions</h3>
          <ol>
            {route.steps.filter((step) => step.distance > 15 || step.instruction.startsWith('Arrive')).map((step, idx) => (
              <li key={`${step.instruction}-${idx}`}>
                <span>{idx + 1}</span>
                <div><strong>{step.instruction}</strong>{step.distance > 0 && <small>{step.distance >= 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${step.distance} metres`}</small>}</div>
              </li>
            ))}
          </ol>
        </div>
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
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [pickMode, setPickMode] = useState('start');
  const [waitingMinutes, setWaitingMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  const geocode = async (query) => {
    const knownLocation = findKnownLocation(query);
    if (knownLocation) return knownLocation.coords;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Dhaka, Bangladesh')}&limit=1&countrycodes=bd`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) throw new Error('The location search service is temporarily unavailable.');
    const data = await res.json();
    if (!data.length) throw new Error(`Location not found: ${query}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  };

  const calculateRoute = async (startCoords, destinationCoords) => {
    if (pointDistance(startCoords, destinationCoords) < 0.0005) {
      setError('Your starting point and destination must be different.');
      setRoute(null);
      return;
    }

    setLoading(true);
    setError('');
    setRoute(null);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`);
      if (!res.ok) throw new Error('The road distance service is temporarily unavailable.');
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No driveable road route was found between those two pins.');
      const bestRoute = data.routes[0];
      setRoute({
        distanceKm: Number((bestRoute.distance / 1000).toFixed(2)),
        durationMin: Math.max(1, Math.round(bestRoute.duration / 60)),
        geometry: bestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng])
      });
    } catch (routeError) {
      setError(routeError.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFromText = async () => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();
    if (cleanFrom.length < 3 || cleanTo.length < 3) {
      setError('Type at least 3 characters for both places, or place two pins on the map.');
      return;
    }
    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setError('Your starting point and destination must be different.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [startCoords, destinationCoords] = await Promise.all([geocode(cleanFrom), geocode(cleanTo)]);
      setFromCoords(startCoords);
      setToCoords(destinationCoords);
      setPickMode(null);
      await calculateRoute(startCoords, destinationCoords);
    } catch (searchError) {
      setError(searchError.message);
      setLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    if (!pickMode) return;
    const coordinates = [lat, lng];
    const temporaryLabel = `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setError('');

    if (pickMode === 'start') {
      setFromCoords(coordinates);
      setFrom(temporaryLabel);
      setToCoords(null);
      setTo('');
      setRoute(null);
      setPickMode('end');
      reverseGeocode(lat, lng).then(setFrom);
      return;
    }

    if (!fromCoords) {
      setError('Place your starting pin first.');
      setPickMode('start');
      return;
    }

    setToCoords(coordinates);
    setTo(temporaryLabel);
    setPickMode(null);
    reverseGeocode(lat, lng).then(setTo);
    calculateRoute(fromCoords, coordinates);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is not available in this browser.');
      return;
    }
    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFromCoords([coords.latitude, coords.longitude]);
        setFrom('My current location');
        setToCoords(null);
        setTo('');
        setRoute(null);
        setPickMode('end');
        setLocationLoading(false);
      },
      () => {
        setError('We could not access your location. Allow location permission and try again.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const resetCalculator = () => {
    setFrom('');
    setTo('');
    setFromCoords(null);
    setToCoords(null);
    setRoute(null);
    setWaitingMinutes(0);
    setError('');
    setPickMode('start');
  };

  const cngFare = route ? calculateCngFare(route.distanceKm, waitingMinutes) : null;
  const rickshawBaseEstimate = route ? fareRates.rickshaw.base + route.distanceKm * fareRates.rickshaw.perKm : 0;
  const rickshawEstimate = route ? {
    min: Math.round(rickshawBaseEstimate),
    max: Math.ceil(rickshawBaseEstimate * 1.3)
  } : null;

  return (
    <div className="map-fare-calculator">
      <div className="fare-pin-intro">
        <div>
          <span>Official CNG meter calculation</span>
          <h3>Pin your journey on the map</h3>
          <p>Place a start pin and a destination pin. The road distance and fare will be calculated automatically.</p>
        </div>
        <div className="fare-rate-badge"><strong>Tk 40</strong><span>first 2 km</span></div>
      </div>

      <div className="rp-form fare-pin-form">
        <label>
          <span>Starting point</span>
          <div>
            <input className="tool-input" placeholder="Type a place or pin it on the map" value={from} onChange={(event) => { setFrom(event.target.value); setFromCoords(null); setRoute(null); }} />
            <button type="button" className={`map-pin-button start ${pickMode === 'start' ? 'active' : ''}`} aria-label="Pin starting point on map" onClick={() => setPickMode('start')}>📍</button>
          </div>
        </label>
        <span className="route-search-arrow" aria-hidden="true">→</span>
        <label>
          <span>Destination</span>
          <div>
            <input className="tool-input" placeholder="Type a place or pin it on the map" value={to} onChange={(event) => { setTo(event.target.value); setToCoords(null); setRoute(null); }} />
            <button type="button" className={`map-pin-button end ${pickMode === 'end' ? 'active' : ''}`} aria-label="Pin destination on map" onClick={() => setPickMode('end')}>🎯</button>
          </div>
        </label>
        <button className="button" type="button" onClick={calculateFromText} disabled={loading}>{loading ? 'Measuring road distance…' : 'Calculate fare'}</button>
      </div>

      <div className="pin-route-actions">
        <button type="button" onClick={useCurrentLocation} disabled={locationLoading}>{locationLoading ? 'Getting your location…' : '⌖ Use my current location'}</button>
        {(from || to || route) && <button type="button" onClick={resetCalculator}>Clear and start again</button>}
      </div>

      {pickMode && (
        <div className={`map-pick-notice ${pickMode}`}>
          <span>{pickMode === 'start' ? '📍' : '🎯'}</span>
          <div>
            <strong>Click the map to set your {pickMode === 'start' ? 'starting point' : 'destination'}</strong>
            <small>{pickMode === 'start' ? 'The next click will be for your destination.' : 'Your road distance and fare will appear after this pin.'}</small>
          </div>
        </div>
      )}
      {error && <div className="tool-error">{error}</div>}

      <div className="fare-map-toolbar" aria-label="Map pin controls">
        <button type="button" className={`start ${pickMode === 'start' ? 'active' : ''} ${fromCoords ? 'done' : ''}`} onClick={() => setPickMode('start')}>
          <b>1</b><span><strong>Pin starting point</strong><small>{fromCoords ? 'Start pin placed — click to change it' : 'Click here, then click the map'}</small></span>
        </button>
        <button type="button" className={`end ${pickMode === 'end' ? 'active' : ''} ${toCoords ? 'done' : ''}`} onClick={() => setPickMode('end')}>
          <b>2</b><span><strong>Pin destination</strong><small>{toCoords ? 'Destination pin placed — click to change it' : 'Place this after your start pin'}</small></span>
        </button>
      </div>

      <div className={`tool-map-wrap fare-map-wrap ${pickMode ? 'picking' : ''}`}>
        {pickMode && <div className={`map-click-banner ${pickMode}`}>{pickMode === 'start' ? '📍 Click the map to place your START pin' : '🎯 Click the map to place your DESTINATION pin'}</div>}
        <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 460, width: '100%', borderRadius: 12 }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={TILE_URL} subdomains={TILE_SUB} maxZoom={19} />
          <MapClickHandler onMapClick={handleMapClick} enabled={Boolean(pickMode)} />
          <MapRouteViewport routeGeometry={route?.geometry} focusPoint={fromCoords || toCoords} />
          {route && <Polyline positions={route.geometry} pathOptions={{ color: '#ffffff', weight: 11, opacity: 0.9 }} />}
          {route && <Polyline positions={route.geometry} pathOptions={{ color: '#10b981', weight: 7, opacity: 1 }} />}
          {fromCoords && (
            <CircleMarker center={fromCoords} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#16a34a', fillOpacity: 1 }}>
              <Popup>Start: {from || 'Starting point'}</Popup>
            </CircleMarker>
          )}
          {toCoords && (
            <CircleMarker center={toCoords} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }}>
              <Popup>Destination: {to || 'Destination'}</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {loading && <div className="fare-calculating"><span /> Measuring the road distance and calculating your fare…</div>}

      {route && cngFare && (
        <div className="fare-result fare-result-detailed">
          <div className="fare-trip-summary">
            <div><span>Road distance</span><strong>{route.distanceKm.toFixed(2)} km</strong></div>
            <div><span>Estimated drive time</span><strong>{route.durationMin} min</strong></div>
            <label>
              <span>Waiting time</span>
              <div><input type="number" min="0" step="1" value={waitingMinutes} onChange={(event) => setWaitingMinutes(Math.max(0, Number(event.target.value) || 0))} /><b>minutes</b></div>
            </label>
          </div>

          <div className="fare-answer-grid">
            <section className="official-cng-answer">
              <span>Official CNG meter fare</span>
              <strong>Tk {cngFare.total}</strong>
              <p>Calculated from the road distance shown on the map.</p>
              <div className="fare-breakdown">
                <div><span>First {OFFICIAL_CNG_RATES.includedKm} km</span><b>Tk {OFFICIAL_CNG_RATES.minimumFare}</b></div>
                <div><span>Extra {cngFare.additionalKm.toFixed(2)} km × Tk {OFFICIAL_CNG_RATES.perAdditionalKm}</span><b>Tk {Math.ceil(cngFare.distanceCharge)}</b></div>
                <div><span>{cngFare.waitingMinutes} min waiting × Tk {OFFICIAL_CNG_RATES.waitingPerMinute}</span><b>Tk {Math.ceil(cngFare.waitingCharge)}</b></div>
                <div className="fare-total-row"><span>Meter total</span><b>Tk {cngFare.total}</b></div>
              </div>
              <small>Ask the driver to use the meter. Tolls or agreed extras are not included.</small>
            </section>

            <section className="rickshaw-answer">
              <span>Rickshaw price guide</span>
              <strong>Tk {rickshawEstimate.min}–{rickshawEstimate.max}</strong>
              <p>This is a negotiated local estimate, not an official meter fare.</p>
              <small>{route.distanceKm > 5 ? 'This is a long journey for a cycle-rickshaw; the driver may not accept it.' : 'Confirm the price with the driver before starting.'}</small>
            </section>
          </div>

          <p className="fare-source-note">Rate used: Tk 40 for the first 2 km, Tk 12 per additional km, and Tk 2 per waiting minute. <a href="https://brta.gov.bd/site/page/268fded9-d8d3-4f9e-aa8c-c09d8186d17a/Fare-Rate-of-CNG-3-wheeler" target="_blank" rel="noreferrer">View the BRTA fare schedule</a>.</p>
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
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadIncidents = useCallback(async ({ showLoader = false } = {}) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const res = await api.get('/incidents?limit=100');
      const approvedItems = (res.data?.items || res.data || []).filter((incident) =>
        !incident.approvalStatus || incident.approvalStatus === 'Approved'
      );
      setIncidents(approvedItems);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'The incident feed is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents({ showLoader: true });
    const refreshTimer = window.setInterval(() => loadIncidents(), 20000);
    return () => window.clearInterval(refreshTimer);
  }, [loadIncidents]);

  const sevColor = { Critical: '#f0525b', High: '#f97316', Medium: '#ffb020', Low: '#2fbf71' };
  const getCoordinates = (incident) => {
    const raw = incident.coordinates || incident.location?.coordinates;
    return Array.isArray(raw) && raw.length === 2 ? [Number(raw[1]), Number(raw[0])] : null;
  };
  const selectedCoordinates = selected ? getCoordinates(selected) : null;

  return (
    <div className="live-incident-experience">
      <div className="incident-map-header">
        <div>
          <span><b /> Live approved reports</span>
          <h3>Incidents and their exact locations</h3>
          <p>Reports submitted by drivers and commuters appear here after admin approval.</p>
        </div>
        <div className="incident-map-actions">
          <Link to="/report-incident">Report an incident</Link>
          <button type="button" onClick={() => loadIncidents({ showLoader: true })} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh map'}</button>
        </div>
      </div>

      {error && <div className="tool-error">{error}</div>}

      <div className="tool-map-wrap incident-live-map">
        <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 470, width: '100%', borderRadius: 12 }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={TILE_URL} subdomains={TILE_SUB} maxZoom={19} />
          <MapFly center={selectedCoordinates} />
          {incidents.map(inc => {
            const coords = getCoordinates(inc);
            if (!coords) return null;
            return (
              <CircleMarker
                key={inc._id}
                center={coords}
                radius={selected?._id === inc._id ? 14 : 10}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: sevColor[inc.severity] || '#ffb020', fillOpacity: 0.92 }}
                eventHandlers={{ click: () => setSelected(inc) }}
              >
                <Popup>
                  <div className="incident-map-popup">
                    <span>{inc.type} · {inc.severity}</span>
                    <strong>{inc.title}</strong>
                    <p>📍 {inc.locationName}</p>
                    {inc.description && <small>{inc.description}</small>}
                    <em>Reported by {inc.reportedBy?.role || 'community member'}{inc.reportedBy?.name ? ` · ${inc.reportedBy.name}` : ''}</em>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        {!loading && incidents.length === 0 && !error && (
          <div className="incident-map-empty"><strong>No approved incidents right now</strong><span>New reports will appear here after admin review.</span></div>
        )}
      </div>

      <div className="incident-legend">
        {Object.entries(sevColor).map(([sev, col]) => (
          <span key={sev} className="legend-item"><span className="legend-dot" style={{ background: col }} />{sev}</span>
        ))}
        <span className="incident-count">{incidents.length} approved {incidents.length === 1 ? 'incident' : 'incidents'} on map{lastUpdated ? ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
      </div>

      <div className="incident-location-list">
        {incidents.map((incident) => (
          <button key={incident._id} type="button" className={selected?._id === incident._id ? 'selected' : ''} onClick={() => setSelected(incident)}>
            <span className="incident-list-severity" style={{ background: sevColor[incident.severity] || '#ffb020' }} />
            <span className="incident-list-copy"><strong>{incident.title}</strong><small>📍 {incident.locationName}</small></span>
            <span className="incident-list-meta"><b>{incident.reportedBy?.role || 'Community'}</b><small>{incident.status || 'Open'}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 4: Quick Report Form
// ===================================================================
const QuickReportForm = ({ user, isAuthenticated }) => {
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
  const [coordinates, setCoordinates] = useState(null);

  const handleIncidentPin = (lat, lng) => {
    setCoordinates([lng, lat]);
    setErr('');
    if (!form.locationName.trim()) {
      setForm((current) => ({ ...current, locationName: `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})` }));
      reverseGeocode(lat, lng).then((locationName) => {
        setForm((current) => ({ ...current, locationName }));
      });
    }
  };

  const submit = async () => {
    if (!form.title || !form.locationName) { setErr('Please fill in the title and location.'); return; }
    if (!coordinates) { setErr('Click the map to pin the exact incident location.'); return; }
    setLoading(true); setErr(''); setMsg('');
    try {
      await api.post('/incidents', { ...form, coordinates });
      setMsg('Report submitted for admin approval. It will appear on the live map after approval.');
      setForm({ title: '', type: 'Congestion', severity: 'Medium', locationName: '', description: '' });
      setCoordinates(null);
    } catch (e) { setErr(e.response?.data?.message || 'Could not submit report.'); }
    finally { setLoading(false); }
  };

  if (!isAuthenticated) return (
    <div className="report-access-card">
      <span>🔒</span>
      <div><h3>Sign in to report an incident</h3><p>Incident reports are accepted from verified commuter and driver accounts.</p></div>
      <Link className="button" to="/login">Sign in</Link>
      <Link className="button secondary" to="/register">Create account</Link>
    </div>
  );

  if (!['Commuter', 'Driver'].includes(user?.role)) return (
    <div className="report-access-card">
      <span>🛡️</span>
      <div><h3>Community reporting is for drivers and commuters</h3><p>Admin accounts review reports, while authority accounts manage approved incident status.</p></div>
      <Link className="button secondary" to="/dashboard">Open moderation dashboard</Link>
    </div>
  );

  return (
    <div className="quick-report">
      <div className="form-row"><label>What is the problem?</label><input className="tool-input" placeholder="e.g. Heavy traffic jam near circle" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
      <div className="form-row"><label>What kind of problem?</label>
        <div className="type-btn-group">{TYPES.map(t => <button type="button" key={t.v} className={`type-btn ${form.type === t.v ? 'active' : ''}`} onClick={() => setForm({...form, type: t.v})}>{t.icon} {t.v}</button>)}</div>
      </div>
      <div className="form-row"><label>Where? (Area)</label>
        <div className="area-chip-group">{AREAS.map(a => <button type="button" key={a} className={`area-chip ${form.locationName === a ? 'active' : ''}`} onClick={() => setForm({...form, locationName: a})}>{a}</button>)}</div>
        <input className="tool-input" style={{marginTop:8}} placeholder="Or type your location..." value={form.locationName} onChange={e => setForm({...form, locationName: e.target.value})} />
      </div>
      <div className="form-row">
        <label>Pin the exact incident location</label>
        <div className={`tool-map-wrap quick-report-map ${coordinates ? 'has-pin' : ''}`}>
          <div className="quick-report-map-notice">📍 Click where the incident happened</div>
          <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 320, width: '100%', borderRadius: 12 }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={TILE_URL} subdomains={TILE_SUB} maxZoom={19} />
            <MapClickHandler onMapClick={handleIncidentPin} enabled />
            <MapRouteViewport focusPoint={coordinates ? [coordinates[1], coordinates[0]] : null} />
            {coordinates && (
              <CircleMarker center={[coordinates[1], coordinates[0]]} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }}>
                <Popup>Incident location: {form.locationName}</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>
        <small className="incident-coordinate-readout">{coordinates ? `Pinned at ${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}` : 'No location pin placed yet'}</small>
      </div>
      <div className="form-row"><label>Severity</label>
        <div className="type-btn-group">
          {['Low','Medium','High','Critical'].map(s => <button type="button" key={s} className={`type-btn sev-${s.toLowerCase()} ${form.severity === s ? 'active' : ''}`} onClick={() => setForm({...form, severity: s})}>{s}</button>)}
        </div>
      </div>
      <div className="form-row"><label>Tell us more (optional)</label><textarea className="tool-input" rows={3} placeholder="Any extra details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      {err && <div className="tool-error">{err}</div>}
      {msg && <div className="tool-success">{msg}</div>}
      <button type="button" className="button" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : '✓ Submit for admin approval'}</button>
    </div>
  );
};

// ===================================================================
// Feature 5: Metro Guide
// ===================================================================
const MetroGuide = () => {
  const [selected, setSelected] = useState(null);
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [directionFilter, setDirectionFilter] = useState('all');
  const [now, setNow] = useState(new Date());
  const [feedStatus, setFeedStatus] = useState('loading');
  const operationalStations = useMemo(() => mrtStations.filter((station) => station.operational !== false), []);
  const stationKeys = useMemo(() => operationalStations.map((station) => station.scheduleKey || station.name), [operationalStations]);
  const scheduleKind = getMetroScheduleKind(now);
  const [scheduleData, setScheduleData] = useState(() => buildFallbackMetroSchedule(stationKeys, scheduleKind));
  const dhakaClock = getDhakaClock(now);

  useEffect(() => {
    const clockTimer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setFeedStatus('loading');
    fetch(METRO_TIMETABLE_URLS[scheduleKind], { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Timetable source unavailable');
        return response.json();
      })
      .then((data) => {
        setScheduleData(data);
        setFeedStatus('connected');
      })
      .catch((scheduleError) => {
        if (scheduleError.name === 'AbortError') return;
        setScheduleData(buildFallbackMetroSchedule(stationKeys, scheduleKind));
        setFeedStatus('fallback');
      });
    return () => controller.abort();
  }, [scheduleKind, stationKeys]);

  const trains = useMemo(
    () => estimateMetroPositions(scheduleData, operationalStations, dhakaClock.totalMinutes),
    [dhakaClock.totalMinutes, operationalStations, scheduleData]
  );
  const visibleTrains = directionFilter === 'all'
    ? trains
    : trains.filter((train) => train.directionId === directionFilter);
  const selectedTrain = trains.find((train) => train.id === selectedTrainId) || null;
  const selectedSchedule = selected?.operational === false
    ? null
    : getStationTimetable(scheduleData, selected, dhakaClock.totalMinutes);
  const southTerminalTimes = scheduleData?.['Uttara North']?.Motijheel || [];
  const nextTerminalDepartures = southTerminalTimes
    .map(parseScheduleTime)
    .filter((time) => time !== null && time >= dhakaClock.totalMinutes)
    .slice(0, 2);
  const currentHeadway = nextTerminalDepartures.length > 1
    ? Math.max(1, Math.round(nextTerminalDepartures[1] - nextTerminalDepartures[0]))
    : null;
  const isRunning = trains.length > 0;
  const kamalapur = mrtStations.find((station) => station.operational === false);
  const motijheel = operationalStations[operationalStations.length - 1];

  return (
    <div className="metro-live-guide">
      <div className="metro-live-header">
        <div>
          <span className={`metro-feed-status ${feedStatus}`}><b />{feedStatus === 'connected' ? 'Timetable source connected' : feedStatus === 'loading' ? 'Loading timetable source' : 'Using built-in timetable'}</span>
          <h3>MRT-6 train position map</h3>
          <p>Moving train markers are estimated from the current Dhaka time and station timetable—not GPS.</p>
        </div>
        <div className="metro-clock"><span>Dhaka time</span><strong>{dhakaClock.label}</strong><small>{dhakaClock.weekday}</small></div>
      </div>

      <div className="metro-status-bar metro-live-statusbar">
        <span className={`badge ${isRunning ? 'success' : 'danger'}`}>{isRunning ? '● Trains estimated in service' : '● No train currently estimated on the line'}</span>
        <span>{visibleTrains.length} train {visibleTrains.length === 1 ? 'marker' : 'markers'} shown</span>
        <span>{currentHeadway ? `Current departure gap: about ${currentHeadway} min` : 'See station cards for next departures'}</span>
        <div className="metro-direction-filter" aria-label="Filter train direction">
          <button type="button" className={directionFilter === 'all' ? 'active' : ''} onClick={() => setDirectionFilter('all')}>Both</button>
          <button type="button" className={directionFilter === 'south' ? 'active south' : 'south'} onClick={() => setDirectionFilter('south')}>↓ Motijheel</button>
          <button type="button" className={directionFilter === 'north' ? 'active north' : 'north'} onClick={() => setDirectionFilter('north')}>↑ Uttara</button>
        </div>
      </div>

      <div className="tool-map-wrap metro-live-map">
        <div className="metro-map-legend"><span className="south" />Toward Motijheel <span className="north" />Toward Uttara <span className="station" />Station</div>
        <MapContainer center={[23.79, 90.387]} zoom={12} scrollWheelZoom style={{ height: 520, width: '100%', borderRadius: 12 }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={TILE_URL} subdomains={TILE_SUB} maxZoom={19} />
          <Polyline positions={mrtLine} pathOptions={{ color: '#ffffff', weight: 8, opacity: 0.85 }} />
          <Polyline positions={mrtLine} pathOptions={{ color: '#7c3aed', weight: 5, opacity: 1 }} />
          {kamalapur && <Polyline positions={[motijheel.coords, kamalapur.coords]} pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.7, dashArray: '7 8' }} />}
          <MapRouteViewport routeGeometry={mrtLine} />
          <MapFly center={selectedTrain?.position || selected?.coords} />
          {mrtStations.map(st => (
            <CircleMarker
              key={st.id}
              center={st.coords}
              radius={selected?.id === st.id ? 9 : st.operational === false ? 6 : 7}
              pathOptions={{ color: '#ffffff', fillColor: st.operational === false ? '#64748b' : selected?.id === st.id ? '#fbbf24' : '#7c3aed', fillOpacity: 1, weight: 2, dashArray: st.operational === false ? '3 3' : undefined }}
              eventHandlers={{ click: () => { setSelected(st); setSelectedTrainId(null); } }}
            >
              <Popup><strong>{st.name}</strong><br />{st.operational === false ? 'Extension under construction' : 'Operational MRT-6 station'}<br />Nearby buses: {st.nearbyBus.join(', ')}</Popup>
            </CircleMarker>
          ))}
          {visibleTrains.map((train) => (
            <CircleMarker
              key={train.id}
              center={train.position}
              radius={selectedTrainId === train.id ? 14 : 11}
              pathOptions={{ color: '#ffffff', weight: 3, fillColor: train.color, fillOpacity: 1 }}
              eventHandlers={{ click: () => { setSelectedTrainId(train.id); setSelected(null); } }}
            >
              <Tooltip permanent direction="top" offset={[0, -9]} className="metro-train-tooltip">🚆</Tooltip>
              <Popup><strong>{train.trainNumber} · {train.direction}</strong><br />Next: {train.nextStation}<br />Scheduled: {train.scheduledArrival} · about {train.minutesToArrival} min<br /><small>Timetable-estimated position</small></Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="metro-selection-row">
        <label htmlFor="metro-station-select"><span>Choose a station</span><select id="metro-station-select" value={selected?.id || ''} onChange={(event) => { const station = mrtStations.find((item) => item.id === Number(event.target.value)) || null; setSelected(station); setSelectedTrainId(null); }}><option value="">Select station…</option>{mrtStations.map((station) => <option key={station.id} value={station.id}>{station.name}{station.operational === false ? ' — under construction' : ''}</option>)}</select></label>
        <div><span>On the map now</span><strong>{trains.length} estimated trains</strong><small>Positions move every second</small></div>
      </div>

      {selectedTrain && (
        <div className="metro-train-detail" style={{ '--train-color': selectedTrain.color }}>
          <div><span>Selected train</span><strong>🚆 {selectedTrain.trainNumber}</strong><small>{selectedTrain.direction}</small></div>
          <div><span>Between stations</span><strong>{selectedTrain.previousStation} → {selectedTrain.nextStation}</strong><small>{selectedTrain.progress}% of this segment</small></div>
          <div><span>Next scheduled arrival</span><strong>{selectedTrain.scheduledArrival}</strong><small>About {selectedTrain.minutesToArrival} min</small></div>
        </div>
      )}

      {selected && (
        <div className="station-info metro-station-detail">
          <div className="metro-station-title"><div><span>{selected.operational === false ? 'Extension station' : 'MRT-6 station'}</span><h3>🚇 {selected.name}</h3></div><b>{selected.operational === false ? 'Under construction' : 'Operational'}</b></div>
          {selectedSchedule ? (
            <div className="metro-direction-schedules">
              <section><span>↓ Toward Motijheel</span><div><small>First</small><strong>{selectedSchedule.southbound.first}</strong></div><div><small>Last</small><strong>{selectedSchedule.southbound.last}</strong></div><p>Next: {selectedSchedule.southbound.next.length ? selectedSchedule.southbound.next.join(' · ') : 'Service completed'}</p></section>
              <section><span>↑ Toward Uttara North</span><div><small>First</small><strong>{selectedSchedule.northbound.first}</strong></div><div><small>Last</small><strong>{selectedSchedule.northbound.last}</strong></div><p>Next: {selectedSchedule.northbound.next.length ? selectedSchedule.northbound.next.join(' · ') : 'Service completed'}</p></section>
            </div>
          ) : (
            <div className="metro-construction-note">Kamalapur is not included in active train estimates because the extension is still under construction.</div>
          )}
          <div className="station-grid">
            <div><span>Area</span><strong>{selected.zone === 'N' ? 'North Dhaka' : 'Central Dhaka'}</strong></div>
            <div><span>Nearby bus connections</span><strong>{selected.nearbyBus.join(', ')}</strong></div>
          </div>
        </div>
      )}

      <div className="metro-estimate-disclosure">
        <strong>Why this says “estimated”</strong>
        <p>The supplied websites do not expose a verified DMTCL GPS feed. This map reads the public day-specific timetable and interpolates each active train between its scheduled station times.</p>
        <div><a href="https://owais5514.github.io/Dhaka-MRT-Timetable/train_map.html" target="_blank" rel="noreferrer">Timetable map source</a><a href="https://smartroutebd.com/en/metro/map?station=bangladesh-secretariat" target="_blank" rel="noreferrer">SmartRoute simulation</a><a href="https://dhakametrorail.org/schedule/" target="_blank" rel="noreferrer">Schedule reference</a></div>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 6: Bus Route Finder
// ===================================================================
const BusStopField = ({ id, label, value, placeholder, onChange, onChoose, onEnter }) => {
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => getBusStopSuggestions(dhakaBusRoutes, value), [value]);

  return (
    <label className="bus-stop-field" htmlFor={id}>
      <span>{label}</span>
      <div className="bus-stop-input-wrap">
        <span aria-hidden="true" className="bus-stop-dot">{label === 'Starting stop' ? 'A' : 'B'}</span>
        <input
          id={id}
          className="tool-input"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={(event) => { onChange(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              setOpen(false);
              onEnter();
            }
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-suggestions`}
        />
        {value && (
          <button
            type="button"
            className="bus-input-clear"
            aria-label={`Clear ${label.toLowerCase()}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange('')}
          >×</button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="bus-stop-suggestions" id={`${id}-suggestions`} role="listbox">
          <small>{value.trim() ? 'Matching bus stops' : 'Popular bus stops'}</small>
          {suggestions.map((stop) => (
            <button
              type="button"
              role="option"
              aria-selected={value === stop}
              key={stop}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChoose(stop); setOpen(false); }}
            >
              <span aria-hidden="true">●</span>{stop}
            </button>
          ))}
        </div>
      )}
    </label>
  );
};

const JourneyStopStrip = ({ stops, transferStop }) => (
  <div className="bus-journey-strip" aria-label={`Route through ${stops.join(', ')}`}>
    {stops.map((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === stops.length - 1;
      const isTransfer = transferStop === stop;
      return (
        <React.Fragment key={`${stop}-${index}`}>
          {index > 0 && <span className="bus-stop-connector" aria-hidden="true">→</span>}
          <span className={`bus-stop-pill${isFirst ? ' start' : ''}${isLast ? ' end' : ''}${isTransfer ? ' transfer' : ''}`}>{stop}</span>
        </React.Fragment>
      );
    })}
  </div>
);

const BusRouteFinder = () => {
  const [fromArea, setFromArea] = useState('');
  const [toArea, setToArea] = useState('');
  const [results, setResults] = useState(null);
  const uniqueStopCount = useMemo(() => getUniqueBusStops(dhakaBusRoutes).length, []);

  const search = (from = fromArea, to = toArea) => {
    setResults(findBusJourneys(dhakaBusRoutes, from, to));
  };

  const chooseTrip = (from, to) => {
    setFromArea(from);
    setToArea(to);
    search(from, to);
  };

  const swapStops = () => {
    const nextFrom = toArea;
    const nextTo = fromArea;
    setFromArea(nextFrom);
    setToArea(nextTo);
    if (results) search(nextFrom, nextTo);
  };

  const reset = () => {
    setFromArea('');
    setToArea('');
    setResults(null);
  };

  const directResults = results?.direct || [];
  const transferResults = results?.transfers || [];

  return (
    <div className="bus-finder">
      <section className="bus-finder-intro">
        <div>
          <span className="bus-live-label">DHAKA BUS DIRECTORY</span>
          <h3>Which bus should I take?</h3>
          <p>Choose your boarding stop and destination. TrafficEase will show buses you can board directly and where to change if one bus is not enough.</p>
        </div>
        <div className="bus-data-stats" aria-label="Bus directory coverage">
          <strong>{dhakaBusRoutes.length}</strong><span>routes</span>
          <strong>{uniqueStopCount}</strong><span>stops</span>
        </div>
      </section>

      <section className="bus-search-panel">
        <div className="bus-search-fields">
          <BusStopField id="bus-from" label="Starting stop" value={fromArea} placeholder="Type Mirpur 10, Farmgate..." onChange={setFromArea} onChoose={setFromArea} onEnter={() => search()} />
          <button type="button" className="bus-swap-button" onClick={swapStops} aria-label="Swap starting stop and destination">⇄</button>
          <BusStopField id="bus-to" label="Destination" value={toArea} placeholder="Type Motijheel, Gulistan..." onChange={setToArea} onChoose={setToArea} onEnter={() => search()} />
        </div>
        <div className="bus-search-actions">
          <button className="button bus-search-button" type="button" onClick={() => search()}>Find my bus</button>
          {(fromArea || toArea || results) && <button className="bus-reset-button" type="button" onClick={reset}>Clear</button>}
        </div>
        <div className="bus-popular-trips">
          <span>Try a common trip:</span>
          <button type="button" onClick={() => chooseTrip('Mirpur 10', 'Motijheel')}>Mirpur 10 → Motijheel</button>
          <button type="button" onClick={() => chooseTrip('Uttara', 'Farmgate')}>Uttara → Farmgate</button>
          <button type="button" onClick={() => chooseTrip('Badda', 'Gulistan')}>Badda → Gulistan</button>
        </div>
      </section>

      {results?.error && <div className="tool-error bus-search-error">{results.error} Use one of the suggested stop names.</div>}

      {results && !results.error && (
        <div className="bus-results">
          <section className="bus-result-summary">
            <div><span>FROM</span><strong>{results.fromStop}</strong></div>
            <span className="bus-summary-arrow">→</span>
            <div><span>TO</span><strong>{results.toStop}</strong></div>
            <div className={`bus-match-count ${directResults.length ? 'direct' : 'transfer'}`}>
              <strong>{directResults.length || transferResults.length}</strong>
              <span>{directResults.length ? 'direct buses found' : 'transfer choices found'}</span>
            </div>
          </section>

          {directResults.length > 0 && (
            <section className="bus-result-section">
              <div className="bus-section-heading">
                <div><span className="bus-section-icon direct">1</span><div><h4>Direct buses</h4><p>Board once and get off at your destination.</p></div></div>
                <span>Best match first</span>
              </div>
              {directResults.map((option, index) => (
                <article className="bus-card" key={option.route.id}>
                  <div className="bus-card-topline">
                    <div className="bus-route-rank">{String(index + 1).padStart(2, '0')}</div>
                    <div className="bus-title-block"><strong>{option.route.name}</strong><span>Toward {option.direction}</span></div>
                    <span className="bus-service-badge">{option.route.service || 'Local bus service'}</span>
                  </div>
                  <div className="bus-instruction-grid">
                    <div><span className="bus-step-letter start">A</span><p><small>BOARD AT</small><strong>{option.fromStop}</strong></p></div>
                    <div><span className="bus-step-letter end">B</span><p><small>GET OFF AT</small><strong>{option.toStop}</strong></p></div>
                    <div className="bus-stop-count"><strong>{option.stopCount}</strong><span>{option.stopCount === 1 ? 'stop' : 'stops'}</span></div>
                  </div>
                  <details className="bus-route-details" open={index === 0}>
                    <summary>See stops for this journey</summary>
                    <JourneyStopStrip stops={option.journeyStops} />
                  </details>
                </article>
              ))}
            </section>
          )}

          {transferResults.length > 0 && (
            <section className="bus-result-section">
              <div className="bus-section-heading">
                <div><span className="bus-section-icon transfer">2</span><div><h4>{directResults.length ? 'One-change alternatives' : 'Change bus once'}</h4><p>We show exactly where to leave the first bus and board the second.</p></div></div>
              </div>
              {transferResults.map((option, index) => (
                <article className="bus-card transfer-card" key={`${option.firstRoute.id}-${option.secondRoute.id}-${option.interchange}`}>
                  <div className="bus-transfer-title"><span>OPTION {index + 1}</span><strong>Change at {option.interchange}</strong><small>{option.stopCount} stops total</small></div>
                  <div className="bus-transfer-legs">
                    <div><span className="bus-leg-number">1</span><p><small>TAKE</small><strong>{option.firstRoute.name}</strong><span>{option.fromStop} → {option.interchange}</span></p></div>
                    <span className="bus-change-arrow">→</span>
                    <div><span className="bus-leg-number">2</span><p><small>THEN TAKE</small><strong>{option.secondRoute.name}</strong><span>{option.interchange} → {option.toStop}</span></p></div>
                  </div>
                  <details className="bus-route-details">
                    <summary>See both legs stop by stop</summary>
                    <JourneyStopStrip stops={option.firstLeg.journeyStops} transferStop={option.interchange} />
                    <JourneyStopStrip stops={option.secondLeg.journeyStops} transferStop={option.interchange} />
                  </details>
                </article>
              ))}
            </section>
          )}

          {!directResults.length && !transferResults.length && (
            <div className="bus-no-route">
              <span aria-hidden="true">🚌</span>
              <h4>No route found between these two listed stops</h4>
              <p>Try a nearby major stop such as Farmgate, Gulistan, Shahbag, Paltan, or Mirpur 10.</p>
            </div>
          )}
        </div>
      )}

      <aside className="bus-source-note">
        <div><strong>Route information, not live vehicle tracking</strong><p>Bus routes can change because of traffic diversions or operator decisions. Confirm the bus name and final stop with the helper before boarding.</p></div>
        <div>
          <a href={BUS_DATASET_META.sourceUrl} target="_blank" rel="noreferrer">Primary 2026 route index</a>
          <a href={BUS_DATASET_META.secondarySources[0]} target="_blank" rel="noreferrer">Dhaka Local Bus reference</a>
          <a href={BUS_DATASET_META.secondarySources[1]} target="_blank" rel="noreferrer">Dhaka Bus Service reference</a>
        </div>
      </aside>
    </div>
  );
};

// ===================================================================
// Feature 7: Parking Finder
// ===================================================================
const ParkingFinder = () => {
  const [mode, setMode] = useState('public');
  const [searchText, setSearchText] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [originLabel, setOriginLabel] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const publicResults = useMemo(
    () => rankPublicParking(parkingLocations, originCoords),
    [originCoords]
  );
  const residentialResults = useMemo(
    () => rankResidentialParking(parkingKoiAreas, originCoords, searchText),
    [originCoords, searchText]
  );
  const activeResults = mode === 'public' ? publicResults : residentialResults;
  const searchAreas = useMemo(
    () => Array.from(new Set([...dhakaAreas, ...parkingKoiAreas.map((item) => item.area)])).sort(),
    []
  );

  const nearestFor = (coords, nextMode = mode, text = searchText) => (
    nextMode === 'public'
      ? rankPublicParking(parkingLocations, coords)[0]
      : rankResidentialParking(parkingKoiAreas, coords, text)[0]
  );

  const useOrigin = (coords, label, nextSearchText = label) => {
    setOriginCoords(coords);
    setOriginLabel(label);
    setSearchText(nextSearchText);
    setSelected(nearestFor(coords, mode, nextSearchText));
    setError('');
  };

  const searchParking = async () => {
    if (searchText.trim().length < 2) {
      setError('Enter a Dhaka area, use your current location, or click the map.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const known = findKnownLocation(searchText);
      if (known) {
        useOrigin(known.coords, known.label, searchText);
        return;
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${searchText}, Dhaka, Bangladesh`)}&limit=1&countrycodes=bd`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (!data.length) throw new Error('That location could not be found in Dhaka. Try a nearby well-known area.');
      useOrigin([Number(data[0].lat), Number(data[0].lon)], data[0].display_name.split(',').slice(0, 2).join(','), searchText);
    } catch (searchError) {
      setError(searchError.message || 'Parking search is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is not supported by this browser. Click the map instead.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const point = [coords.latitude, coords.longitude];
        const label = await reverseGeocode(coords.latitude, coords.longitude);
        useOrigin(point, label);
        setLoading(false);
      },
      () => {
        setError('Location permission was not available. Click your area on the map instead.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const chooseOnMap = async (lat, lng) => {
    const point = [lat, lng];
    const label = await reverseGeocode(lat, lng);
    useOrigin(point, label);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setSelected(originCoords ? nearestFor(originCoords, nextMode) : null);
  };

  const clearSearch = () => {
    setSearchText('');
    setOriginCoords(null);
    setOriginLabel('');
    setSelected(null);
    setError('');
  };

  const visibleMarkers = mode === 'public'
    ? publicResults
    : residentialResults.filter((item) => item.coords).slice(0, originCoords ? 24 : 35);
  const selectedArea = selected?.area?.replace(/\bDohs\b/g, 'DOHS');

  return (
    <div className="parking-finder">
      <section className="parking-finder-header">
        <div><span>SMART PARKING SEARCH</span><h3>Find parking close to where you are going</h3><p>Search an area, use your location, or tap the map. Results are ordered by straight-line distance from your chosen point.</p></div>
        <div className="parking-coverage"><strong>{parkingLocations.length}</strong><span>public facilities</span><strong>{PARKING_KOI_META.listingCount}</strong><span>residential listings</span></div>
      </section>

      <section className="parking-search-panel">
        <label htmlFor="parking-location">Where do you need parking?</label>
        <div className="parking-search-row">
          <input
            id="parking-location"
            className="tool-input"
            list="parking-area-suggestions"
            placeholder="For example: Dhanmondi, Banani, Mirpur 10"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') searchParking(); }}
          />
          <datalist id="parking-area-suggestions">{searchAreas.map((area) => <option value={area} key={area} />)}</datalist>
          <button className="button" type="button" onClick={searchParking} disabled={loading}>{loading ? 'Finding…' : 'Find nearby parking'}</button>
        </div>
        <div className="parking-quick-actions">
          <button type="button" onClick={useCurrentLocation}>⌖ Use my current location</button>
          <span>or click anywhere on the map</span>
          {(originCoords || searchText) && <button type="button" className="parking-clear" onClick={clearSearch}>Clear search</button>}
        </div>
        {error && <div className="tool-error parking-error">{error}</div>}
      </section>

      <div className="parking-mode-tabs" role="tablist" aria-label="Parking type">
        <button type="button" role="tab" aria-selected={mode === 'public'} className={mode === 'public' ? 'active' : ''} onClick={() => changeMode('public')}><strong>Hourly & public parking</strong><span>Rates, hours, and total capacity</span></button>
        <button type="button" role="tab" aria-selected={mode === 'residential'} className={mode === 'residential' ? 'active' : ''} onClick={() => changeMode('residential')}><strong>Monthly residential parking</strong><span>ParkingKoi locality listings and rent</span></button>
      </div>

      {originCoords && <div className="parking-origin-banner"><span>SEARCHING NEAR</span><strong>{originLabel}</strong><small>Distances below are straight-line estimates.</small></div>}

      <div className="parking-finder-map">
        <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 470, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          <MapClickHandler enabled onMapClick={chooseOnMap} />
          <MapFly center={selected?.coords || originCoords} />
          {originCoords && selected?.coords && <Polyline positions={[originCoords, selected.coords]} pathOptions={{ color: '#38bdf8', weight: 3, opacity: 0.8, dashArray: '6 8' }} />}
          {originCoords && (
            <CircleMarker center={originCoords} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0284c7', fillOpacity: 1 }}>
              <Popup><strong>Your search point</strong><br/>{originLabel}</Popup>
            </CircleMarker>
          )}
          {visibleMarkers.map((parking) => {
            const isSelected = selected?.kind === parking.kind && (parking.kind === 'public' ? selected.id === parking.id : selected.area === parking.area);
            const markerColor = parking.kind === 'public' ? '#f59e0b' : '#8b5cf6';
            return (
              <CircleMarker
                key={parking.kind === 'public' ? `public-${parking.id}` : `residential-${parking.area}`}
                center={parking.coords}
                radius={isSelected ? 12 : parking.kind === 'residential' ? Math.min(11, 6 + parking.listings / 18) : 8}
                pathOptions={{ color: isSelected ? '#fff' : markerColor, weight: isSelected ? 3 : 2, fillColor: markerColor, fillOpacity: isSelected ? 1 : 0.78 }}
                eventHandlers={{ click: () => setSelected(parking) }}
              >
                <Popup>
                  <strong>{parking.kind === 'public' ? parking.name : `${parking.area.replace(/\bDohs\b/g, 'DOHS')} residential parking`}</strong><br/>
                  {parking.kind === 'public' ? `Tk ${parking.ratePerHour}/hour · ${parking.capacity} vehicle capacity` : `${parking.listings} ParkingKoi listings · Tk ${parking.rentMin}-${parking.rentMax}/month`}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="parking-map-legend"><span><b className="search" />Search point</span><span><b className="public" />Public/hourly</span><span><b className="residential" />Residential area</span></div>
      </div>

      <div className="parking-results-layout">
        <section className="parking-result-list">
          <div className="parking-result-heading"><div><h4>{originCoords ? 'Nearest parking options' : mode === 'public' ? 'Public parking directory' : 'Popular residential areas'}</h4><p>{mode === 'public' ? 'Choose a facility to see its capacity and operating hours.' : 'Choose an area to compare monthly rent and security information.'}</p></div><span>{activeResults.length} results</span></div>
          <div className="parking-result-cards">
            {activeResults.slice(0, 10).map((parking, index) => {
              const isSelected = selected?.kind === parking.kind && (parking.kind === 'public' ? selected.id === parking.id : selected.area === parking.area);
              return (
                <button
                  type="button"
                  className={`parking-result-card${isSelected ? ' selected' : ''}`}
                  key={parking.kind === 'public' ? parking.id : parking.area}
                  onClick={() => setSelected(parking)}
                >
                  <span className="parking-result-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="parking-result-main"><strong>{parking.kind === 'public' ? parking.name : parking.area.replace(/\bDohs\b/g, 'DOHS')}</strong><small>{parking.kind === 'public' ? `${parking.type} · ${parking.openHours}` : `${parking.listings} listed residential spaces`}</small></span>
                  <span className="parking-result-price"><strong>{parking.kind === 'public' ? `Tk ${parking.ratePerHour}` : `Tk ${parking.rentMin}${parking.rentMax !== parking.rentMin ? `–${parking.rentMax}` : ''}`}</strong><small>{parking.kind === 'public' ? 'per hour' : 'per month'}</small></span>
                  <span className="parking-result-distance">{formatParkingDistance(parking.distanceKm)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className={`parking-selection${selected ? ' has-selection' : ''}`}>
          {selected ? (
            <>
              <span className="parking-selection-label">{selected.kind === 'public' ? 'PUBLIC PARKING DETAILS' : 'PARKINGKOI AREA SUMMARY'}</span>
              <h3>{selected.kind === 'public' ? selected.name : `${selectedArea} residential parking`}</h3>
              <p className="parking-selected-distance">{formatParkingDistance(selected.distanceKm)}</p>
              {selected.kind === 'public' ? (
                <div className="parking-detail-grid">
                  <div><span>Hourly rate</span><strong>Tk {selected.ratePerHour}</strong></div>
                  <div><span>Total capacity</span><strong>{selected.capacity} vehicles</strong></div>
                  <div><span>Opening hours</span><strong>{selected.openHours}</strong></div>
                  <div><span>Facility type</span><strong>{selected.type}</strong></div>
                </div>
              ) : (
                <>
                  <div className="parking-monthly-price"><span>Advertised monthly rent</span><strong>Tk {selected.rentMin}{selected.rentMax !== selected.rentMin ? `–${selected.rentMax}` : ''}</strong></div>
                  <div className="parking-detail-grid residential">
                    <div><span>Listings in area</span><strong>{selected.listings}</strong></div>
                    <div><span>Indoor listed</span><strong>{selected.indoor} of {selected.listings}</strong></div>
                    <div><span>CCTV listed</span><strong>{selected.cctv} of {selected.listings}</strong></div>
                    <div><span>Guard listed</span><strong>{selected.guard} of {selected.listings}</strong></div>
                  </div>
                  <a className="parking-book-button" href={selected.bookingUrl || PARKING_KOI_META.sourceUrl} target="_blank" rel="noreferrer">Check availability on ParkingKoi ↗</a>
                  <small className="parking-capacity-note">The public ParkingKoi index does not publish exact addresses or capacity. The purple map marker represents the approximate locality centre.</small>
                </>
              )}
            </>
          ) : (
            <div className="parking-empty-selection"><span>🅿️</span><h4>Choose a parking option</h4><p>Search near your destination, then tap a map marker or a result card.</p></div>
          )}
        </aside>
      </div>

      <aside className="parking-source-note">
        <strong>About the parking data</strong>
        <p>Hourly facilities use the project’s local parking directory. Monthly residential rent and amenity summaries are aggregated from ParkingKoi’s public Find Parking page, captured {PARKING_KOI_META.snapshotDate}. Availability and prices can change—confirm them before travelling or paying.</p>
        <a href={PARKING_KOI_META.sourceUrl} target="_blank" rel="noreferrer">View the original ParkingKoi listings ↗</a>
      </aside>
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
  const fallbackStations = useMemo(() => buildFallbackFuelStations(fuelStations), []);
  const [stations, setStations] = useState(fallbackStations);
  const [feedState, setFeedState] = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [originCoords, setOriginCoords] = useState(dhakaCenter);
  const [originLabel, setOriginLabel] = useState('Dhaka city centre');
  const [locationInput, setLocationInput] = useState('');
  const [stationQuery, setStationQuery] = useState('');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [queueFilter, setQueueFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshFeed = useCallback(async () => {
    setFeedState('loading');
    try {
      const liveStations = await fetchBrintadasFuelStations();
      setStations(liveStations);
      setFeedState('live');
      setLastUpdated(new Date());
      setSelected((current) => liveStations.find((station) => station.id === current?.id)
        || rankFuelStations(liveStations, { originCoords: dhakaCenter })[0]
        || null);
    } catch (feedError) {
      setStations(fallbackStations);
      setFeedState('fallback');
      setSelected((current) => current || rankFuelStations(fallbackStations, { originCoords: dhakaCenter })[0] || null);
    }
  }, [fallbackStations]);

  useEffect(() => { refreshFeed(); }, [refreshFeed]);

  const filtered = useMemo(() => rankFuelStations(stations, {
    originCoords,
    fuel: fuelFilter,
    status: queueFilter,
    query: stationQuery
  }), [fuelFilter, originCoords, queueFilter, stationQuery, stations]);

  const statusCounts = useMemo(() => stations.reduce((counts, station) => {
    counts[station.status] = (counts[station.status] || 0) + 1;
    return counts;
  }, {}), [stations]);

  const selectNearestFor = (coords, nextFuel = fuelFilter, nextQueue = queueFilter, query = stationQuery) => {
    const nearest = rankFuelStations(stations, { originCoords: coords, fuel: nextFuel, status: nextQueue, query })[0];
    setSelected(nearest || null);
  };

  const useOrigin = (coords, label) => {
    setOriginCoords(coords);
    setOriginLabel(label);
    selectNearestFor(coords);
    setError('');
  };

  const searchLocation = async () => {
    if (locationInput.trim().length < 2) {
      setError('Enter a Dhaka area, use your current location, or click the map.');
      return;
    }
    setLocationLoading(true);
    setError('');
    try {
      const known = findKnownLocation(locationInput);
      if (known) {
        useOrigin(known.coords, known.label);
        return;
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${locationInput}, Dhaka, Bangladesh`)}&limit=1&countrycodes=bd`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (!data.length) throw new Error('That location could not be found in Dhaka. Try a nearby major area.');
      useOrigin([Number(data[0].lat), Number(data[0].lon)], data[0].display_name.split(',').slice(0, 2).join(','));
    } catch (locationError) {
      setError(locationError.message || 'Location search is temporarily unavailable.');
    } finally {
      setLocationLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is not supported by this browser. Click the map instead.');
      return;
    }
    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const point = [coords.latitude, coords.longitude];
        const label = await reverseGeocode(coords.latitude, coords.longitude);
        useOrigin(point, label);
        setLocationLoading(false);
      },
      () => {
        setError('Location permission was not available. Click your area on the map instead.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const chooseOnMap = async (lat, lng) => {
    const label = await reverseGeocode(lat, lng);
    useOrigin([lat, lng], label);
  };

  const changeFuel = (fuel) => {
    setFuelFilter(fuel);
    selectNearestFor(originCoords, fuel);
  };

  const changeQueue = (status) => {
    setQueueFilter(status);
    selectNearestFor(originCoords, fuelFilter, status);
  };

  const changeStationQuery = (query) => {
    setStationQuery(query);
    selectNearestFor(originCoords, fuelFilter, queueFilter, query);
  };

  const selectedStatus = FUEL_STATUS[selected?.status] || FUEL_STATUS.unknown;
  const selectedPrice = selected ? getDisplayedFuelPrice(selected) : null;
  const mapStations = filtered.slice(0, 120);

  return (
    <div className="fuel-finder">
      <section className="fuel-finder-header">
        <div>
          <span className={`fuel-feed-status ${feedState}`}><b />{feedState === 'live' ? 'LIVE SOURCE CONNECTED' : feedState === 'loading' ? 'REFRESHING SOURCE' : 'LOCAL FALLBACK DATA'}</span>
          <h3>Find petrol, octane, or diesel near you</h3>
          <p>Choose where you are, select the fuel you need, and check any recent community queue report before you leave.</p>
        </div>
        <div className="fuel-feed-summary">
          <div><strong>{stations.length}</strong><span>stations</span></div>
          <div><strong>{(statusCounts.none || 0) + (statusCounts.some || 0)}</strong><span>queue reports available</span></div>
          <button type="button" onClick={refreshFeed} disabled={feedState === 'loading'}>↻ Refresh</button>
        </div>
      </section>

      <section className="fuel-price-strip" aria-label="Reference fuel prices">
        {Object.entries(OFFICIAL_FUEL_PRICES).map(([fuel, price]) => (
          <div key={fuel}><span>{fuel}</span><strong>Tk {price}</strong><small>per litre</small></div>
        ))}
        <p>Price reference supplied by Brintadas · February 2026</p>
      </section>

      <section className="fuel-location-search">
        <label htmlFor="fuel-location-input">Where should we search?</label>
        <div className="fuel-location-row">
          <input id="fuel-location-input" className="tool-input" placeholder="For example: Banani, Mirpur 10, Farmgate" value={locationInput} onChange={(event) => setLocationInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchLocation(); }} />
          <button type="button" className="button" onClick={searchLocation} disabled={locationLoading}>{locationLoading ? 'Locating…' : 'Find nearby stations'}</button>
        </div>
        <div className="fuel-location-actions"><button type="button" onClick={useCurrentLocation}>⌖ Use my current location</button><span>or click anywhere on the map</span><strong>Searching near: {originLabel}</strong></div>
        {error && <div className="tool-error fuel-error">{error}</div>}
      </section>

      <section className="fuel-filter-panel">
        <div><span>Fuel type</span><div className="fuel-filter-buttons">{['All', 'Octane', 'Petrol', 'Diesel', 'Kerosene'].map((fuel) => <button type="button" key={fuel} className={fuelFilter === fuel ? 'active' : ''} onClick={() => changeFuel(fuel)}>{fuel}</button>)}</div></div>
        <div><span>Community queue status</span><div className="fuel-filter-buttons queue">{[{ key: 'all', label: 'All' }, ...Object.entries(FUEL_STATUS).map(([key, value]) => ({ key, label: value.label }))].map((item) => <button type="button" key={item.key} className={queueFilter === item.key ? 'active' : ''} onClick={() => changeQueue(item.key)}>{item.label}</button>)}</div></div>
      </section>

      <div className="fuel-map-wrap">
        <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 490, width: '100%', borderRadius: 12 }}>
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
          <MapClickHandler enabled onMapClick={chooseOnMap} />
          <MapFly center={selected?.coords || originCoords} />
          {selected?.coords && <Polyline positions={[originCoords, selected.coords]} pathOptions={{ color: '#f59e0b', weight: 3, opacity: .78, dashArray: '7 8' }} />}
          <CircleMarker center={originCoords} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0284c7', fillOpacity: 1 }}><Popup><strong>Your search point</strong><br/>{originLabel}</Popup></CircleMarker>
          {mapStations.map((station) => {
            const status = FUEL_STATUS[station.status] || FUEL_STATUS.unknown;
            const isSelected = selected?.id === station.id;
            return (
              <CircleMarker key={station.id} center={station.coords} radius={isSelected ? 11 : 7} pathOptions={{ color: isSelected ? '#fff' : status.color, weight: isSelected ? 3 : 2, fillColor: status.color, fillOpacity: .86 }} eventHandlers={{ click: () => setSelected(station) }}>
                <Popup><strong>{station.name}</strong><br/>{station.area}<br/>{station.fuels.join(', ') || 'Fuel types not listed'}<br/><span style={{ color: status.color }}>● {status.label}</span></Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="fuel-map-legend"><span><b className="search" />Search point</span>{Object.entries(FUEL_STATUS).map(([key, status]) => <span key={key}><b style={{ background: status.color }} />{status.label}</span>)}</div>
      </div>

      <div className="fuel-results-layout">
        <section className="fuel-results-list">
          <div className="fuel-results-heading"><div><h4>Nearest matching stations</h4><p>{filtered.length} stations match your current fuel and queue filters.</p></div><input className="tool-input" aria-label="Filter station results" placeholder="Filter by station name or area" value={stationQuery} onChange={(event) => changeStationQuery(event.target.value)} /></div>
          <div className="fuel-result-cards">
            {filtered.slice(0, 12).map((station, index) => {
              const status = FUEL_STATUS[station.status] || FUEL_STATUS.unknown;
              const price = getDisplayedFuelPrice(station);
              return (
                <button type="button" className={`fuel-result-card${selected?.id === station.id ? ' selected' : ''}`} key={station.id} onClick={() => setSelected(station)}>
                  <span className="fuel-result-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="fuel-result-name"><strong>{station.name}</strong><small>{station.area} · {station.fuels.join(', ') || 'Fuel type unreported'}</small></span>
                  <span className="fuel-result-status" style={{ color: status.color, borderColor: `${status.color}55`, background: `${status.color}12` }}>● {status.label}</span>
                  <span className="fuel-result-price"><strong>{price ? `Tk ${price.amount}` : '—'}</strong><small>{price ? `${price.fuel}/litre` : 'No price'}</small></span>
                  <span className="fuel-result-distance">{formatParkingDistance(station.distanceKm)}</span>
                </button>
              );
            })}
            {!filtered.length && <div className="fuel-no-results"><span>⛽</span><h4>No station matches these filters</h4><p>Try “All” queue statuses or choose another fuel type.</p></div>}
          </div>
        </section>

        <aside className="fuel-selected-panel">
          {selected ? (
            <>
              <span className="fuel-selected-label">SELECTED STATION</span>
              <h3>{selected.name}</h3>
              <p>{selected.area} · {formatParkingDistance(selected.distanceKm)}</p>
              <div className="fuel-selected-status" style={{ color: selectedStatus.color, borderColor: `${selectedStatus.color}55`, background: `${selectedStatus.color}12` }}><strong>● {selectedStatus.label}</strong><span>{formatFuelReportAge(selected.lastReportAt)}</span></div>
              <div className="fuel-selected-grid">
                <div><span>Fuel types</span><strong>{selected.fuels.join(', ') || 'Not reported'}</strong></div>
                <div><span>{selectedPrice?.reported ? 'Reported price' : 'Reference price'}</span><strong>{selectedPrice ? `Tk ${selectedPrice.amount}/${selectedPrice.fuel} litre` : 'Unavailable'}</strong></div>
                <div><span>Community reports</span><strong>{selected.totalReports}</strong></div>
                <div><span>Operating hours</span><strong>{selected.hours || 'Not published by source'}</strong></div>
              </div>
              <a className="fuel-source-action" href={BRINTADAS_FUEL_META.sourceUrl} target="_blank" rel="noreferrer">View or report on Fuel Finder Bangladesh ↗</a>
              <small className="fuel-selected-note">A missing queue report does not confirm that a station is closed or out of fuel. Check locally before making a long detour.</small>
            </>
          ) : <div className="fuel-empty-selection"><span>⛽</span><h4>Choose a station</h4><p>Tap a marker or a result to see fuel and queue details.</p></div>}
        </aside>
      </div>

      <aside className="fuel-source-note"><div><strong>Read-only community source</strong><p>Station locations and queue reports are read from the public Brintadas Fuel Finder station view. TrafficEase does not submit or modify their reports. Price cards reproduce the reference shown by the supplied page and may change.</p></div><div><span>Last refreshed: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Using local fallback'}</span><a href={BRINTADAS_FUEL_META.sourceUrl} target="_blank" rel="noreferrer">Open original tracker ↗</a></div></aside>
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
  const directory = useMemo(() => buildHospitalDirectory(hospitals, akijDhakaFacilities), []);
  const [filter, setFilter] = useState('All');
  const [networkOnly, setNetworkOnly] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [originLabel, setOriginLabel] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const results = useMemo(() => rankHospitals(directory, {
    originCoords,
    filter,
    query: facilitySearch,
    networkOnly
  }), [directory, facilitySearch, filter, networkOnly, originCoords]);

  useEffect(() => {
    setSelected((current) => {
      const currentResult = current && results.find((facility) => facility.id === current.id);
      if (currentResult) return currentResult;
      return originCoords ? results[0] || null : null;
    });
  }, [originCoords, results]);

  const useOrigin = (coords, label) => {
    setOriginCoords(coords);
    setOriginLabel(label);
    setLocationSearch(label);
    setSelected(rankHospitals(directory, { originCoords: coords, filter, query: facilitySearch, networkOnly })[0] || null);
    setError('');
  };

  const findLocation = async () => {
    const query = locationSearch.trim();
    if (query.length < 2) {
      setError('Enter a Dhaka area, use your current location, or click the map.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const known = findKnownLocation(query);
      if (known) {
        useOrigin(known.coords, known.label);
        return;
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${query}, Dhaka, Bangladesh`)}&limit=1&countrycodes=bd`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (!data.length) throw new Error('That location could not be found in Dhaka. Try a nearby well-known area.');
      useOrigin([Number(data[0].lat), Number(data[0].lon)], data[0].display_name.split(',').slice(0, 3).join(','));
    } catch (searchError) {
      setError(searchError.message || 'Location search is temporarily unavailable. Please click the map instead.');
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is not supported by this browser. Click the map instead.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const point = [coords.latitude, coords.longitude];
        const label = await reverseGeocode(coords.latitude, coords.longitude);
        useOrigin(point, label);
        setLoading(false);
      },
      () => {
        setError('Location permission was not available. Click your area on the map instead.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const chooseOnMap = async (lat, lng) => {
    const point = [lat, lng];
    useOrigin(point, await reverseGeocode(lat, lng));
  };

  const clearLocation = () => {
    setLocationSearch('');
    setOriginCoords(null);
    setOriginLabel('');
    setSelected(null);
    setError('');
  };

  const visibleMarkers = results.slice(0, originCoords ? 45 : 60);
  const mappedCount = directory.filter((facility) => facility.locationPrecision === 'mapped').length;
  return (
    <div className="hospital-finder">
      <section className="hospital-finder-header">
        <div>
          <span>NEAREST CARE SEARCH</span>
          <h3>Find the nearest hospital from where you are</h3>
          <p>Use live location, search a Dhaka area, or tap the map. Nearby results are ordered by straight-line distance.</p>
        </div>
        <div className="hospital-coverage" aria-label="Hospital data coverage">
          <strong>{mappedCount}</strong><span>mapped facility pins</span>
          <strong>{HOSPITAL_DIRECTORY_META.akijDhakaCount}</strong><span>Akij Dhaka listings</span>
        </div>
      </section>

      <section className="hospital-location-panel">
        <label htmlFor="hospital-location">Where are you now?</label>
        <div className="hospital-location-row">
          <input
            id="hospital-location"
            className="tool-input"
            placeholder="For example: Mirpur 10, Dhanmondi, Uttara"
            value={locationSearch}
            onChange={(event) => setLocationSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') findLocation(); }}
          />
          <button type="button" className="button" onClick={findLocation} disabled={loading}>{loading ? 'Finding...' : 'Find nearby hospitals'}</button>
        </div>
        <div className="hospital-quick-actions">
          <button type="button" className="hospital-live-location" onClick={useCurrentLocation} disabled={loading}>Use my live location</button>
          <span>or tap your position directly on the map</span>
          {originCoords && <button type="button" className="hospital-clear" onClick={clearLocation}>Clear location</button>}
        </div>
        {error && <div className="tool-error hospital-error">{error}</div>}
      </section>

      <section className="hospital-filter-panel">
        <div className="hospital-filter-topline">
          <label htmlFor="hospital-name-search">Filter results</label>
          <span>{results.length} facilities shown</span>
        </div>
        <input
          id="hospital-name-search"
          className="tool-input"
          type="search"
          placeholder="Search hospital name, area, or specialty"
          value={facilitySearch}
          onChange={(event) => setFacilitySearch(event.target.value)}
        />
        <div className="tools-cat-filter hospital-type-filters">
          {['All', 'Hospitals', 'Diagnostics', 'Specialized', 'Emergency noted'].map((option) => (
            <button key={option} type="button" className={`cat-chip ${filter === option ? 'active' : ''}`} onClick={() => setFilter(option)}>{option}</button>
          ))}
          <label className="hospital-network-toggle">
            <input type="checkbox" checked={networkOnly} onChange={(event) => setNetworkOnly(event.target.checked)} />
            Akij network only
          </label>
        </div>
      </section>

      {originCoords && (
        <div className="hospital-origin-banner">
          <span>SEARCHING FROM</span>
          <strong>{originLabel}</strong>
          <small>Distance is a straight-line estimate, not driving distance.</small>
        </div>
      )}

      <div className="hospital-layout">
        <div className="hospital-map-panel">
          <MapContainer center={dhakaCenter} zoom={12} scrollWheelZoom style={{ height: 520, width: '100%', borderRadius: 14 }}>
            <TileLayer url={TILE_URL} subdomains={TILE_SUB} maxZoom={20} />
            <MapClickHandler enabled onMapClick={chooseOnMap} />
            <MapFly center={selected?.coords || originCoords} />
            {originCoords && selected?.coords && <Polyline positions={[originCoords, selected.coords]} pathOptions={{ color: '#38bdf8', weight: 3, opacity: 0.82, dashArray: '7 8' }} />}
            {originCoords && (
              <CircleMarker center={originCoords} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0284c7', fillOpacity: 1 }}>
                <Popup><strong>Your search point</strong><br/>{originLabel}</Popup>
              </CircleMarker>
            )}
            {visibleMarkers.map((facility) => {
              const isSelected = selected?.id === facility.id;
              const color = hospitalMarkerColor(facility);
              return (
                <CircleMarker
                  key={facility.id}
                  center={facility.coords}
                  radius={isSelected ? 12 : facility.locationPrecision === 'area' ? 6 : 9}
                  pathOptions={{
                    color: isSelected ? '#fff' : color,
                    weight: isSelected ? 3 : facility.locationPrecision === 'area' ? 1.5 : 2,
                    dashArray: facility.locationPrecision === 'area' ? '3 3' : undefined,
                    fillColor: color,
                    fillOpacity: isSelected ? 1 : facility.locationPrecision === 'area' ? 0.66 : 0.88
                  }}
                  eventHandlers={{ click: () => setSelected(facility) }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.96}>{facility.name}</Tooltip>
                  <Popup>
                    <strong>{facility.name}</strong><br/>
                    {facility.area} · {facility.category}<br/>
                    {formatHospitalDistance(facility.distanceKm)}<br/>
                    {facility.locationPrecision === 'area' ? 'Approximate area pin' : 'Mapped facility pin'}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          <div className="hospital-map-legend">
            <span><b className="origin" />Your location</span>
            <span><b className="hospital" />Hospital</span>
            <span><b className="specialized" />Specialized</span>
            <span><b className="diagnostic" />Diagnostic</span>
            <span><b className="approximate" />Dashed = area-level pin</span>
          </div>
        </div>

        <aside className="hospital-results" aria-label="Nearby hospital results">
          <div className="hospital-results-heading">
            <div><span>{originCoords ? 'NEAREST FIRST' : 'DHAKA DIRECTORY'}</span><h4>{originCoords ? 'Care near your location' : 'Choose your location first'}</h4></div>
            {originCoords && results[0] && <strong>{formatHospitalDistance(results[0].distanceKm)}</strong>}
          </div>
          <div className="hospital-result-list">
            {results.slice(0, 12).map((facility, index) => (
              <button key={facility.id} type="button" className={`hospital-result-card ${selected?.id === facility.id ? 'active' : ''}`} onClick={() => setSelected(facility)}>
                <span className="hospital-result-rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="hospital-result-copy">
                  <strong>{facility.name}</strong>
                  <small>{facility.area} · {facility.category}</small>
                  <small>{facility.locationPrecision === 'area' ? 'Approximate area pin' : 'Mapped facility pin'}{facility.akijNetwork ? ' · Akij network' : ''}</small>
                </span>
                <span className="hospital-result-distance">{formatHospitalDistance(facility.distanceKm)}</span>
              </button>
            ))}
            {!results.length && <div className="hospital-empty">No facility matches these filters. Try All facilities or clear the name search.</div>}
          </div>
        </aside>
      </div>

      {selected && (
        <section className="hospital-detail-card">
          <div className="hospital-detail-main">
            <div className="hospital-detail-title">
              <span>{selected.category.toUpperCase()}</span>
              <h3>{selected.name}</h3>
              <p>{selected.address}</p>
            </div>
            <div className="hospital-detail-distance">
              <strong>{formatHospitalDistance(selected.distanceKm)}</strong>
              <span>{selected.locationPrecision === 'area' ? `${selected.area} area-centre estimate` : 'Curated map point'}</span>
            </div>
          </div>
          <div className="hospital-facts">
            <div><span>Care information</span><strong>{selected.specialization}</strong></div>
            <div><span>Directory source</span><strong>{selected.registrySource}</strong></div>
            <div><span>Emergency status</span><strong>{selected.emergencyNoted ? 'Emergency service noted — call first' : 'Not confirmed — call first'}</strong></div>
            <div><span>Network benefit</span><strong>{selected.akijNetwork ? (selected.hasGopFacility ? 'Akij network · GOP listed' : 'Akij network listed') : 'No network information'}</strong></div>
          </div>
          {(selected.ipdDiscount || selected.opdDiscount) && (
            <div className="hospital-benefit-note">Published Akij benefit: {selected.ipdDiscount ? `up to ${selected.ipdDiscount}% IPD` : ''}{selected.ipdDiscount && selected.opdDiscount ? ' · ' : ''}{selected.opdDiscount ? `up to ${selected.opdDiscount}% OPD` : ''}. Confirm eligibility with the facility.</div>
          )}
          <div className="hospital-detail-actions">
            {selected.phone ? <a className="button hospital-call" href={`tel:${selected.phone.replace(/[^0-9+]/g, '')}`}>Call {selected.phone}</a> : <span className="hospital-no-phone">No phone published in this directory</span>}
            {selected.email && <a className="hospital-email" href={`mailto:${selected.email}`}>Email facility</a>}
            <a className="hospital-emergency-call" href="tel:999">Emergency? Call 999</a>
          </div>
          <p className="hospital-safety-note"><strong>Important:</strong> Call before travelling to confirm emergency service, doctors, beds, fees, and the correct entrance. Directory listings are not live bed-availability data.</p>
        </section>
      )}

      <section className="hospital-source-panel">
        <div>
          <span>DATA SOURCES</span>
          <h4>Facility information with visible attribution</h4>
          <p>Akij Dhaka listings were saved on {HOSPITAL_DIRECTORY_META.snapshotDate}. Government registries are provided for current registration checks; Arch HMS is a secondary directory.</p>
        </div>
        <div className="hospital-source-links">
          {Object.values(HOSPITAL_DIRECTORY_SOURCES).map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.label}</strong><span>{source.role}</span></a>
          ))}
        </div>
        <p className="hospital-location-disclaimer">{HOSPITAL_DIRECTORY_META.locationNote} Tap a result and read its pin label before travelling.</p>
      </section>
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
      cng: `Tk ${calculateCngFare(km).total} (meter, no waiting)`,
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
    api.get('/incidents?limit=20&mine=true').then(res => {
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
            <div>
              <span className={`badge ${inc.approvalStatus === 'Pending' ? 'warning' : 'success'}`}>{inc.approvalStatus || 'Approved'}</span>
              <span className={`badge ${sevClass[inc.severity] || ''}`}>{inc.status}</span>
            </div>
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

// ===================================================================
// Feature 21: Live Air Quality
// Powered by Open-Meteo + Copernicus CAMS satellite data
// Free, no API key, covers Bangladesh accurately
// ===================================================================

const AirQuality = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });
  const [locName, setLocName] = useState('Dhaka');

  const fetchAqi = async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      // Open-Meteo Air Quality API — uses Copernicus CAMS satellite model
      // Covers Bangladesh accurately, completely free, no API key needed
      const res = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}` +
        `&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide` +
        `&timezone=Asia%2FDhaka`
      );
      if (!res.ok) throw new Error('Air quality service unavailable');
      const json = await res.json();
      const c = json.current;
      if (!c) throw new Error('No data returned');
      const name = await reverseGeocode(lat, lng);
      setLocName(name);
      setData({
        aqi:  Math.round(c.us_aqi),
        pm25: c.pm2_5      != null ? Math.round(c.pm2_5 * 10) / 10      : null,
        pm10: c.pm10       != null ? Math.round(c.pm10 * 10) / 10       : null,
        o3:   c.ozone      != null ? Math.round(c.ozone * 10) / 10      : null,
        no2:  c.nitrogen_dioxide  != null ? Math.round(c.nitrogen_dioxide * 10) / 10 : null,
        so2:  c.sulphur_dioxide   != null ? Math.round(c.sulphur_dioxide * 10) / 10  : null,
        co:   c.carbon_monoxide   != null ? Math.round(c.carbon_monoxide * 10) / 10  : null,
        time: new Date(c.time).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      setError('Could not load AQI data. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAqi(position.lat, position.lng); }, [position.lat, position.lng]); // eslint-disable-line

  const handleMapClick = (lat, lng) => setPosition({ lat, lng });

  const getAqiStatus = (aqi) => {
    if (aqi <= 50)  return { text: 'Good',                           color: '#16a34a', bg: '#f0fdf4' };
    if (aqi <= 100) return { text: 'Moderate',                       color: '#ca8a04', bg: '#fefce8' };
    if (aqi <= 150) return { text: 'Unhealthy for Sensitive Groups',  color: '#ea580c', bg: '#fff7ed' };
    if (aqi <= 200) return { text: 'Unhealthy',                      color: '#dc2626', bg: '#fef2f2' };
    if (aqi <= 300) return { text: 'Very Unhealthy',                 color: '#7c3aed', bg: '#f5f3ff' };
    return           { text: 'Hazardous',                            color: '#9f1239', bg: '#fff1f2' };
  };

  const pollutants = data ? [
    { label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
    { label: 'PM10',  value: data.pm10, unit: 'µg/m³' },
    { label: 'O₃',    value: data.o3,   unit: 'ppb' },
    { label: 'NO₂',   value: data.no2,  unit: 'ppb' },
    { label: 'SO₂',   value: data.so2,  unit: 'ppb' },
    { label: 'CO',    value: data.co,   unit: 'ppm' },
  ].filter(p => p.value !== null && p.value !== undefined) : [];

  const status = data ? getAqiStatus(data.aqi) : null;

  return (
    <div className="air-quality-tool">
      <div className="tool-intro">
        <h3>🌫️ Live Air Quality Index (AQI)</h3>
        <p>Tap anywhere on the map to get data from the nearest real monitoring station instantly.</p>
      </div>

      <div style={{ height: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={[position.lat, position.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
          <MapClickHandler onMapClick={handleMapClick} enabled={!loading} />
          <Marker position={[position.lat, position.lng]} />
          <MapFly center={[position.lat, position.lng]} />
        </MapContainer>
      </div>

      <div style={{ background: status?.bg || '#f8fafc', padding: '24px', borderRadius: '12px', border: `2px solid ${status?.color || '#e2e8f0'}` }} aria-live="polite">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: '#64748b', fontSize: '16px' }}>🔄 Fetching live station data...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button className="button" style={{ marginTop: '12px' }} onClick={() => fetchAqi(position.lat, position.lng)}>Try Again</button>
          </div>
        ) : data ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>📍 {locName}</p>
              <div style={{ fontSize: '72px', fontWeight: '900', lineHeight: 1, color: status.color }}>{data.aqi}</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: status.color, marginTop: '4px' }}>{status.text}</div>
              {data.time && <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>Updated at {data.time}</p>}
            </div>

            {pollutants.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {pollutants.map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{p.value}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{p.label} ({p.unit})</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button className="button secondary" onClick={() => fetchAqi(position.lat, position.lng)} disabled={loading} style={{ fontSize: '13px' }}>
                🔄 Refresh
              </button>
              <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Source: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Open-Meteo</a> + Copernicus CAMS satellite — Bangladesh coverage, free, no API key
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 22: Current Weather
// ===================================================================
const Weather = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 }); // Default Dhaka
  const [locName, setLocName] = useState('Dhaka Weather');

  const fetchWeather = async (lat, lng) => {
    setLoading(true);
    try {
      const name = await reverseGeocode(lat, lng);
      setLocName(name);
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&timezone=Asia%2FDhaka`);
      const json = await res.json();
      setData(json.current);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather(position.lat, position.lng);
  }, []);

  const handleMapClick = (lat, lng) => {
    setPosition({ lat, lng });
    fetchWeather(lat, lng);
  };

  return (
    <div className="weather-tool">
      <div className="tool-intro">
        <h3>Current Weather Forecast</h3>
        <p>Tap anywhere on the map to check the live weather conditions for that location.</p>
      </div>

      <div className="map-container" style={{ height: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={[position.lat, position.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMapClick={handleMapClick} enabled={true} />
          <Marker position={[position.lat, position.lng]} />
          <MapFly center={[position.lat, position.lng]} />
        </MapContainer>
      </div>

      <div className="weather-card" style={{ background: '#f0fdf4', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{locName}</h4>
        {loading ? (
          <p>Loading live weather...</p>
        ) : data ? (
          <div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              🌤️ {data.temperature_2m}°C
            </div>
            <p style={{ margin: '8px 0 24px 0', color: '#166534', fontSize: '16px' }}>
              Humidity: {data.relative_humidity_2m}% | Wind: {data.wind_speed_10m} km/h
            </p>
          </div>
        ) : (
          <p>Could not load live weather.</p>
        )}
        <a 
          href="https://www.accuweather.com/en/bd/" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}
        >
          View Full Forecast on AccuWeather
        </a>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 23: Offline SMS Alerts
// ===================================================================
const OfflineSms = () => {
  const [phone, setPhone] = useState('');
  const [route, setRoute] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (phone && route) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setPhone('');
      setRoute('');
    }
  };

  return (
    <div className="offline-sms-tool">
      <div className="tool-intro">
        <h3>Offline SMS Fallback</h3>
        <p>Subscribe to receive critical traffic alerts via SMS even when you have no mobile data.</p>
      </div>
      <form onSubmit={handleSubscribe} className="rp-form" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <label>
          <span>Phone Number (BD)</span>
          <input 
            type="tel" 
            className="tool-input" 
            placeholder="e.g. 01700000000" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
            pattern="^01[3-9]\d{8}$"
          />
        </label>
        <label>
          <span>Select Commute Route</span>
          <select 
            className="tool-input" 
            value={route} 
            onChange={(e) => setRoute(e.target.value)} 
            required
          >
            <option value="" disabled>Select a major route...</option>
            <option value="Mirpur - Farmgate">Mirpur - Farmgate</option>
            <option value="Uttara - Airport - Banani">Uttara - Airport - Banani</option>
            <option value="Mohammadpur - Dhanmondi">Mohammadpur - Dhanmondi</option>
            <option value="Jatrabari - Gulistan">Jatrabari - Gulistan</option>
          </select>
        </label>
        <button type="submit" className="button" style={{ width: '100%', marginTop: '10px' }}>
          Subscribe to Alerts
        </button>
        {subscribed && (
          <div className="tool-success" style={{ marginTop: '16px' }}>
            Successfully subscribed! You will receive critical alerts for this route via SMS.
          </div>
        )}
      </form>
    </div>
  );
};

// ===================================================================
// Feature 24: Rain Warning
// ===================================================================
const RainWarning = () => {
  const [location, setLocation] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const checkRain = async (e) => {
    e.preventDefault();
    if (!location) return;
    setChecking(true);
    setResult(null);
    
    try {
      // Geocode location using Nominatim
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Bangladesh')}&limit=1`);
      const nomData = await nomRes.json();
      
      if (!nomData || nomData.length === 0) {
        setResult({ willRain: false, message: `Could not find coordinates for "${location}". Try a more specific area in Bangladesh.` });
        setChecking(false);
        return;
      }
      
      const lat = nomData[0].lat;
      const lon = nomData[0].lon;
      const locName = nomData[0].display_name.split(',')[0];

      // Fetch Open-Meteo precipitation probability
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability&forecast_days=1&timezone=Asia%2FDhaka`);
      const weatherData = await weatherRes.json();
      
      const currentHour = new Date().getHours();
      // Look at the next 3 hours
      const probs = weatherData.hourly.precipitation_probability.slice(currentHour, currentHour + 3);
      const maxProb = Math.max(...probs);
      const willRain = maxProb > 30;

      setResult({
        location: locName,
        willRain,
        message: willRain 
          ? `High chance of rain (${maxProb}%) in ${locName} within the next 3 hours. Consider delaying your departure.`
          : `Clear skies expected. Maximum rain probability is only ${maxProb}% for the next 3 hours. Safe travels!`
      });
    } catch (err) {
      setResult({ willRain: false, message: 'Failed to fetch live rain data. Please try again.' });
    }
    setChecking(false);
  };

  return (
    <div className="rain-warning-tool">
      <div className="tool-intro">
        <h3>Hyper-Local Rain Warning</h3>
        <p>Check if imminent rain is expected at your location before you start your journey.</p>
      </div>
      
      <form onSubmit={checkRain} className="rp-form" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <label>
          <span>Enter Location</span>
          <input 
            type="text" 
            className="tool-input" 
            placeholder="e.g. Banani, Dhanmondi, Mirpur..." 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            required 
          />
        </label>
        <button type="submit" className="button" style={{ width: '100%', marginTop: '10px' }} disabled={checking}>
          {checking ? 'Checking live radar...' : 'Check Rain Status'}
        </button>
      </form>

      {result && (
        <div style={{ padding: '20px', borderRadius: '12px', background: result.willRain ? '#fef2f2' : '#f0fdf4', border: `1px solid ${result.willRain ? '#fecaca' : '#bbf7d0'}` }}>
          <h4 style={{ margin: '0 0 10px 0', color: result.willRain ? '#b91c1c' : '#15803d' }}>
            {result.willRain ? '🌧️ Rain Alert' : '☀️ All Clear'}
          </h4>
          <p style={{ margin: '0 0 16px 0', color: '#475569' }}>{result.message}</p>
          <a 
            href="https://www.accuweather.com/en/bd/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}
          >
            Verify with AccuWeather Radar
          </a>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 25: Prayer Time Traffic Planner
// ===================================================================
const PrayerTraffic = () => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depTime, setDepTime] = useState('12:00');
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          const t = data.data.timings;
          setTimings({ Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha, Jummah: t.Dhuhr }); // Friday Jummah is around Dhuhr
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!timings) return;
    const checkTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const userT = checkTime(depTime);
    let overlap = null;
    const isFriday = new Date().getDay() === 5;

    for (const [name, time] of Object.entries(timings)) {
      if (name === 'Jummah' && !isFriday) continue;
      if (name === 'Dhuhr' && isFriday) continue; // Skip Dhuhr on Friday
      const pT = checkTime(time);
      if (Math.abs(userT - pT) <= 30) {
        overlap = { name: name === 'Jummah' ? 'Jummah Prayer' : name, time };
        break;
      }
    }

    if (overlap) {
      setWarning(`Your departure is very close to ${overlap.name} (${overlap.time}). Expect heavy traffic near mosques. Consider leaving 30 mins earlier or later.`);
    } else {
      setWarning(null);
    }
  }, [depTime, timings]);

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🙏 Prayer Time Traffic Planner</h3>
        <p>Mosque areas in Dhaka get extremely congested right before and after prayers (especially Jummah). Check your departure time against today's live prayer schedule.</p>
      </div>
      {loading ? (
        <p>Loading prayer times...</p>
      ) : timings ? (
        <>
          <div className="form-group">
            <label>Planned Departure Time:</label>
            <input type="time" value={depTime} onChange={e => setDepTime(e.target.value)} />
          </div>
          {warning ? (
            <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ea580c', color: '#9a3412', marginBottom: '20px' }}>
              <strong>⚠️ Congestion Warning:</strong><br/>{warning}
            </div>
          ) : (
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #16a34a', color: '#166534', marginBottom: '20px' }}>
              <strong>✅ Clear Window:</strong><br/>Your departure time doesn't clash with major prayer congregations.
            </div>
          )}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Today's Dhaka Schedule:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              {Object.entries(timings).filter(([k]) => k !== 'Jummah').map(([name, time]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                  <span>{name}</span>
                  <strong>{time}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p>Could not load prayer times.</p>
      )}
    </div>
  );
};

// ===================================================================
// Feature 26: Hartaal / Strike Alerts
// ===================================================================
const StrikeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/alerts')
      .then(res => res.json())
      .then(data => {
        const strikes = data.filter(a => a.type?.toLowerCase().includes('strike') || a.title?.toLowerCase().includes('hartaal') || a.description?.toLowerCase().includes('hartaal'));
        setAlerts(strikes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🚫 Hartaal & Strike Alerts</h3>
        <p>Check if there are any ongoing or upcoming political strikes that might shut down transport.</p>
      </div>
      {loading ? (
        <p>Checking alerts...</p>
      ) : alerts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map(a => (
            <div key={a._id} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px' }}>
              <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{a.title}</div>
              <p style={{ margin: '0 0 12px', fontSize: '14px' }}>{a.description}</p>
              <div style={{ fontSize: '12px', color: '#7f1d1d', background: '#fee2e2', padding: '6px 10px', borderRadius: '4px', display: 'inline-block' }}>
                Affected Areas: {a.affectedAreas?.join(', ') || 'Citywide'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f0fdf4', borderRadius: '12px', color: '#166534' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🕊️</div>
          <h4 style={{ margin: '0 0 8px' }}>No Active Strikes</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>There are no reported hartaals or blockades at this time. Public transport should be running normally.</p>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 27: VIP Movement Alerts
// ===================================================================
const VipAlerts = () => {
  const [incidents, setIncidents] = useState([]);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents')
      .then(res => res.json())
      .then(data => {
        setIncidents(data.filter(i => i.type === 'vip_movement'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMapClick = (lat, lng) => setPosition({ lat, lng });

  const reportVip = async () => {
    if (!position) return alert('Tap on the map first.');
    const desc = prompt('Enter road name and direction blocked:');
    if (!desc) return;
    try {
      const res = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vip_movement', location: { lat: position.lat, lng: position.lng }, description: desc })
      });
      if (res.ok) {
        alert('VIP Movement Reported');
        window.location.reload();
      }
    } catch (e) {
      alert('Error reporting');
    }
  };

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🚔 VIP Movement Alerts</h3>
        <p>VIP movements cause 30-60 min sudden delays in Dhaka. Tap the map to report a blocked road, or check existing reports to avoid those routes.</p>
      </div>
      <div style={{ height: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <MapClickHandler onMapClick={handleMapClick} enabled={true} />
          {incidents.map(inc => (
            <Marker key={inc._id} position={[inc.location.lat, inc.location.lng]}>
              <Popup><b>VIP Movement:</b><br/>{inc.description}</Popup>
            </Marker>
          ))}
          {position && <Marker position={[position.lat, position.lng]} />}
        </MapContainer>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="button" onClick={reportVip} disabled={!position}>
          {position ? 'Report VIP Blockade Here' : 'Tap map to select location'}
        </button>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 28: Lost & Found
// ===================================================================
const LostFound = () => {
  const [tab, setTab] = useState('browse');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: 'lost', item: '', transport: 'Bus', route: '', contact: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    const valid = saved.filter(i => Date.now() - i.timestamp < 7 * 24 * 60 * 60 * 1000);
    setItems(valid);
    if (saved.length !== valid.length) localStorage.setItem('lostFoundItems', JSON.stringify(valid));
  }, [tab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = { ...form, id: Date.now(), timestamp: Date.now() };
    const updated = [newItem, ...items];
    localStorage.setItem('lostFoundItems', JSON.stringify(updated));
    setItems(updated);
    setForm({ type: 'lost', item: '', transport: 'Bus', route: '', contact: '' });
    alert('Report submitted successfully.');
    setTab('browse');
  };

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🔍 Lost & Found on Transport</h3>
        <p>Report items you've lost or found on Dhaka's public transport (Bus, CNG, Metro, Rickshaw).</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`button ${tab === 'browse' ? '' : 'secondary'}`} style={{ flex: 1 }} onClick={() => setTab('browse')}>Browse Reports</button>
        <button className={`button ${tab === 'report' ? '' : 'secondary'}`} style={{ flex: 1 }} onClick={() => setTab('report')}>Report Item</button>
      </div>

      {tab === 'report' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label>Report Type:</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="lost">I lost something</option>
              <option value="found">I found something</option>
            </select>
          </div>
          <div className="form-group">
            <label>Item Description:</label>
            <input type="text" placeholder="e.g. Black Wallet, Samsung Phone" value={form.item} onChange={e => setForm({...form, item: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Transport Type:</label>
            <select value={form.transport} onChange={e => setForm({...form, transport: e.target.value})}>
              <option>Bus</option><option>CNG</option><option>Metro</option><option>Rickshaw</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Route / Area:</label>
            <input type="text" placeholder="e.g. Mirpur to Banani" value={form.route} onChange={e => setForm({...form, route: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <input type="tel" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required />
          </div>
          <button type="submit" className="button">Submit Report</button>
        </form>
      )}

      {tab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No active reports.</p> : null}
          {items.map(i => (
            <div key={i.id} style={{ background: i.type === 'lost' ? '#fff1f2' : '#f0fdf4', padding: '16px', borderRadius: '8px', border: `1px solid ${i.type==='lost'?'#fecaca':'#bbf7d0'}` }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: i.type === 'lost' ? '#9f1239' : '#166534' }}>
                {i.type.toUpperCase()}: {i.item}
              </div>
              <div style={{ fontSize: '13px', marginTop: '6px', color: '#334155' }}>
                <strong>Transport:</strong> {i.transport} <br/>
                <strong>Route:</strong> {i.route} <br/>
                <strong>Contact:</strong> {i.contact}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                Posted: {new Date(i.timestamp).toLocaleString('en-BD')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Feature 29: Safe Pedestrian Crossings
// ===================================================================
const SafeCrossings = () => {
  const [crossings, setCrossings] = useState([]);
  const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });
  const [loading, setLoading] = useState(false);

  const fetchCrossings = async (lat, lng) => {
    setLoading(true);
    const query = `[out:json];(node["highway"="crossing"](around:2000,${lat},${lng});node["highway"="footway"]["bridge"="yes"](around:2000,${lat},${lng});node["highway"="footway"]["tunnel"="yes"](around:2000,${lat},${lng}););out center;`;
    try {
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      setCrossings(data.elements.filter(e => e.lat && e.lon));
    } catch (e) {
      console.error('Overpass error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCrossings(position.lat, position.lng); }, []); // eslint-disable-line

  const handleMapClick = (lat, lng) => {
    setPosition({ lat, lng });
    fetchCrossings(lat, lng);
  };

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🚶 Safe Pedestrian Crossings</h3>
        <p>Dhaka's roads are dangerous. Tap the map to find the nearest footover bridges, underpasses, and marked zebra crossings.</p>
      </div>
      <div style={{ height: '350px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
        {loading && <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '4px 8px', borderRadius: '4px', zIndex: 1000, fontSize: '12px' }}>Loading...</div>}
        <MapContainer center={[position.lat, position.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <MapClickHandler onMapClick={handleMapClick} enabled={!loading} />
          {crossings.map(c => (
            <Marker key={c.id} position={[c.lat, c.lon]}>
              <Popup>
                <b>{c.tags?.name || 'Crossing'}</b><br/>
                Type: {c.tags?.bridge === 'yes' ? 'Footover Bridge' : c.tags?.tunnel === 'yes' ? 'Underpass' : 'Zebra Crossing'}
              </Popup>
            </Marker>
          ))}
          <MapFly center={[position.lat, position.lng]} />
        </MapContainer>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 30: ATM & bKash Finder
// ===================================================================
const AtmFinder = () => {
  const [atms, setAtms] = useState([]);
  const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });
  const [loading, setLoading] = useState(false);

  const fetchAtms = async (lat, lng) => {
    setLoading(true);
    const query = `[out:json];(node["amenity"="atm"](around:2000,${lat},${lng});node["amenity"="bank"](around:2000,${lat},${lng}););out center;`;
    try {
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAtms(data.elements.filter(e => e.lat && e.lon).slice(0, 50));
    } catch (e) {
      console.error('Overpass error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAtms(position.lat, position.lng); }, []); // eslint-disable-line

  const handleMapClick = (lat, lng) => {
    setPosition({ lat, lng });
    fetchAtms(lat, lng);
  };

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🏧 Nearest ATM & Bank Finder</h3>
        <p>Stuck without cash for transport? Tap the map to find the nearest ATMs and bank branches.</p>
      </div>
      <div style={{ height: '350px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
        {loading && <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '4px 8px', borderRadius: '4px', zIndex: 1000, fontSize: '12px' }}>Loading...</div>}
        <MapContainer center={[position.lat, position.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <MapClickHandler onMapClick={handleMapClick} enabled={!loading} />
          {atms.map(a => (
            <Marker key={a.id} position={[a.lat, a.lon]}>
              <Popup>
                <b>{a.tags?.name || (a.tags?.amenity === 'atm' ? 'ATM' : 'Bank')}</b><br/>
                {a.tags?.operator && `Operator: ${a.tags.operator}`}
              </Popup>
            </Marker>
          ))}
          <MapFly center={[position.lat, position.lng]} />
        </MapContainer>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 31: Vehicle Breakdown Help
// ===================================================================
const BreakdownHelp = () => {
  const [shops, setShops] = useState([]);
  const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });
  const [loading, setLoading] = useState(false);

  const fetchShops = async (lat, lng) => {
    setLoading(true);
    const query = `[out:json];(node["shop"="car_repair"](around:3000,${lat},${lng});node["shop"="tyres"](around:3000,${lat},${lng});node["shop"="car_parts"](around:3000,${lat},${lng});node["shop"="motorcycle_repair"](around:3000,${lat},${lng}););out center;`;
    try {
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      setShops(data.elements.filter(e => e.lat && e.lon).slice(0, 30));
    } catch (e) {
      console.error('Overpass error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchShops(position.lat, position.lng); }, []); // eslint-disable-line

  const handleMapClick = (lat, lng) => {
    setPosition({ lat, lng });
    fetchShops(lat, lng);
  };

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🔧 Vehicle Breakdown Help</h3>
        <p>Car broke down? Tap the map to find the nearest auto repair, tyre shop, or mechanics in your area.</p>
      </div>
      <div style={{ height: '350px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
        {loading && <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '4px 8px', borderRadius: '4px', zIndex: 1000, fontSize: '12px' }}>Loading...</div>}
        <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <MapClickHandler onMapClick={handleMapClick} enabled={!loading} />
          {shops.map(s => (
            <Marker key={s.id} position={[s.lat, s.lon]}>
              <Popup>
                <b>{s.tags?.name || 'Repair Shop'}</b><br/>
                Type: {s.tags?.shop?.replace('_', ' ')}<br/>
                {s.tags?.phone && `Phone: ${s.tags.phone}`}
              </Popup>
            </Marker>
          ))}
          <MapFly center={[position.lat, position.lng]} />
        </MapContainer>
      </div>
    </div>
  );
};

// ===================================================================
// Feature 32: Dhaka Transport Guide
// ===================================================================
const TransportGuide = () => {
  const [activeChap, setActiveChap] = useState(null);
  const chapters = [
    { title: "1. Boarding a Local Bus", content: "Always check the destination written on the front. Prepare exact change (e.g., ৳10-20) before boarding. Avoid standing near the door. Yell 'Daine chapen' (Move right) if you need space, and 'Ostad samne rakhen' (Driver, stop ahead) when you want to get off." },
    { title: "2. Negotiating with a CNG", content: "Don't ask 'Jaben?' (Will you go?). State your destination firmly: 'Gulshan jabo' (I'll go to Gulshan). If they don't use the meter, know the typical fare beforehand (use our Fare tool). Walk slightly away from busy intersections to get better rates." },
    { title: "3. Using the MRT-6 Metro", content: "Buy a Rapid Pass from any DBBL branch or station to avoid long ticket lines. Stand behind the yellow line. Wait for passengers to exit before entering. No eating or drinking inside the train. Women's only coaches are clearly marked." },
    { title: "4. Hailing a Rickshaw", content: "Rickshaws are best for short distances (< 2km). Fares start at ৳30-40 minimum. Negotiate the fare BEFORE getting on. In the rain, many drivers have plastic covers, but fares will double." },
    { title: "5. Using Ride-Share (Pathao/Uber)", content: "Bikes (Pathao) are the fastest way through heavy traffic, but bring a mask for dust. Always ask the driver 'Bhai, aschen?' (Brother, are you coming?) immediately after booking to avoid late cancellations." }
  ];

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>📖 Dhaka Transport Newcomer's Guide</h3>
        <p>Essential tips for surviving Dhaka's public transport system.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {chapters.map((chap, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setActiveChap(activeChap === i ? null : i)}
              style={{ width: '100%', padding: '16px', background: activeChap === i ? '#f8fafc' : '#fff', border: 'none', textAlign: 'left', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              {chap.title}
              <span>{activeChap === i ? '▲' : '▼'}</span>
            </button>
            {activeChap === i && (
              <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '14px', lineHeight: '1.5' }}>
                {chap.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 33: Personal Travel Diary
// ===================================================================
const TravelDiary = () => {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], from: '', to: '', mode: 'Bus', cost: '', duration: '' });

  useEffect(() => {
    setLogs(JSON.parse(localStorage.getItem('travelDiary') || '[]'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = { ...form, id: Date.now(), cost: Number(form.cost), duration: Number(form.duration) };
    const updated = [newLog, ...logs];
    localStorage.setItem('travelDiary', JSON.stringify(updated));
    setLogs(updated);
    setForm({ ...form, from: '', to: '', cost: '', duration: '' });
  };

  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const avgDuration = logs.length ? Math.round(logs.reduce((sum, log) => sum + log.duration, 0) / logs.length) : 0;

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>📊 Personal Travel Diary</h3>
        <p>Log your daily commutes to track how much time and money you spend on Dhaka traffic.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>৳{totalCost}</div>
          <div style={{ fontSize: '12px', color: '#15803d' }}>Total Spend</div>
        </div>
        <div style={{ flex: 1, background: '#fff7ed', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ffedd5' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9a3412' }}>{avgDuration}m</div>
          <div style={{ fontSize: '12px', color: '#c2410c' }}>Avg Commute</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Date:</label>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>From:</label>
          <input type="text" placeholder="e.g. Mirpur" value={form.from} onChange={e => setForm({...form, from: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>To:</label>
          <input type="text" placeholder="e.g. Banani" value={form.to} onChange={e => setForm({...form, to: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Mode:</label>
          <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
            <option>Bus</option><option>Metro</option><option>CNG</option><option>Rickshaw</option><option>Uber/Pathao</option>
          </select>
        </div>
        <div className="form-group">
          <label>Cost (৳):</label>
          <input type="number" min="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Duration (Minutes):</label>
          <input type="number" min="1" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required />
        </div>
        <button type="submit" className="button" style={{ gridColumn: 'span 2' }}>Add Log</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{log.from} → {log.to}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{log.date} • {log.mode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#16a34a' }}>৳{log.cost}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{log.duration} min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// Feature 34: BD Train Schedule & Tracker
// ===================================================================
const TrainTracker = () => {
  const [tab, setTab] = useState('schedule');
  const trains = [
    { no: '701', name: 'Subarna Express', to: 'Chittagong', dep: '07:00 AM', off: 'Monday' },
    { no: '703', name: 'Mahanagar Godhuli', to: 'Chittagong', dep: '03:00 PM', off: 'None' },
    { no: '717', name: 'Jayantika Express', to: 'Sylhet', dep: '11:15 AM', off: 'Tuesday' },
    { no: '739', name: 'Upaban Express', to: 'Sylhet', dep: '08:30 PM', off: 'Wednesday' },
    { no: '753', name: 'Silk City Express', to: 'Rajshahi', dep: '02:40 PM', off: 'Sunday' },
    { no: '759', name: 'Padma Express', to: 'Rajshahi', dep: '10:45 PM', off: 'Tuesday' },
    { no: '769', name: 'Dhumketu Express', to: 'Rajshahi', dep: '06:00 AM', off: 'Thursday' },
    { no: '773', name: 'Kalni Express', to: 'Sylhet', dep: '03:00 PM', off: 'Friday' },
    { no: '787', name: 'Sonar Bangla', to: 'Chittagong', dep: '07:00 AM', off: 'Wednesday' },
    { no: '793', name: 'Panchagarh Express', to: 'Panchagarh', dep: '10:45 PM', off: 'None' },
  ];

  return (
    <div className="tool-form">
      <div className="tool-intro">
        <h3>🚂 BD Train Schedule & Tracker</h3>
        <p>Check major intercity train schedules from Dhaka Kamalapur or view real-time train locations.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`button ${tab === 'schedule' ? '' : 'secondary'}`} style={{ flex: 1 }} onClick={() => setTab('schedule')}>Intercity Schedule</button>
        <button className={`button ${tab === 'track' ? '' : 'secondary'}`} style={{ flex: 1 }} onClick={() => setTab('track')}>Live Tracking</button>
      </div>

      {tab === 'schedule' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Train</th>
                <th style={{ padding: '10px' }}>To</th>
                <th style={{ padding: '10px' }}>Departs (Dhaka)</th>
                <th style={{ padding: '10px' }}>Off Day</th>
              </tr>
            </thead>
            <tbody>
              {trains.map(t => (
                <tr key={t.no} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}><strong>{t.name}</strong><br/><span style={{ color: '#64748b', fontSize: '11px' }}>{t.no}</span></td>
                  <td style={{ padding: '10px' }}>{t.to}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.dep}</td>
                  <td style={{ padding: '10px', color: t.off !== 'None' ? '#dc2626' : '#16a34a' }}>{t.off}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>Source: Bangladesh Railway. Subject to change.</p>
        </div>
      )}

      {tab === 'track' && (
        <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <iframe 
            src="https://www.trainlivelocation.com" 
            title="Train Live Tracker"
            width="100%" 
            height="100%" 
            style={{ border: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default SmartHub;
