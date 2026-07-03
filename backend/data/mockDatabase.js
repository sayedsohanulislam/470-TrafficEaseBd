const { buildLiveTrafficState } = require('./liveTrafficData');

// In-memory collections
let incidents = [
  {
    _id: 'mock-inc-1',
    title: 'Severe Waterlogging at Farmgate',
    type: 'Flooding',
    severity: 'Critical',
    status: 'Investigating',
    locationName: 'Farmgate Near Footbridge',
    location: { type: 'Point', coordinates: [90.3897, 23.7561] },
    coordinates: [90.3897, 23.7561],
    description: 'Monsoon rainfall has caused knee-deep water near Farmgate, causing heavy bus congestion.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    _id: 'mock-inc-2',
    title: 'Bus Breakdown on Kemal Ataturk Avenue',
    type: 'Congestion',
    severity: 'High',
    status: 'Open',
    locationName: 'Gulshan 2 to Banani Road',
    location: { type: 'Point', coordinates: [90.4003, 23.7937] },
    coordinates: [90.4003, 23.7937],
    description: 'Double-decker BRTC bus stalled near Gulshan 2 circle, blocking one major lane.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    _id: 'mock-inc-3',
    title: 'Signal Sync Failure at Shahbagh',
    type: 'Signal Failure',
    severity: 'Medium',
    status: 'Open',
    locationName: 'Shahbagh Circle',
    location: { type: 'Point', coordinates: [90.3951, 23.7382] },
    coordinates: [90.3951, 23.7382],
    description: 'Traffic lights are currently flashing yellow, manual police routing in place.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

let vehicles = [
  { _id: 'mock-veh-1', vehicleNumber: 'Dhaka Metro-GA-11-2034', type: 'Ambulance', status: 'Active', driverName: 'Abul Kalam', driverPhone: '01712345678', currentLocation: { type: 'Point', coordinates: [90.3897, 23.7561] } },
  { _id: 'mock-veh-2', vehicleNumber: 'Dhaka Metro-HA-14-9988', type: 'Police Patrol', status: 'Active', driverName: 'Inspector Rahman', driverPhone: '01812345678', currentLocation: { type: 'Point', coordinates: [90.4003, 23.7937] } },
  { _id: 'mock-veh-3', vehicleNumber: 'Dhaka Metro-BA-22-4411', type: 'Fire Truck', status: 'Standby', driverName: 'Imran Khan', driverPhone: '01912345678', currentLocation: { type: 'Point', coordinates: [90.3951, 23.7382] } }
];

let alerts = [
  { _id: 'mock-al-1', title: 'Severe Rain Alert', message: 'Heavy rainfall expected in Dhaka. Drive safe and avoid low-lying corridors.', area: 'Dhaka Metro Area', severity: 'Critical', active: true, createdAt: new Date().toISOString() },
  { _id: 'mock-al-2', title: 'Road Maintenance Work', message: 'Kakrail VIP Road closed for sewer work between 10 PM and 6 AM.', area: 'Kakrail', severity: 'Warning', active: true, createdAt: new Date().toISOString() }
];

let parking = [
  { _id: 'mock-pk-1', name: 'Banani Multiplex Parking', locationName: 'Kemal Ataturk Ave', totalSpaces: 200, availableSpaces: 45, status: 'Active' },
  { _id: 'mock-pk-2', name: 'Motijheel City Center Lot', locationName: 'Dilkusha C/A', totalSpaces: 400, availableSpaces: 120, status: 'Active' },
  { _id: 'mock-pk-3', name: 'Kawran Bazar Market Parking', locationName: 'Kawran Bazar', totalSpaces: 150, availableSpaces: 5, status: 'Active' }
];

let signals = [
  { _id: 'mock-sig-1', intersection: 'Shahbagh Circle', locationName: 'Kazi Nazrul Islam Avenue', currentPhase: 'North-South Green', secondsLeft: 38, mode: 'Manual support', status: 'Active' },
  { _id: 'mock-sig-2', intersection: 'Farmgate Crossing', locationName: 'Mirpur Road', currentPhase: 'East-West Green', secondsLeft: 24, mode: 'Adaptive', status: 'Active' },
  { _id: 'mock-sig-3', intersection: 'Banani Road 11', locationName: 'Banani', currentPhase: 'Pedestrian crossing', secondsLeft: 16, mode: 'Balanced', status: 'Active' }
];

let transit = [
  { _id: 'mock-tr-1', name: 'Mirpur Link 10', type: 'Bus', routeCode: 'ML-10', status: 'Active', headwayMinutes: 9, crowdingLevel: 'High' },
  { _id: 'mock-tr-2', name: 'Airport Express', type: 'Bus', routeCode: 'AE-01', status: 'Active', headwayMinutes: 13, crowdingLevel: 'Medium' },
  { _id: 'mock-tr-3', name: 'MRT Line 6 Feeder', type: 'Feeder', routeCode: 'MRT-F1', status: 'Active', headwayMinutes: 7, crowdingLevel: 'High' }
];

// Helper to get summaries
const getSummaryData = () => {
  return {
    incidents: incidents.filter(i => i.status !== 'Resolved').length,
    vehicles: vehicles.length,
    activeAlerts: alerts.filter(a => a.active).length,
    parkingSpaces: parking.reduce((sum, p) => sum + p.availableSpaces, 0),
    signals: signals.length,
    transitRoutes: transit.length
  };
};

module.exports = {
  incidents,
  vehicles,
  alerts,
  parking,
  signals,
  transit,
  getSummaryData,
  buildLiveTrafficState
};
