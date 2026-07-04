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
  { _id: 'mock-pk-1', name: 'Banani Multiplex Parking', address: 'Kemal Ataturk Ave', capacity: 200, availableSpaces: 45, status: 'Open', location: { type: 'Point', coordinates: [90.4003, 23.7937] } },
  { _id: 'mock-pk-2', name: 'Motijheel City Center Lot', address: 'Dilkusha C/A', capacity: 400, availableSpaces: 120, status: 'Open', location: { type: 'Point', coordinates: [90.4172, 23.7330] } },
  { _id: 'mock-pk-3', name: 'Kawran Bazar Market Parking', address: 'Kawran Bazar', capacity: 150, availableSpaces: 5, status: 'Open', location: { type: 'Point', coordinates: [90.3900, 23.7500] } }
];

let signals = [
  { _id: 'mock-sig-1', intersection: 'Shahbagh Circle', status: 'Manual', congestionLevel: 'High', cycleSeconds: 90, location: { type: 'Point', coordinates: [90.3951, 23.7382] } },
  { _id: 'mock-sig-2', intersection: 'Farmgate Crossing', status: 'Adaptive', congestionLevel: 'High', cycleSeconds: 120, location: { type: 'Point', coordinates: [90.3897, 23.7561] } },
  { _id: 'mock-sig-3', intersection: 'Banani Road 11', status: 'Normal', congestionLevel: 'Medium', cycleSeconds: 60, location: { type: 'Point', coordinates: [90.4003, 23.7937] } }
];

let transit = [
  { _id: 'mock-tr-1', name: 'Mirpur Link 10', mode: 'Bus', origin: 'Mirpur 10', destination: 'Motijheel', status: 'Active', headwayMinutes: 9, crowdingLevel: 'High' },
  { _id: 'mock-tr-2', name: 'Airport Express', mode: 'Bus', origin: 'Uttara', destination: 'Gulistan', status: 'Active', headwayMinutes: 13, crowdingLevel: 'Medium' },
  { _id: 'mock-tr-3', name: 'MRT Line 6 Feeder', mode: 'Metro', origin: 'Uttara North', destination: 'Motijheel', status: 'Active', headwayMinutes: 7, crowdingLevel: 'High' }
];

let users = [
  { _id: 'mock-user-1', name: 'Sayed Sohanul Islam', email: 'sohan@trafficease.com', phone: '01711122233', role: 'Authority', password: '$2a$10$U52k8sH07klyK5d35aXj0u7tA8e8uD3N5H.y1N.F1pL/t.b6x8g2q' } // password123 (hashed)
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
  users,
  getSummaryData,
  buildLiveTrafficState
};
