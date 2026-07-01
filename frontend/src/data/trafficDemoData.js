export const featureModules = [
  { id: 1, name: 'Live congestion index', group: 'Traffic', status: 'Active', description: 'Citywide congestion score with corridor breakdowns.' },
  { id: 2, name: 'Corridor speed monitor', group: 'Traffic', status: 'Active', description: 'Compare current and normal speeds on major roads.' },
  { id: 3, name: 'Queue length estimator', group: 'Traffic', status: 'Active', description: 'Estimate queue length near high-pressure intersections.' },
  { id: 4, name: 'Signal phase tracking', group: 'Signals', status: 'Active', description: 'Watch active signal phases and seconds remaining.' },
  { id: 5, name: 'Adaptive signal timing', group: 'Signals', status: 'Ready', description: 'Recommend cycle timing based on live road load.' },
  { id: 6, name: 'Signal failure alerts', group: 'Signals', status: 'Active', description: 'Flag faulty or manually controlled intersections.' },
  { id: 7, name: 'Incident reporting', group: 'Safety', status: 'Active', description: 'Report accident, roadwork, flooding, and congestion events.' },
  { id: 8, name: 'Incident verification queue', group: 'Safety', status: 'Ready', description: 'Prioritize commuter reports for authority review.' },
  { id: 9, name: 'Emergency vehicle priority', group: 'Safety', status: 'Active', description: 'Surface priority routes for ambulances and fire service.' },
  { id: 10, name: 'School-zone safety mode', group: 'Safety', status: 'Ready', description: 'Prepare reduced-speed plans for school entry windows.' },
  { id: 11, name: 'Weather impact scoring', group: 'Environment', status: 'Active', description: 'Estimate rain, visibility, and road-risk effects.' },
  { id: 12, name: 'Flood-prone road alerts', group: 'Environment', status: 'Ready', description: 'Warn drivers near waterlogged corridors.' },
  { id: 13, name: 'Air quality mobility note', group: 'Environment', status: 'Ready', description: 'Add health-aware guidance during poor air days.' },
  { id: 14, name: 'Bus route status', group: 'Transit', status: 'Active', description: 'Track public bus headway, delay, and crowding.' },
  { id: 15, name: 'Metro connection status', group: 'Transit', status: 'Ready', description: 'Show feeder links and station transfer status.' },
  { id: 16, name: 'Transit delay prediction', group: 'Transit', status: 'Active', description: 'Predict delays on busy public transport routes.' },
  { id: 17, name: 'Crowding level monitor', group: 'Transit', status: 'Active', description: 'Show passenger load pressure for major routes.' },
  { id: 18, name: 'Parking availability', group: 'Parking', status: 'Active', description: 'Track open spaces and parking status by lot.' },
  { id: 19, name: 'Parking demand forecast', group: 'Parking', status: 'Ready', description: 'Forecast short-term parking demand near hotspots.' },
  { id: 20, name: 'Ride-share pickup zones', group: 'Mobility', status: 'Ready', description: 'Manage pickup pressure near commercial zones.' },
  { id: 21, name: 'CNG stand availability', group: 'Mobility', status: 'Ready', description: 'Publish CNG queue and availability notes.' },
  { id: 22, name: 'Pedestrian crossing load', group: 'Mobility', status: 'Active', description: 'Monitor pedestrian pressure at crossings.' },
  { id: 23, name: 'Road work scheduling', group: 'Planning', status: 'Ready', description: 'Coordinate maintenance windows with traffic demand.' },
  { id: 24, name: 'Event traffic plan', group: 'Planning', status: 'Ready', description: 'Prepare routes and alerts for stadium or public events.' },
  { id: 25, name: 'Route recommendation', group: 'Navigation', status: 'Active', description: 'Suggest alternatives using delay and reliability.' },
  { id: 26, name: 'ETA comparison', group: 'Navigation', status: 'Active', description: 'Compare fastest, least congested, and transit-mix routes.' },
  { id: 27, name: 'Hotspot heat ranking', group: 'Analytics', status: 'Active', description: 'Rank critical corridors by congestion and incident load.' },
  { id: 28, name: 'Authority dispatch board', group: 'Operations', status: 'Active', description: 'Assign response tasks to authority and field teams.' },
  { id: 29, name: 'Public alert broadcast', group: 'Operations', status: 'Active', description: 'Publish active commuter alerts from authority desks.' },
  { id: 30, name: 'Audit-ready activity log', group: 'Operations', status: 'Ready', description: 'Keep operational decisions traceable for review.' }
];

