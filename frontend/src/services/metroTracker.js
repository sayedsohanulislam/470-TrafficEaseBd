export const METRO_TIMETABLE_URLS = Object.freeze({
  weekday: 'https://owais5514.github.io/Dhaka-MRT-Timetable/mrt-6.json',
  friday: 'https://owais5514.github.io/Dhaka-MRT-Timetable/mrt-6-fri.json',
  saturday: 'https://owais5514.github.io/Dhaka-MRT-Timetable/mrt-6-sat.json'
});

export const getDhakaClock = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  return {
    weekday: parts.weekday,
    hour,
    minute,
    second,
    totalMinutes: hour * 60 + minute + second / 60,
    label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
  };
};

export const getMetroScheduleKind = (date = new Date()) => {
  const { weekday } = getDhakaClock(date);
  if (weekday === 'Friday') return 'friday';
  if (weekday === 'Saturday') return 'saturday';
  return 'weekday';
};

export const parseScheduleTime = (value = '') => {
  const [hours, minutes, seconds = 0] = String(value).split(':').map(Number);
  if (![hours, minutes, seconds].every(Number.isFinite)) return null;
  return hours * 60 + minutes + seconds / 60;
};

const formatScheduleTime = (totalMinutes) => {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60) % 24;
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const departurePattern = {
  weekday: { southStart: 390, southEnd: 1275, northStart: 435, northEnd: 1315 },
  saturday: { southStart: 390, southEnd: 1275, northStart: 435, northEnd: 1315 },
  friday: { southStart: 900, southEnd: 1250, northStart: 920, northEnd: 1290 }
};

const fallbackHeadway = (kind, departureMinutes) => {
  if (kind === 'friday') return 10;
  if (kind === 'saturday') return departureMinutes < 480 ? 12 : 10;
  if ((departureMinutes >= 491 && departureMinutes <= 593)
    || (departureMinutes >= 897 && departureMinutes <= 1061)) return 6;
  return departureMinutes >= 1200 ? 10 : 8;
};

const generateDepartures = (start, end, kind) => {
  const departures = [];
  for (let departure = start; departure <= end; departure += fallbackHeadway(kind, departure)) {
    departures.push(departure);
  }
  return departures;
};

export const buildFallbackMetroSchedule = (stationKeys, kind = 'weekday') => {
  const pattern = departurePattern[kind] || departurePattern.weekday;
  const segmentOffsets = [0, 3, 5, 8, 10, 13, 15, 17, 20, 22, 25, 27, 30, 32, 35, 38];
  const offsets = stationKeys.map((_, index) => segmentOffsets[index] ?? index * 2.5);
  const totalJourneyMinutes = offsets[offsets.length - 1];
  const southDepartures = generateDepartures(pattern.southStart, pattern.southEnd, kind);
  const northDepartures = generateDepartures(pattern.northStart, pattern.northEnd, kind);
  const schedule = {};

  stationKeys.forEach((stationKey, stationIndex) => {
    schedule[stationKey] = {
      Motijheel: southDepartures.map((departure) => formatScheduleTime(departure + offsets[stationIndex])),
      'Uttara North': northDepartures.map((departure) => formatScheduleTime(departure + totalJourneyMinutes - offsets[stationIndex]))
    };
  });

  return schedule;
};

const interpolateCoordinates = (from, to, progress) => [
  from[0] + (to[0] - from[0]) * progress,
  from[1] + (to[1] - from[1]) * progress
];

export const estimateMetroPositions = (scheduleData, stations, currentMinutes) => {
  if (!scheduleData || !stations?.length || !Number.isFinite(currentMinutes)) return [];
  const operationalStations = stations.filter((station) => station.operational !== false);
  const stationByKey = new Map(operationalStations.map((station) => [station.scheduleKey || station.name, station]));
  const southboundKeys = operationalStations.map((station) => station.scheduleKey || station.name);
  const northboundKeys = [...southboundKeys].reverse();
  const directions = [
    { id: 'south', label: 'Toward Motijheel', destination: 'Motijheel', stationKeys: southboundKeys, color: '#22c55e' },
    { id: 'north', label: 'Toward Uttara North', destination: 'Uttara North', stationKeys: northboundKeys, color: '#38bdf8' }
  ];
  const trains = [];

  directions.forEach((direction) => {
    const terminalKey = direction.stationKeys[0];
    const terminalDepartures = scheduleData[terminalKey]?.[direction.destination] || [];

    terminalDepartures.forEach((_, trainIndex) => {
      const stops = direction.stationKeys.map((stationKey) => ({
        stationKey,
        station: stationByKey.get(stationKey),
        time: scheduleData[stationKey]?.[direction.destination]?.[trainIndex],
        minutes: parseScheduleTime(scheduleData[stationKey]?.[direction.destination]?.[trainIndex])
      }));
      if (stops.some((stop) => !stop.station || stop.minutes === null)) return;
      if (currentMinutes < stops[0].minutes || currentMinutes > stops[stops.length - 1].minutes) return;

      let segmentIndex = stops.findIndex((stop, index) => index < stops.length - 1
        && currentMinutes >= stop.minutes
        && currentMinutes <= stops[index + 1].minutes);
      if (segmentIndex < 0) segmentIndex = stops.length - 2;
      const previousStop = stops[segmentIndex];
      const nextStop = stops[segmentIndex + 1];
      const segmentDuration = Math.max(0.1, nextStop.minutes - previousStop.minutes);
      const progress = Math.min(1, Math.max(0, (currentMinutes - previousStop.minutes) / segmentDuration));

      trains.push({
        id: `${direction.id}-${trainIndex + 1}`,
        directionId: direction.id,
        direction: direction.label,
        destination: direction.destination,
        color: direction.color,
        trainNumber: `${direction.id === 'south' ? 'M' : 'U'}-${String(trainIndex + 1).padStart(2, '0')}`,
        position: interpolateCoordinates(previousStop.station.coords, nextStop.station.coords, progress),
        previousStation: previousStop.station.name,
        nextStation: nextStop.station.name,
        scheduledArrival: nextStop.time.slice(0, 5),
        minutesToArrival: Math.max(0, Math.ceil(nextStop.minutes - currentMinutes)),
        progress: Math.round(progress * 100)
      });
    });
  });

  return trains;
};

export const getStationTimetable = (scheduleData, station, currentMinutes) => {
  const stationKey = station?.scheduleKey || station?.name;
  const stationData = stationKey ? scheduleData?.[stationKey] : null;
  if (!stationData) return null;
  const summarize = (destination) => {
    const times = stationData[destination] || [];
    return {
      first: times[0]?.slice(0, 5) || '—',
      last: times[times.length - 1]?.slice(0, 5) || '—',
      next: times.filter((time) => parseScheduleTime(time) >= currentMinutes).slice(0, 3).map((time) => time.slice(0, 5))
    };
  };
  return {
    southbound: summarize('Motijheel'),
    northbound: summarize('Uttara North')
  };
};
