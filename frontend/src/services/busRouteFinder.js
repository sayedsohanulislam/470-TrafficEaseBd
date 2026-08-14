const STOP_ALIASES = {
  'shahbagh': 'shahbag',
  'karwan bazar': 'kawran bazar',
  'kaoran bazar': 'kawran bazar',
  'kuril': 'kuril bishwa road',
  'airport': 'airport',
  'dhaka airport': 'airport',
  'new market': 'new market',
  'notun bazaar': 'notun bazar',
  'gulshan': 'gulshan 1',
  'mirpur': 'mirpur 10'
};

export const normalizeBusStop = (value = '') => value
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const comparableStop = (value) => {
  const normalized = normalizeBusStop(value);
  return STOP_ALIASES[normalized] || normalized;
};

export const getUniqueBusStops = (routes) => Array.from(new Set(
  routes.flatMap((route) => route.stops || [])
)).sort((left, right) => left.localeCompare(right));

export const getBusStopSuggestions = (routes, query, limit = 8) => {
  const stops = getUniqueBusStops(routes);
  const normalizedQuery = comparableStop(query);

  if (!normalizedQuery) {
    const popular = ['Farmgate', 'Gulistan', 'Mirpur 10', 'Motijheel', 'Paltan', 'Shahbag', 'Technical', 'Kuril Bishwa Road'];
    return popular.filter((stop) => stops.includes(stop)).slice(0, limit);
  }

  return stops
    .map((stop) => {
      const normalizedStop = comparableStop(stop);
      let rank = 99;
      if (normalizedStop === normalizedQuery) rank = 0;
      else if (normalizedStop.startsWith(normalizedQuery)) rank = 1;
      else if (normalizedStop.split(' ').some((part) => part.startsWith(normalizedQuery))) rank = 2;
      else if (normalizedStop.includes(normalizedQuery)) rank = 3;
      return { stop, rank };
    })
    .filter(({ rank }) => rank < 99)
    .sort((left, right) => left.rank - right.rank || left.stop.localeCompare(right.stop))
    .slice(0, limit)
    .map(({ stop }) => stop);
};

export const resolveBusStop = (routes, query) => {
  const normalizedQuery = comparableStop(query);
  if (!normalizedQuery) return null;

  const ranked = getUniqueBusStops(routes)
    .map((stop) => {
      const normalizedStop = comparableStop(stop);
      let rank = 99;
      if (normalizedStop === normalizedQuery) rank = 0;
      else if (normalizedStop.startsWith(normalizedQuery)) rank = 1;
      else if (normalizedStop.includes(normalizedQuery)) rank = 2;
      return { stop, rank, difference: Math.abs(normalizedStop.length - normalizedQuery.length) };
    })
    .filter(({ rank }) => rank < 99)
    .sort((left, right) => left.rank - right.rank || left.difference - right.difference || left.stop.localeCompare(right.stop));

  return ranked[0]?.stop || null;
};

const stopIndex = (route, stop) => route.stops.findIndex(
  (candidate) => normalizeBusStop(candidate) === normalizeBusStop(stop)
);

const directedSlice = (stops, startIndex, endIndex) => {
  if (startIndex <= endIndex) return stops.slice(startIndex, endIndex + 1);
  return stops.slice(endIndex, startIndex + 1).reverse();
};

const buildDirectOption = (route, fromStop, toStop) => {
  const fromIndex = stopIndex(route, fromStop);
  const toIndex = stopIndex(route, toStop);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return null;
  const journeyStops = directedSlice(route.stops, fromIndex, toIndex);
  return {
    route,
    fromStop,
    toStop,
    journeyStops,
    stopCount: journeyStops.length - 1,
    direction: fromIndex < toIndex ? route.stops[route.stops.length - 1] : route.stops[0]
  };
};

const transferKey = (option) => `${option.firstRoute.id}-${option.secondRoute.id}-${normalizeBusStop(option.interchange)}`;

export const findBusJourneys = (routes, fromQuery, toQuery, limits = {}) => {
  const directLimit = limits.direct ?? 24;
  const transferLimit = limits.transfers ?? 6;
  const fromStop = resolveBusStop(routes, fromQuery);
  const toStop = resolveBusStop(routes, toQuery);

  if (!fromStop || !toStop) {
    return {
      fromStop,
      toStop,
      direct: [],
      transfers: [],
      error: !fromStop && !toStop
        ? 'Choose a valid starting stop and destination.'
        : !fromStop
          ? 'Choose a valid starting stop.'
          : 'Choose a valid destination.'
    };
  }

  if (normalizeBusStop(fromStop) === normalizeBusStop(toStop)) {
    return { fromStop, toStop, direct: [], transfers: [], error: 'Starting stop and destination must be different.' };
  }

  const direct = routes
    .map((route) => buildDirectOption(route, fromStop, toStop))
    .filter(Boolean)
    .sort((left, right) => left.stopCount - right.stopCount || left.route.name.localeCompare(right.route.name))
    .slice(0, directLimit);

  const firstRoutes = routes.filter((route) => stopIndex(route, fromStop) >= 0);
  const secondRoutes = routes.filter((route) => stopIndex(route, toStop) >= 0);
  const transferOptions = [];

  firstRoutes.forEach((firstRoute) => {
    secondRoutes.forEach((secondRoute) => {
      if (firstRoute.id === secondRoute.id) return;

      const sharedStops = firstRoute.stops.filter((stop) => stopIndex(secondRoute, stop) >= 0);
      sharedStops.forEach((interchange) => {
        if ([fromStop, toStop].some((stop) => normalizeBusStop(stop) === normalizeBusStop(interchange))) return;
        const firstLeg = buildDirectOption(firstRoute, fromStop, interchange);
        const secondLeg = buildDirectOption(secondRoute, interchange, toStop);
        if (!firstLeg || !secondLeg) return;
        transferOptions.push({
          firstRoute,
          secondRoute,
          interchange,
          firstLeg,
          secondLeg,
          stopCount: firstLeg.stopCount + secondLeg.stopCount
        });
      });
    });
  });

  const seen = new Set();
  const transfers = transferOptions
    .sort((left, right) => left.stopCount - right.stopCount || left.interchange.localeCompare(right.interchange))
    .filter((option) => {
      const key = transferKey(option);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, transferLimit);

  return { fromStop, toStop, direct, transfers, error: null };
};

