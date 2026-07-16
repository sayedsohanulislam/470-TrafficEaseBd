export const POPULAR_DHAKA_LOCATIONS = [
  { label: 'Mirpur 10', aliases: ['mirpur 10', 'mirpur ten'], coords: [23.8069, 90.3687] },
  { label: 'Mirpur 1', aliases: ['mirpur 1', 'mirpur one'], coords: [23.7985, 90.3539] },
  { label: 'Mirpur 11', aliases: ['mirpur 11'], coords: [23.8269, 90.3657] },
  { label: 'Motijheel', aliases: ['motijheel', 'shapla chattar'], coords: [23.7257, 90.4188] },
  { label: 'Farmgate', aliases: ['farmgate'], coords: [23.7562, 90.3896] },
  { label: 'Dhanmondi 27', aliases: ['dhanmondi 27', 'dhanmondi'], coords: [23.7462, 90.3765] },
  { label: 'Gulshan 2', aliases: ['gulshan 2', 'gulshan two'], coords: [23.7925, 90.4140] },
  { label: 'Gulshan 1', aliases: ['gulshan 1', 'gulshan one', 'gulshan'], coords: [23.7808, 90.4168] },
  { label: 'Banani', aliases: ['banani', 'kakoli'], coords: [23.7934, 90.4045] },
  { label: 'Uttara', aliases: ['uttara', 'uttara sector 7'], coords: [23.8672, 90.3885] },
  { label: 'Dhaka Airport', aliases: ['dhaka airport', 'airport', 'hazrat shahjalal airport'], coords: [23.8513, 90.4089] },
  { label: 'Mohakhali', aliases: ['mohakhali', 'mohakhali bus terminal'], coords: [23.7786, 90.4005] },
  { label: 'Agargaon', aliases: ['agargaon'], coords: [23.7789, 90.3831] },
  { label: 'Shahbagh', aliases: ['shahbagh'], coords: [23.7385, 90.3965] },
  { label: 'Kawran Bazar', aliases: ['kawran bazar', 'karwan bazar'], coords: [23.7505, 90.3930] },
  { label: 'New Market', aliases: ['new market', 'dhaka new market'], coords: [23.7322, 90.3850] },
  { label: 'Azimpur', aliases: ['azimpur'], coords: [23.7276, 90.3854] },
  { label: 'Mohammadpur', aliases: ['mohammadpur', 'mohammedpur'], coords: [23.7656, 90.3586] },
  { label: 'Asad Gate', aliases: ['asad gate'], coords: [23.7600, 90.3728] },
  { label: 'Bashundhara', aliases: ['bashundhara', 'bashundhara r/a'], coords: [23.8196, 90.4320] },
  { label: 'Baridhara', aliases: ['baridhara'], coords: [23.7997, 90.4237] },
  { label: 'Badda', aliases: ['badda', 'middle badda'], coords: [23.7804, 90.4258] },
  { label: 'Rampura', aliases: ['rampura', 'rampura bridge'], coords: [23.7603, 90.4213] },
  { label: 'Malibagh', aliases: ['malibagh', 'mouchak'], coords: [23.7517, 90.4135] },
  { label: 'Khilgaon', aliases: ['khilgaon'], coords: [23.7509, 90.4252] },
  { label: 'Jatrabari', aliases: ['jatrabari'], coords: [23.7087, 90.4327] },
  { label: 'Gulistan', aliases: ['gulistan'], coords: [23.7234, 90.4116] },
  { label: 'Sadarghat', aliases: ['sadarghat'], coords: [23.7104, 90.4074] },
  { label: 'Paltan', aliases: ['paltan', 'purana paltan'], coords: [23.7302, 90.4092] },
  { label: 'Tejgaon', aliases: ['tejgaon'], coords: [23.7632, 90.3985] },
  { label: 'Hatirjheel', aliases: ['hatirjheel'], coords: [23.7496, 90.4107] },
  { label: 'Kuril', aliases: ['kuril', 'kuril biswa road'], coords: [23.8214, 90.4235] },
  { label: 'Kamalapur', aliases: ['kamalapur', 'kamalapur railway station'], coords: [23.7305, 90.4262] }
];

export const normalizeLocationName = (value = '') => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\b(dhaka|bangladesh)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const findKnownLocation = (query) => {
  const normalized = normalizeLocationName(query);
  if (!normalized) return null;

  const exact = POPULAR_DHAKA_LOCATIONS.find((location) =>
    location.aliases.some((alias) => normalizeLocationName(alias) === normalized)
  );
  if (exact) return exact;

  return POPULAR_DHAKA_LOCATIONS.find((location) =>
    location.aliases.some((alias) => {
      const normalizedAlias = normalizeLocationName(alias);
      return normalized.length >= 5 && (normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized));
    })
  ) || null;
};

export const straightLineDistanceKm = (fromCoords, toCoords) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const [fromLat, fromLng] = fromCoords;
  const [toLat, toLng] = toCoords;
  const latitudeDelta = toRadians(toLat - fromLat);
  const longitudeDelta = toRadians(toLng - fromLng);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const googleDirectionsUrl = ({ from, to, fromCoords, toCoords }) => {
  const origin = fromCoords?.join(',') || `${from}, Dhaka, Bangladesh`;
  const destination = toCoords?.join(',') || `${to}, Dhaka, Bangladesh`;
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
    dir_action: 'navigate'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

export const formatRouteStep = (step, index, total) => {
  const maneuver = step?.maneuver || {};
  const type = maneuver.type || 'continue';
  const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
  const road = step?.name ? ` onto ${step.name}` : '';

  let instruction;
  if (type === 'depart') instruction = `Start${step?.name ? ` on ${step.name}` : ''}`;
  else if (type === 'arrive' || index === total - 1) instruction = 'Arrive at your destination';
  else if (type === 'roundabout' || type === 'rotary') instruction = `Enter the roundabout${road}`;
  else if (type === 'turn') instruction = `${titleCase(`turn${modifier}`)}${road}`;
  else if (type === 'fork') instruction = `${titleCase(`keep${modifier}`)}${road}`;
  else if (type === 'merge') instruction = `Merge${modifier}${road}`;
  else if (type === 'on ramp') instruction = `Take the ramp${road}`;
  else if (type === 'off ramp') instruction = `Exit${modifier}${road}`;
  else instruction = `Continue${modifier}${road}`;

  return {
    instruction,
    distanceMeters: Math.round(step?.distance || 0),
    durationMin: Math.max(1, Math.round((step?.duration || 0) / 60))
  };
};
