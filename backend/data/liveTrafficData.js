const featureNames = [
  ['Live congestion index', 'Traffic'],
  ['Corridor speed monitor', 'Traffic'],
  ['Queue length estimator', 'Traffic'],
  ['Signal phase tracking', 'Signals'],
  ['Adaptive signal timing', 'Signals'],
  ['Signal failure alerts', 'Signals'],
  ['Incident reporting', 'Safety'],
  ['Incident verification queue', 'Safety'],
  ['Emergency vehicle priority', 'Safety'],
  ['School-zone safety mode', 'Safety'],
  ['Weather impact scoring', 'Environment'],
  ['Flood-prone road alerts', 'Environment'],
  ['Air quality mobility note', 'Environment'],
  ['Bus route status', 'Transit'],
  ['Metro connection status', 'Transit'],
  ['Transit delay prediction', 'Transit'],
  ['Crowding level monitor', 'Transit'],
  ['Parking availability', 'Parking'],
  ['Parking demand forecast', 'Parking'],
  ['Ride-share pickup zones', 'Mobility'],
  ['CNG stand availability', 'Mobility'],
  ['Pedestrian crossing load', 'Mobility'],
  ['Road work scheduling', 'Planning'],
  ['Event traffic plan', 'Planning'],
  ['Route recommendation', 'Navigation'],
  ['ETA comparison', 'Navigation'],
  ['Hotspot heat ranking', 'Analytics'],
  ['Authority dispatch board', 'Operations'],
  ['Public alert broadcast', 'Operations'],
  ['Audit-ready activity log', 'Operations']
];

const featureModules = featureNames.map(([name, group], index) => ({
  id: index + 1,
  name,
  group,
  status: index % 4 === 0 ? 'Ready' : 'Active'
}));

const baseState = {
  city: 'Dhaka',
  networkStatus: 'Busy roads',
  averageCongestion: 71,
  averageSpeed: 21,
  totalQueueMeters: 3760,
  corridors: [
    { id: 'mirpur-farmgate', name: 'Mirpur 10 to Farmgate', area: 'Mirpur Road', speedKph: 17, normalSpeedKph: 34, congestion: 82, travelTimeMin: 42, delayMin: 21, queueMeters: 950, signal: 'Adaptive hold', cause: 'Bus stoppage and office peak', recommendation: 'Use Rokeya Sarani for a partial bypass', trend: 'Rising' },
    { id: 'gulshan-banani', name: 'Gulshan 1 to Banani', area: 'Kemal Ataturk Avenue', speedKph: 24, normalSpeedKph: 38, congestion: 64, travelTimeMin: 26, delayMin: 10, queueMeters: 520, signal: 'Balanced', cause: 'High ride-share pickup demand', recommendation: 'Keep through traffic on the main lane', trend: 'Stable' },
    { id: 'shahbagh-motijheel', name: 'Shahbagh to Motijheel', area: 'Kazi Nazrul Islam Avenue', speedKph: 13, normalSpeedKph: 31, congestion: 91, travelTimeMin: 51, delayMin: 29, queueMeters: 1250, signal: 'Manual support', cause: 'Intersection spillback near Paltan', recommendation: 'Use the Kakrail alternate and allow extra time', trend: 'Rising' },
    { id: 'uttara-airport', name: 'Uttara to Airport', area: 'Airport Road', speedKph: 32, normalSpeedKph: 44, congestion: 45, travelTimeMin: 22, delayMin: 5, queueMeters: 260, signal: 'Normal', cause: 'Moderate airport approach load', recommendation: 'No diversion is needed', trend: 'Falling' },
    { id: 'jatrabari-gulistan', name: 'Jatrabari to Gulistan', area: 'Mayor Hanif Flyover approach', speedKph: 19, normalSpeedKph: 40, congestion: 74, travelTimeMin: 37, delayMin: 16, queueMeters: 780, signal: 'Adaptive split', cause: 'Mixed bus and goods vehicle flow', recommendation: 'Use the flyover merge carefully and allow extra time', trend: 'Stable' }
  ],
  signalPhases: [
    { intersection: 'Shahbagh', phase: 'North-South green', secondsLeft: 38, load: 88, mode: 'Manual support' },
    { intersection: 'Farmgate', phase: 'East-West green', secondsLeft: 24, load: 81, mode: 'Adaptive' },
    { intersection: 'Banani 11', phase: 'Pedestrian crossing', secondsLeft: 16, load: 57, mode: 'Balanced' }
  ],
  cameras: [
    { id: 'cam-01', location: 'Farmgate footbridge', status: 'Online', confidence: 94, finding: 'Heavy bus dwell time' },
    { id: 'cam-02', location: 'Shahbagh intersection', status: 'Online', confidence: 91, finding: 'Queue spillback detected' }
  ],
  transitStatus: [
    { route: 'Mirpur Link Bus', mode: 'Bus', headwayMin: 9, crowding: 82, delayMin: 11 },
    { route: 'MRT Connector', mode: 'Metro feeder', headwayMin: 7, crowding: 74, delayMin: 6 }
  ],
  dispatchQueue: [
    { priority: 'Critical', task: 'Clear spillback at Paltan', owner: 'Authority Unit A', etaMin: 8 },
    { priority: 'High', task: 'Adjust Farmgate signal cycle', owner: 'Signal Desk', etaMin: 3 }
  ],
  routeOptions: [
    { name: 'Fastest', path: 'Rokeya Sarani > Bijoy Sarani > Tejgaon', etaMin: 34, savedMin: 13, reliability: 78 },
    { name: 'Least congested', path: 'Begum Rokeya Ave > Agargaon > Farmgate', etaMin: 39, savedMin: 8, reliability: 84 }
  ],
  weatherImpact: {
    condition: 'Humid with light rain risk',
    visibility: 'Good',
    roadRisk: 'Moderate',
    floodRisk: 'Low',
    impactScore: 36
  }
};

const buildLiveTrafficState = () => ({
  ...baseState,
  generatedAt: new Date().toISOString(),
  featureModules
});

module.exports = { buildLiveTrafficState, featureModules };
