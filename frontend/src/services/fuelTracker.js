import { POPULAR_DHAKA_LOCATIONS, straightLineDistanceKm } from './routePlanner';

const SOURCE_API_URL = 'https://vnkkajjadkdlqglvepxr.supabase.co/rest/v1/station_status?select=*&order=name.asc';
// This public anonymous key is exposed by the supplied reference page for client-side reads.
const SOURCE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua2thamphZGtkbHFnbHZlcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTY1MDksImV4cCI6MjA5MTQzMjUwOX0.Zumu1gwvOr7LThhoCZghKJGOB2SWU4ZzkTiko8ZP50g';
const PETROLEUM_FUELS = ['Octane', 'Petrol', 'Diesel', 'Kerosene'];

export const BRINTADAS_FUEL_META = {
  sourceName: 'Fuel Finder Bangladesh by Brintadas',
  sourceUrl: 'https://brintadas.com/fuel-tracker.html'
};

export const OFFICIAL_FUEL_PRICES = {
  Octane: 120,
  Petrol: 116,
  Diesel: 100,
  Kerosene: 112
};

export const FUEL_STATUS = {
  none: { label: 'No queue', color: '#22c55e' },
  some: { label: 'Short queue', color: '#eab308' },
  long: { label: 'Long queue', color: '#f97316' },
  empty: { label: 'No fuel', color: '#dc2626' },
  unknown: { label: 'No recent update', color: '#64748b' }
};

export const cleanFuelStationName = (name = '') => {
  const english = String(name)
    .replace(/[\u0980-\u09ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s,–—-]+$/g, '')
    .trim();
  return english || 'Fuel station';
};

const closestKnownArea = (coords) => POPULAR_DHAKA_LOCATIONS
  .map((location) => ({ ...location, distance: straightLineDistanceKm(coords, location.coords) }))
  .sort((left, right) => left.distance - right.distance)[0]?.label || 'Dhaka';

export const normalizeFuelStation = (station) => {
  const lat = Number(station.lat);
  const lng = Number(station.lng);
  const coords = [lat, lng];
  const fuels = (station.fuels || []).filter((fuel) => PETROLEUM_FUELS.includes(fuel));
  const sourceArea = String(station.area || '').trim();
  const status = FUEL_STATUS[station.status] ? station.status : 'unknown';
  return {
    id: station.id,
    name: cleanFuelStationName(station.name),
    area: !sourceArea || sourceArea.toLowerCase() === 'dhaka' ? closestKnownArea(coords) : sourceArea,
    coords,
    fuels,
    status,
    reportedPrice: Number(station.price) || null,
    reportedFuelType: station.fuel_type || null,
    lastReportAt: station.last_report_at || null,
    totalReports: Number(station.total_reports) || 0,
    source: 'brintadas'
  };
};

export const fetchBrintadasFuelStations = async () => {
  const response = await fetch(SOURCE_API_URL, {
    headers: {
      apikey: SOURCE_ANON_KEY,
      Authorization: `Bearer ${SOURCE_ANON_KEY}`
    }
  });
  if (!response.ok) throw new Error('The live fuel directory could not be reached.');
  const data = await response.json();
  return data
    .filter((station) => {
      const fuels = station.fuels || [];
      return fuels.length === 0 || fuels.some((fuel) => PETROLEUM_FUELS.includes(fuel));
    })
    .filter((station) => Number.isFinite(Number(station.lat)) && Number.isFinite(Number(station.lng)))
    .map(normalizeFuelStation);
};

export const buildFallbackFuelStations = (stations) => stations.map((station) => ({
  id: `fallback-${station.id}`,
  name: station.name,
  area: station.area,
  coords: station.coords,
  fuels: station.types.filter((fuel) => PETROLEUM_FUELS.includes(fuel)),
  status: 'unknown',
  reportedPrice: null,
  reportedFuelType: null,
  lastReportAt: null,
  totalReports: 0,
  hours: station.hours,
  source: 'local'
}));

export const rankFuelStations = (stations, options = {}) => {
  const { originCoords, fuel = 'All', status = 'all', query = '' } = options;
  const normalizedQuery = query.trim().toLowerCase();
  return stations
    .filter((station) => fuel === 'All' || station.fuels.includes(fuel))
    .filter((station) => status === 'all' || station.status === status)
    .filter((station) => !normalizedQuery || `${station.name} ${station.area}`.toLowerCase().includes(normalizedQuery))
    .map((station) => ({
      ...station,
      distanceKm: originCoords ? straightLineDistanceKm(originCoords, station.coords) : null
    }))
    .sort((left, right) => {
      if (left.distanceKm !== null && right.distanceKm !== null) return left.distanceKm - right.distanceKm;
      return left.name.localeCompare(right.name);
    });
};

export const getDisplayedFuelPrice = (station) => {
  if (station.reportedPrice) return { amount: station.reportedPrice, fuel: station.reportedFuelType || station.fuels[0], reported: true };
  const fuel = ['Octane', 'Petrol', 'Diesel', 'Kerosene'].find((type) => station.fuels.includes(type));
  return fuel ? { amount: OFFICIAL_FUEL_PRICES[fuel], fuel, reported: false } : null;
};

export const formatFuelReportAge = (timestamp, now = Date.now()) => {
  if (!timestamp) return 'No community report yet';
  const difference = Math.max(0, now - new Date(timestamp).getTime());
  const minutes = Math.floor(difference / 60000);
  if (minutes < 1) return 'Reported just now';
  if (minutes < 60) return `Reported ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Reported ${hours} hr ago`;
  return `Reported ${Math.floor(hours / 24)} days ago`;
};