export const demoLiveTraffic = {
  generatedAt: new Date().toISOString(),
  city: 'Dhaka',
  networkStatus: 'Severe congestion',
  averageCongestion: 71,
  averageSpeed: 21,
  totalQueueMeters: 3760,
  corridors: [
    { id: 'mirpur-farmgate', name: 'Mirpur 10 to Farmgate', area: 'Mirpur Road', speedKph: 17, normalSpeedKph: 34, congestion: 82, travelTimeMin: 42, delayMin: 21, queueMeters: 950, signal: 'Adaptive hold', cause: 'Bus stoppage and office peak', recommendation: 'Use Rokeya Sarani for partial bypass', trend: 'Rising' },
    { id: 'gulshan-banani', name: 'Gulshan 1 to Banani', area: 'Kemal Ataturk Avenue', speedKph: 24, normalSpeedKph: 38, congestion: 64, travelTimeMin: 26, delayMin: 10, queueMeters: 520, signal: 'Balanced', cause: 'High ride-share pickup demand', recommendation: 'Keep through traffic on main lane', trend: 'Stable' },
    { id: 'shahbagh-motijheel', name: 'Shahbagh to Motijheel', area: 'Kazi Nazrul Islam Avenue', speedKph: 13, normalSpeedKph: 31, congestion: 91, travelTimeMin: 51, delayMin: 29, queueMeters: 1250, signal: 'Manual support', cause: 'Intersection spillback near Paltan', recommendation: 'Dispatch traffic police at Kakrail', trend: 'Rising' },
    { id: 'uttara-airport', name: 'Uttara to Airport', area: 'Airport Road', speedKph: 32, normalSpeedKph: 44, congestion: 45, travelTimeMin: 22, delayMin: 5, queueMeters: 260, signal: 'Normal', cause: 'Moderate airport approach load', recommendation: 'No diversion needed', trend: 'Falling' },
    { id: 'jatrabari-gulistan', name: 'Jatrabari to Gulistan', area: 'Mayor Hanif Flyover approach', speedKph: 19, normalSpeedKph: 40, congestion: 74, travelTimeMin: 37, delayMin: 16, queueMeters: 780, signal: 'Adaptive split', cause: 'Mixed bus and goods vehicle flow', recommendation: 'Prioritize flyover merge control', trend: 'Stable' }
  ],
  signalPhases: [
    { intersection: 'Shahbagh', phase: 'North-South green', secondsLeft: 38, load: 88, mode: 'Manual support' },
    { intersection: 'Farmgate', phase: 'East-West green', secondsLeft: 24, load: 81, mode: 'Adaptive' },
    { intersection: 'Banani 11', phase: 'Pedestrian crossing', secondsLeft: 16, load: 57, mode: 'Balanced' },
    { intersection: 'Jatrabari', phase: 'Flyover merge', secondsLeft: 31, load: 76, mode: 'Adaptive' },
    { intersection: 'Airport', phase: 'Through traffic', secondsLeft: 44, load: 49, mode: 'Normal' },
    { intersection: 'Paltan', phase: 'North-South green', secondsLeft: 19, load: 92, mode: 'Manual support' }
  ],
  cameras: [
    { id: 'cam-01', location: 'Farmgate footbridge', status: 'Online', confidence: 94, finding: 'Heavy bus dwell time' },
    { id: 'cam-02', location: 'Shahbagh intersection', status: 'Online', confidence: 91, finding: 'Queue spillback detected' },
    { id: 'cam-03', location: 'Banani 11', status: 'Online', confidence: 87, finding: 'Ride-share pickup crowding' },
    { id: 'cam-04', location: 'Jatrabari approach', status: 'Degraded', confidence: 68, finding: 'Rain blur, manual review suggested' }
  ],
  transitStatus: [
    { route: 'Mirpur Link Bus', mode: 'Bus', headwayMin: 9, crowding: 82, delayMin: 11 },
    { route: 'Airport Express', mode: 'Bus', headwayMin: 13, crowding: 61, delayMin: 4 },
    { route: 'MRT Connector', mode: 'Metro feeder', headwayMin: 7, crowding: 74, delayMin: 6 },
    { route: 'Gulistan Circular', mode: 'Bus', headwayMin: 12, crowding: 89, delayMin: 14 }
  ],
  dispatchQueue: [
    { priority: 'Critical', task: 'Clear spillback at Paltan', owner: 'Authority Unit A', etaMin: 8 },
    { priority: 'High', task: 'Adjust Farmgate signal cycle', owner: 'Signal Desk', etaMin: 3 },
    { priority: 'High', task: 'Move bus stop enforcement to Shahbagh', owner: 'Field Unit C', etaMin: 12 },
    { priority: 'Medium', task: 'Review Banani pickup zone', owner: 'Mobility Desk', etaMin: 20 }
  ],
  routeOptions: [
    { name: 'Fastest', path: 'Rokeya Sarani > Bijoy Sarani > Tejgaon', etaMin: 34, savedMin: 13, reliability: 78 },
    { name: 'Least congested', path: 'Begum Rokeya Ave > Agargaon > Farmgate', etaMin: 39, savedMin: 8, reliability: 84 },
    { name: 'Transit mix', path: 'Bus to MRT feeder > Metro connector', etaMin: 43, savedMin: 6, reliability: 88 }
  ],
  weatherImpact: {
    condition: 'Humid with light rain risk',
    visibility: 'Good',
    roadRisk: 'Moderate',
    floodRisk: 'Low',
    impactScore: 36
  },
  featureModules
};

export const demoIncidents = [
  { _id: 'demo-1', title: 'Slow traffic', type: 'Congestion', severity: 'Medium', status: 'Open', locationName: 'Shahbagh', coordinates: [90.3951, 23.7382] },
  { _id: 'demo-2', title: 'Road work', type: 'Roadwork', severity: 'Low', status: 'Investigating', locationName: 'Banani', coordinates: [90.4003, 23.7937] },
  { _id: 'demo-3', title: 'Signal queue', type: 'Signal Failure', severity: 'High', status: 'Investigating', locationName: 'Paltan', coordinates: [90.4141, 23.7352] }
];
