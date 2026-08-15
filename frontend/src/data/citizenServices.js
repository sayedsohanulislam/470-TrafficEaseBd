export const serviceGroups = [
  {
    id: 'journey',
    icon: '🧭',
    label: { en: 'Plan a journey', bn: 'যাত্রা পরিকল্পনা' },
    helper: { en: 'Choose a route, bus, metro, or better departure time.', bn: 'রুট, বাস, মেট্রো বা যাওয়ার ভালো সময় বেছে নিন।' }
  },
  {
    id: 'money',
    icon: '৳',
    label: { en: 'Pay the right amount', bn: 'সঠিক ভাড়া জানুন' },
    helper: { en: 'Check fares, compare costs, and find transport nearby.', bn: 'ভাড়া যাচাই, খরচ তুলনা ও কাছের যানবাহন খুঁজুন।' }
  },
  {
    id: 'safety',
    icon: '🛡️',
    label: { en: 'Stay safe on the road', bn: 'পথে নিরাপদ থাকুন' },
    helper: { en: 'See hazards, report a problem, and get urgent help.', bn: 'বিপদ দেখুন, সমস্যা জানান ও জরুরি সাহায্য নিন।' }
  },
  {
    id: 'nearby',
    icon: '📍',
    label: { en: 'Find something nearby', bn: 'কাছের সেবা খুঁজুন' },
    helper: { en: 'Locate hospitals, fuel, school zones, and traffic police.', bn: 'হাসপাতাল, জ্বালানি, স্কুল জোন ও ট্রাফিক পুলিশ খুঁজুন।' }
  },
  {
    id: 'daily',
    icon: '☀️',
    label: { en: 'Manage daily travel', bn: 'প্রতিদিনের যাতায়াত' },
    helper: { en: 'Save a commute, follow reports, closures, and official alerts.', bn: 'নিত্য রুট সেভ করুন, রিপোর্ট, রাস্তা বন্ধ ও সরকারি সতর্কতা দেখুন।' }
  }
];

export const citizenServices = [
  {
    id: 1,
    slug: 'route-planner',
    icon: '🧭',
    group: 'journey',
    featured: true,
    name: { en: 'Plan my route', bn: 'আমার রুট বেছে দিন' },
    task: { en: 'Enter where you are and where you want to go.', bn: 'কোথা থেকে কোথায় যাবেন লিখুন।' },
    result: { en: 'Get a road route, travel time, distance, and fare estimate.', bn: 'রুট, সময়, দূরত্ব ও ভাড়ার ধারণা পাবেন।' },
    action: { en: 'Plan route', bn: 'রুট দেখুন' },
    steps: { en: ['Enter start', 'Enter destination', 'Use the route'], bn: ['শুরুর স্থান দিন', 'গন্তব্য দিন', 'রুট দেখুন'] },
    keywords: ['route', 'map', 'direction', 'rasta', 'রুট', 'রাস্তা']
  },
  {
    id: 2,
    slug: 'fare-checker',
    icon: '🚕',
    group: 'money',
    featured: true,
    name: { en: 'Check CNG & rickshaw fare', bn: 'সিএনজি ও রিকশা ভাড়া' },
    task: { en: 'Pin your starting point and destination on the map.', bn: 'গাড়িতে ওঠার আগে ন্যায্য ভাড়া জানুন।' },
    result: { en: 'See the road distance, official CNG meter fare, waiting charge, and a rickshaw estimate.', bn: 'সিএনজি, রিকশা, বাস, রাইড-শেয়ার ও মেট্রোর ভাড়া দেখুন।' },
    action: { en: 'Check fare', bn: 'ভাড়া দেখুন' },
    steps: { en: ['Pin your start', 'Pin your destination', 'Check the fare'], bn: ['শুরুর স্থান দিন', 'গন্তব্য দিন', 'ভাড়া মিলিয়ে নিন'] },
    keywords: ['fare', 'cng', 'rickshaw', 'price', 'vara', 'ভাড়া']
  },
  {
    id: 3,
    slug: 'incident-map',
    icon: '⚠️',
    group: 'safety',
    name: { en: 'See road problems', bn: 'রাস্তার সমস্যা দেখুন' },
    task: { en: 'Check accidents, jams, roadwork, and flooding on a map.', bn: 'মানচিত্রে দুর্ঘটনা, জ্যাম, কাজ ও জলাবদ্ধতা দেখুন।' },
    result: { en: 'Know which places to avoid before you start.', bn: 'বের হওয়ার আগে কোন জায়গা এড়াবেন জানুন।' },
    action: { en: 'Open problem map', bn: 'সমস্যার মানচিত্র' },
    steps: { en: ['Open the map', 'Tap a marker', 'Avoid the problem'], bn: ['মানচিত্র খুলুন', 'চিহ্নে চাপ দিন', 'বিপদ এড়িয়ে যান'] },
    keywords: ['incident', 'accident', 'jam', 'flood', 'দুর্ঘটনা', 'জ্যাম']
  },
  {
    id: 4,
    slug: 'report-problem',
    icon: '📸',
    group: 'safety',
    featured: true,
    name: { en: 'Report a road problem', bn: 'রাস্তার সমস্যা জানান' },
    task: { en: 'Tell other commuters about a jam, crash, flood, or broken signal.', bn: 'জ্যাম, দুর্ঘটনা, জলাবদ্ধতা বা নষ্ট সিগন্যালের খবর দিন।' },
    result: { en: 'Submit a trackable report to the shared incident feed.', bn: 'ট্র্যাক করা যায় এমন রিপোর্ট পাঠান।' },
    action: { en: 'Make a report', bn: 'রিপোর্ট করুন' },
    steps: { en: ['Choose problem', 'Give location', 'Submit report'], bn: ['সমস্যা বাছুন', 'স্থান দিন', 'রিপোর্ট পাঠান'] },
    keywords: ['report', 'problem', 'complaint', 'রিপোর্ট', 'সমস্যা']
  },
  {
    id: 5,
    slug: 'metro-guide',
    icon: '🚇',
    group: 'journey',
    name: { en: 'Use the metro', bn: 'মেট্রোতে যান' },
    task: { en: 'See MRT-6 stations and timetable-estimated train positions on a live map.', bn: 'এমআরটি-৬ স্টেশন, সময় ও কাছের বাস দেখুন।' },
    result: { en: 'Follow moving train estimates, select a station, and check next, first, and last times.', bn: 'স্টেশন বেছে যাত্রার তথ্য পান।' },
    action: { en: 'Open metro guide', bn: 'মেট্রো গাইড' },
    steps: { en: ['See estimated trains', 'Choose a station', 'Check next times'], bn: ['ট্রেন চলছে কিনা দেখুন', 'স্টেশন বাছুন', 'সংযোগ দেখুন'] },
    keywords: ['metro', 'mrt', 'train', 'মেট্রো', 'ট্রেন']
  },
  {
    id: 6,
    slug: 'bus-finder',
    icon: '🚌',
    group: 'journey',
    featured: true,
    name: { en: 'Find a bus', bn: 'কোন বাসে যাবেন' },
    task: { en: 'Choose your boarding stop and destination from the Dhaka bus directory.', bn: 'শুরুর এলাকা ও গন্তব্য দিয়ে বাস খুঁজুন।' },
    result: { en: 'See direct buses, boarding and drop-off stops, or a one-change alternative.', bn: 'বাস, স্টপ, কতক্ষণ পরপর ও ভাড়া দেখুন।' },
    action: { en: 'Find buses', bn: 'বাস খুঁজুন' },
    steps: { en: ['Choose starting stop', 'Choose destination', 'Follow boarding steps'], bn: ['আপনার এলাকা দিন', 'গন্তব্য দিন', 'বাস বাছুন'] },
    keywords: ['bus', 'route', 'local bus', 'বাস']
  },
  {
    id: 7,
    slug: 'parking-finder',
    icon: '🅿️',
    group: 'money',
    name: { en: 'Find parking', bn: 'পার্কিং খুঁজুন' },
    task: { en: 'Search near any Dhaka destination for public or residential parking.', bn: 'ব্যস্ত এলাকায় যাওয়ার আগে পার্কিং খুঁজুন।' },
    result: { en: 'Compare distance, hourly capacity and rates, or ParkingKoi monthly rent and amenities.', bn: 'স্থান, ধারণক্ষমতা, সময় ও ঘণ্টার ভাড়া দেখুন।' },
    action: { en: 'Find parking', bn: 'পার্কিং দেখুন' },
    steps: { en: ['Choose a location', 'Select parking type', 'Compare nearby options'], bn: ['মানচিত্র খুলুন', 'পার্কিংয়ে চাপ দিন', 'ভাড়া ও সময় দেখুন'] },
    keywords: ['parking', 'car', 'rate', 'পার্কিং']
  },
  {
    id: 8,
    slug: 'emergency-help',
    icon: '🆘',
    group: 'safety',
    featured: true,
    name: { en: 'Call emergency help', bn: 'জরুরি সাহায্য নিন' },
    task: { en: 'Call police, fire, ambulance, flood, or traffic help.', bn: 'পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স, বন্যা বা ট্রাফিক সহায়তায় কল করুন।' },
    result: { en: 'Use one large tap-to-call button for the right service.', bn: 'সঠিক সেবায় এক চাপে কল করুন।' },
    action: { en: 'Get help', bn: 'সাহায্য নিন' },
    steps: { en: ['Choose help type', 'Check the number', 'Tap to call'], bn: ['সাহায্যের ধরন বাছুন', 'নম্বর দেখুন', 'কল করুন'] },
    keywords: ['emergency', 'police', 'fire', 'ambulance', '999', 'জরুরি']
  },
  {
    id: 9,
    slug: 'waterlogging',
    icon: '🌊',
    group: 'safety',
    name: { en: 'Avoid waterlogged roads', bn: 'জলাবদ্ধ রাস্তা এড়িয়ে চলুন' },
    task: { en: 'Check flood-prone roads during rain or monsoon.', bn: 'বৃষ্টি বা বর্ষায় জলাবদ্ধ রাস্তা দেখুন।' },
    result: { en: 'See risk level, drainage notes, and an alternate road.', bn: 'ঝুঁকি, ড্রেনেজ ও বিকল্প রাস্তা দেখুন।' },
    action: { en: 'Check waterlogging', bn: 'জলাবদ্ধতা দেখুন' },
    steps: { en: ['Open risk map', 'Tap an area', 'Use the alternate'], bn: ['ঝুঁকির মানচিত্র খুলুন', 'এলাকায় চাপ দিন', 'বিকল্প রাস্তা নিন'] },
    keywords: ['waterlogging', 'flood', 'rain', 'pani', 'জলাবদ্ধতা', 'বৃষ্টি']
  },
  {
    id: 10,
    slug: 'fuel-station',
    icon: '⛽',
    group: 'nearby',
    name: { en: 'Find a fuel station', bn: 'ফুয়েল বা সিএনজি স্টেশন' },
    task: { en: 'Find nearby petrol, octane, diesel, or kerosene stations.', bn: 'প্রয়োজনীয় জ্বালানিসহ খোলা স্টেশন খুঁজুন।' },
    result: { en: 'Compare distance, fuel types, reference prices, and community queue reports.', bn: 'অকটেন, ডিজেল বা সিএনজি ও খোলার সময় দেখুন।' },
    action: { en: 'Find a station', bn: 'স্টেশন খুঁজুন' },
    steps: { en: ['Choose a location', 'Filter fuel and queue', 'Check the nearest station'], bn: ['জ্বালানি বাছুন', 'স্টেশন দেখুন', 'তথ্যে চাপ দিন'] },
    keywords: ['fuel', 'petrol', 'diesel', 'cng', 'তেল', 'সিএনজি']
  },
  {
    id: 11,
    slug: 'best-time',
    icon: '⏰',
    group: 'journey',
    name: { en: 'Choose the best time to leave', bn: 'কখন বের হবেন' },
    task: { en: 'Check when Dhaka roads are usually lighter.', bn: 'কখন ঢাকার রাস্তা তুলনামূলক ফাঁকা থাকে দেখুন।' },
    result: { en: 'See the best and worst one-hour travel windows.', bn: 'সেরা ও সবচেয়ে ব্যস্ত এক ঘণ্টার সময় দেখুন।' },
    action: { en: 'Check departure time', bn: 'যাওয়ার সময় দেখুন' },
    steps: { en: ['Choose weekday/weekend', 'Read the chart', 'Pick a green hour'], bn: ['কর্মদিবস/ছুটি বাছুন', 'চার্ট দেখুন', 'সবুজ সময় বাছুন'] },
    keywords: ['time', 'leave', 'traffic hour', 'সময়', 'বের']
  },
  {
    id: 12,
    slug: 'hospital-finder',
    icon: '🏥',
    group: 'nearby',
    featured: true,
    name: { en: 'Find the nearest hospital', bn: 'Find the nearest hospital' },
    task: { en: 'Use live location or tap the map to find nearby care.', bn: 'Use live location or tap the map to find nearby care.' },
    result: { en: 'See distance, facility type, contact details, source, and map-pin accuracy.', bn: 'See distance, facility type, contact details, source, and map-pin accuracy.' },
    action: { en: 'Find nearby hospitals', bn: 'Find nearby hospitals' },
    steps: { en: ['Share or pin your location', 'Compare nearest results', 'Call to confirm care'], bn: ['Share or pin your location', 'Compare nearest results', 'Call to confirm care'] },
    keywords: ['hospital', 'clinic', 'emergency', 'doctor', 'nearest', 'live location', 'হাসপাতাল']
  },
  {
    id: 13,
    slug: 'school-zone',
    icon: '🏫',
    group: 'nearby',
    name: { en: 'Check active school zones', bn: 'সক্রিয় স্কুল জোন দেখুন' },
    task: { en: 'Know where children may be entering or leaving school.', bn: 'কোথায় শিশুরা স্কুলে ঢুকছে বা বের হচ্ছে জানুন।' },
    result: { en: 'See which zones are active now and their school hours.', bn: 'এখন কোন জোন সক্রিয় ও স্কুলের সময় দেখুন।' },
    action: { en: 'Check school zones', bn: 'স্কুল জোন দেখুন' },
    steps: { en: ['Check current status', 'Open map', 'Slow down in red zones'], bn: ['এখনকার অবস্থা দেখুন', 'মানচিত্র খুলুন', 'লাল জোনে ধীরে চলুন'] },
    keywords: ['school', 'children', 'slow', 'স্কুল']
  },
  {
    id: 14,
    slug: 'cng-stand',
    icon: '🛺',
    group: 'money',
    name: { en: 'Find a CNG or rickshaw stand', bn: 'সিএনজি বা রিকশা স্ট্যান্ড' },
    task: { en: 'Find a nearby place to get a CNG or rickshaw.', bn: 'কাছে সিএনজি বা রিকশা পাওয়ার জায়গা খুঁজুন।' },
    result: { en: 'See stand type, usual wait, and busy hours.', bn: 'স্ট্যান্ডের ধরন, অপেক্ষা ও ব্যস্ত সময় দেখুন।' },
    action: { en: 'Find a stand', bn: 'স্ট্যান্ড খুঁজুন' },
    steps: { en: ['Choose vehicle', 'Open map', 'Check wait time'], bn: ['যানবাহন বাছুন', 'মানচিত্র খুলুন', 'অপেক্ষা দেখুন'] },
    keywords: ['cng stand', 'rickshaw stand', 'transport', 'স্ট্যান্ড']
  },
  {
    id: 15,
    slug: 'road-closures',
    icon: '🚧',
    group: 'daily',
    name: { en: 'Check road closures', bn: 'বন্ধ রাস্তা দেখুন' },
    task: { en: 'Check active construction and closed roads before leaving.', bn: 'বের হওয়ার আগে চলমান কাজ ও বন্ধ রাস্তা দেখুন।' },
    result: { en: 'See dates, affected lanes, and a suggested detour.', bn: 'তারিখ, প্রভাবিত লেন ও বিকল্প রাস্তা দেখুন।' },
    action: { en: 'See closures', bn: 'বন্ধ রাস্তা দেখুন' },
    steps: { en: ['Choose active/upcoming', 'Read affected road', 'Use detour'], bn: ['এখন/শিগগির বাছুন', 'প্রভাবিত রাস্তা পড়ুন', 'বিকল্প পথ নিন'] },
    keywords: ['closure', 'construction', 'road work', 'detour', 'রাস্তা বন্ধ']
  },
  {
    id: 16,
    slug: 'cost-compare',
    icon: '🧮',
    group: 'money',
    name: { en: 'Compare journey costs', bn: 'যাত্রার খরচ তুলনা' },
    task: { en: 'Compare common transport costs for a distance.', bn: 'একই দূরত্বে বিভিন্ন যানবাহনের খরচ তুলনা করুন।' },
    result: { en: 'Compare CNG, rickshaw, bus, ride-share, metro, and private car.', bn: 'সিএনজি, রিকশা, বাস, রাইড-শেয়ার, মেট্রো ও প্রাইভেট কার তুলনা করুন।' },
    action: { en: 'Compare costs', bn: 'খরচ তুলনা' },
    steps: { en: ['Enter distance', 'Compare all modes', 'Choose a budget'], bn: ['দূরত্ব দিন', 'সব যান তুলনা করুন', 'বাজেটেরটি নিন'] },
    keywords: ['cost', 'compare', 'budget', 'fare', 'খরচ', 'তুলনা']
  },
  {
    id: 17,
    slug: 'traffic-police',
    icon: '👮',
    group: 'nearby',
    name: { en: 'Contact traffic police', bn: 'ট্রাফিক পুলিশের সাথে যোগাযোগ' },
    task: { en: 'Find the traffic division responsible for your area.', bn: 'আপনার এলাকার দায়িত্বে থাকা ট্রাফিক বিভাগ খুঁজুন।' },
    result: { en: 'See its jurisdiction and tap the phone number to call.', bn: 'এলাকা ও ফোন নম্বর দেখে কল করুন।' },
    action: { en: 'Find traffic police', bn: 'ট্রাফিক পুলিশ খুঁজুন' },
    steps: { en: ['Open map', 'Tap your division', 'Call the office'], bn: ['মানচিত্র খুলুন', 'বিভাগে চাপ দিন', 'অফিসে কল করুন'] },
    keywords: ['police', 'traffic police', 'dmp', 'contact', 'পুলিশ']
  },
  {
    id: 18,
    slug: 'my-reports',
    icon: '📋',
    group: 'daily',
    name: { en: 'Track my reports', bn: 'আমার রিপোর্ট ট্র্যাক করুন' },
    task: { en: 'Follow what happened after you reported a road problem.', bn: 'রাস্তার সমস্যা জানানোর পর কী হয়েছে দেখুন।' },
    result: { en: 'See whether a report is open, being investigated, or resolved.', bn: 'রিপোর্ট খোলা, তদন্তাধীন বা সমাধান হয়েছে কিনা দেখুন।' },
    action: { en: 'Track reports', bn: 'রিপোর্ট দেখুন' },
    steps: { en: ['Submit a report', 'Open reports on this device', 'Read the status'], bn: ['রিপোর্ট করুন', 'এই ডিভাইসের রিপোর্ট খুলুন', 'অবস্থা পড়ুন'] },
    keywords: ['my report', 'status', 'track', 'আমার রিপোর্ট']
  },
  {
    id: 19,
    slug: 'daily-commute',
    icon: '🏠',
    group: 'daily',
    featured: true,
    name: { en: 'Save my daily commute', bn: 'নিত্য যাতায়াত সেভ করুন' },
    task: { en: 'Save home and work once for a quick daily traffic check.', bn: 'প্রতিদিনের ট্রাফিক দেখতে বাসা ও কাজের স্থান একবার সেভ করুন।' },
    result: { en: 'Get an immediate leave-now recommendation whenever you return.', bn: 'প্রতিবার এসে এখনই বের হবেন কিনা জানুন।' },
    action: { en: 'Save commute', bn: 'যাতায়াত সেভ করুন' },
    steps: { en: ['Enter home', 'Enter work', 'Save and check'], bn: ['বাসার স্থান দিন', 'কাজের স্থান দিন', 'সেভ করে দেখুন'] },
    keywords: ['commute', 'home', 'work', 'daily', 'বাসা', 'অফিস']
  },
  {
    id: 20,
    slug: 'official-alerts',
    icon: '📢',
    group: 'daily',
    name: { en: 'Read official alerts', bn: 'সরকারি সতর্কতা দেখুন' },
    task: { en: 'Read current notices from the traffic authority.', bn: 'ট্রাফিক কর্তৃপক্ষের বর্তমান নোটিশ পড়ুন।' },
    result: { en: 'See the affected area, severity, and what commuters should do.', bn: 'প্রভাবিত এলাকা, ঝুঁকি ও কী করবেন দেখুন।' },
    action: { en: 'Read alerts', bn: 'সতর্কতা পড়ুন' },
    steps: { en: ['Open alerts', 'Check your area', 'Follow the advice'], bn: ['সতর্কতা খুলুন', 'নিজের এলাকা দেখুন', 'পরামর্শ মানুন'] },
  },
  {
    id: 21,
    slug: 'air-quality',
    icon: '🌫️',
    group: 'weather',
    name: { en: 'Live Air Quality (AQI)', bn: 'লাইভ বাতাসের মান (AQI)' },
    task: { en: 'Check real-time air quality in Dhaka.', bn: 'ঢাকায় রিয়েল-টাইম বাতাসের মান দেখুন।' },
    result: { en: 'See current pollution levels and health advice.', bn: 'বর্তমান দূষণ মাত্রা এবং স্বাস্থ্য পরামর্শ দেখুন।' },
    action: { en: 'Check AQI', bn: 'AQI দেখুন' },
    steps: { en: ['Open Air Quality map', 'View current AQI level'], bn: ['বাতাসের মানের মানচিত্র খুলুন', 'বর্তমান AQI মাত্রা দেখুন'] },
    keywords: ['air', 'quality', 'pollution', 'aqi', 'smoke', 'বাতাস', 'দূষণ']
  },
  {
    id: 22,
    slug: 'weather',
    icon: '🌤️',
    group: 'weather',
    name: { en: 'Current Weather', bn: 'বর্তমান আবহাওয়া' },
    task: { en: 'Check current weather conditions in Dhaka.', bn: 'ঢাকায় বর্তমান আবহাওয়ার অবস্থা দেখুন।' },
    result: { en: 'See temperature and weather forecast.', bn: 'তাপমাত্রা এবং আবহাওয়ার পূর্বাভাস দেখুন।' },
    action: { en: 'Check Weather', bn: 'আবহাওয়া দেখুন' },
    steps: { en: ['Open Weather tool', 'View current forecast'], bn: ['আবহাওয়া টুল খুলুন', 'বর্তমান পূর্বাভাস দেখুন'] },
    keywords: ['weather', 'temperature', 'forecast', 'sun', 'আবহাওয়া', 'তাপমাত্রা']
  },
  {
    id: 23,
    slug: 'offline-sms',
    icon: '📵',
    group: 'daily',
    name: { en: 'Offline SMS Alerts', bn: 'অফলাইন এসএমএস অ্যালার্ট' },
    task: { en: 'Subscribe to receive severe traffic alerts via SMS.', bn: 'এসএমএস-এর মাধ্যমে তীব্র ট্র্যাফিক অ্যালার্ট পেতে সাবস্ক্রাইব করুন।' },
    result: { en: 'Get critical updates even without internet.', bn: 'ইন্টারনেট ছাড়াই গুরুত্বপূর্ণ আপডেট পান।' },
    action: { en: 'Subscribe to SMS', bn: 'এসএমএস সাবস্ক্রাইব করুন' },
    steps: { en: ['Enter phone number', 'Select route', 'Subscribe'], bn: ['ফোন নম্বর দিন', 'রুট নির্বাচন করুন', 'সাবস্ক্রাইব করুন'] },
    keywords: ['sms', 'offline', 'alert', 'message', 'অফলাইন', 'এসএমএস']
  },
  {
    id: 24,
    slug: 'rain-warning',
    icon: '⛈️',
    group: 'weather',
    name: { en: 'Rain Warning', bn: 'বৃষ্টির সতর্কতা' },
    task: { en: 'Check if it will rain soon at your location.', bn: 'আপনার এলাকায় শীঘ্রই বৃষ্টি হবে কিনা তা পরীক্ষা করুন।' },
    result: { en: 'See short-term rain forecasts to plan your departure.', bn: 'আপনার যাত্রা পরিকল্পনা করতে স্বল্পমেয়াদী বৃষ্টির পূর্বাভাস দেখুন।' },
    action: { en: 'Check Rain Warning', bn: 'বৃষ্টির সতর্কতা দেখুন' },
    steps: { en: ['Choose location', 'View rain prediction'], bn: ['স্থান নির্বাচন করুন', 'বৃষ্টির পূর্বাভাস দেখুন'] },
    keywords: ['rain', 'warning', 'storm', 'weather', 'বৃষ্টি', 'সতর্কতা']
  },
  {
    id: 25,
    slug: 'prayer-time-traffic',
    icon: '🕌',
    group: 'journey',
    name: { en: 'Prayer Time Traffic Planner', bn: 'নামাজের সময় ট্র্যাফিক প্ল্যানার' },
    task: { en: 'Avoid heavy traffic around mosques during prayer times.', bn: 'নামাজের সময় মসজিদের চারপাশে ভারী ট্র্যাফিক এড়িয়ে চলুন।' },
    result: { en: 'Get alternative departure times.', bn: 'যাত্রার বিকল্প সময় পান।' },
    action: { en: 'Check Prayer Traffic', bn: 'নামাজের ট্র্যাফিক দেখুন' },
    steps: { en: ['Select departure time', 'Check overlap'], bn: ['যাত্রার সময় নির্বাচন করুন', 'ওভারল্যাপ চেক করুন'] },
    keywords: ['prayer', 'namaz', 'jummah', 'traffic', 'নামাজ', 'জুম্মা']
  },
  {
    id: 26,
    slug: 'hartaal-alert',
    icon: '🚫',
    group: 'safety',
    name: { en: 'Hartaal / Strike Alert', bn: 'হরতাল / ধর্মঘট সতর্কতা' },
    task: { en: 'Check upcoming political strikes and affected transport.', bn: 'আসন্ন রাজনৈতিক ধর্মঘট এবং প্রভাবিত পরিবহন পরীক্ষা করুন।' },
    result: { en: 'Know which roads and vehicles to avoid.', bn: 'কোন রাস্তা এবং যানবাহন এড়ানো উচিত তা জানুন।' },
    action: { en: 'Check Strike Alerts', bn: 'ধর্মঘট সতর্কতা দেখুন' },
    steps: { en: ['Open alerts', 'View details'], bn: ['সতর্কতা খুলুন', 'বিবরণ দেখুন'] },
    keywords: ['strike', 'hartaal', 'blockade', 'হরতাল', 'ধর্মঘট']
  },
  {
    id: 27,
    slug: 'vip-movement',
    icon: '🚔',
    group: 'safety',
    name: { en: 'VIP Movement Alerts', bn: 'ভিআইপি মুভমেন্ট অ্যালার্ট' },
    task: { en: 'See community reports of sudden road blocks for VIPs.', bn: 'ভিআইপিদের জন্য হঠাৎ রাস্তা অবরোধের রিপোর্ট দেখুন।' },
    result: { en: 'Avoid unexpected 30-60 min delays.', bn: 'অপ্রত্যাশিত ৩০-৬০ মিনিটের বিলম্ব এড়ান।' },
    action: { en: 'View Road Blocks', bn: 'রাস্তা অবরোধ দেখুন' },
    steps: { en: ['Check map', 'Report block'], bn: ['মানচিত্র দেখুন', 'অবরোধ রিপোর্ট করুন'] },
    keywords: ['vip', 'block', 'delay', 'traffic', 'ভিআইপি', 'অবরোধ']
  },
  {
    id: 28,
    slug: 'lost-and-found',
    icon: '🔍',
    group: 'daily',
    name: { en: 'Lost & Found on Transport', bn: 'পরিবহনে হারানো এবং প্রাপ্তি' },
    task: { en: 'Report or find items lost on bus, CNG, or rickshaw.', bn: 'বাস, সিএনজি বা রিকশায় হারানো জিনিস রিপোর্ট করুন বা খুঁজুন।' },
    result: { en: 'Connect with whoever found your item.', bn: 'যিনি আপনার জিনিস পেয়েছেন তার সাথে যোগাযোগ করুন।' },
    action: { en: 'Report / Find', bn: 'রিপোর্ট / খুঁজুন' },
    steps: { en: ['Select category', 'Fill details'], bn: ['বিভাগ নির্বাচন করুন', 'বিবরণ পূরণ করুন'] },
    keywords: ['lost', 'found', 'missing', 'হারানো', 'প্রাপ্তি']
  },
  {
    id: 29,
    slug: 'safe-pedestrian-crossings',
    icon: '🚶',
    group: 'safety',
    name: { en: 'Safe Pedestrian Crossings', bn: 'নিরাপদ পথচারী পারাপার' },
    task: { en: 'Find nearby footover bridges and underpasses.', bn: 'কাছাকাছি ফুটওভার ব্রিজ এবং আন্ডারপাস খুঁজুন।' },
    result: { en: 'Cross deadly roads safely.', bn: 'নিরাপদে রাস্তা পার হোন।' },
    action: { en: 'Find Crossing', bn: 'পারাপার খুঁজুন' },
    steps: { en: ['Open map', 'Find nearest bridge'], bn: ['মানচিত্র খুলুন', 'কাছাকাছি ব্রিজ খুঁজুন'] },
    keywords: ['walk', 'bridge', 'cross', 'pedestrian', 'হাঁটা', 'পারাপার']
  },
  {
    id: 30,
    slug: 'atm-bkash-finder',
    icon: '🏧',
    group: 'money',
    name: { en: 'Nearest ATM & bKash', bn: 'কাছাকাছি এটিএম ও বিকাশ' },
    task: { en: 'Find cash for your transport fare immediately.', bn: 'আপনার পরিবহন ভাড়ার জন্য অবিলম্বে নগদ অর্থ খুঁজুন।' },
    result: { en: 'Never get stuck without cash again.', bn: 'নগদ অর্থ ছাড়া আর কখনও আটকে থাকবেন না।' },
    action: { en: 'Find Cash', bn: 'নগদ খুঁজুন' },
    steps: { en: ['Check map', 'Find ATM'], bn: ['মানচিত্র দেখুন', 'এটিএম খুঁজুন'] },
    keywords: ['atm', 'bank', 'bkash', 'cash', 'নগদ', 'এটিএম']
  },
  {
    id: 31,
    slug: 'breakdown-help',
    icon: '🔧',
    group: 'safety',
    name: { en: 'Vehicle Breakdown Help', bn: 'যানবাহন বিকল সহায়তা' },
    task: { en: 'Find the nearest auto repair or tyre shop.', bn: 'কাছাকাছি অটো মেরামত বা টায়ার শপ খুঁজুন।' },
    result: { en: 'Get emergency mechanic help fast.', bn: 'দ্রুত জরুরি মেকানিক সহায়তা পান।' },
    action: { en: 'Find Mechanic', bn: 'মেকানিক খুঁজুন' },
    steps: { en: ['Check map', 'Find repair shop'], bn: ['মানচিত্র দেখুন', 'মেরামত দোকান খুঁজুন'] },
    keywords: ['repair', 'mechanic', 'car', 'breakdown', 'মেরামত', 'মেকানিক']
  },
  {
    id: 32,
    slug: 'newcomer-guide',
    icon: '📖',
    group: 'daily',
    name: { en: 'Dhaka Transport Guide', bn: 'ঢাকা ট্রান্সপোর্ট গাইড' },
    task: { en: 'Learn how to board buses, negotiate CNGs, and use Metro.', bn: 'কীভাবে বাসে উঠতে হয়, সিএনজির সাথে দরকষাকষি করতে হয় এবং মেট্রো ব্যবহার করতে হয় তা জানুন।' },
    result: { en: 'Survive Dhaka traffic like a pro.', bn: 'একজন পেশাদারের মতো ঢাকা ট্র্যাফিক থেকে বাঁচুন।' },
    action: { en: 'Read Guide', bn: 'গাইড পড়ুন' },
    steps: { en: ['Open guide', 'Select topic'], bn: ['গাইড খুলুন', 'বিষয় নির্বাচন করুন'] },
    keywords: ['guide', 'help', 'learn', 'new', 'গাইড', 'নতুন']
  },
  {
    id: 33,
    slug: 'personal-travel-diary',
    icon: '📊',
    group: 'money',
    name: { en: 'Personal Travel Diary', bn: 'ব্যক্তিগত ভ্রমণ ডায়েরি' },
    task: { en: 'Log your daily commute time and transport costs.', bn: 'আপনার দৈনন্দিন যাতায়াতের সময় এবং পরিবহন খরচ লগ করুন।' },
    result: { en: 'Track monthly spending and save money.', bn: 'মাসিক খরচ ট্র্যাক করুন এবং টাকা বাঁচান।' },
    action: { en: 'Log Trip', bn: 'ট্রিপ লগ করুন' },
    steps: { en: ['Enter details', 'Save'], bn: ['বিবরণ লিখুন', 'সংরক্ষণ করুন'] },
    keywords: ['log', 'track', 'diary', 'budget', 'ডায়েরি', 'বাজেট']
  },
  {
    id: 34,
    slug: 'bd-train-tracker',
    icon: '🚂',
    group: 'journey',
    name: { en: 'BD Train Schedule & Tracker', bn: 'বিডি ট্রেন শিডিউল ও ট্র্যাকার' },
    task: { en: 'Check intercity train schedules and live location.', bn: 'আন্তঃনগর ট্রেনের শিডিউল এবং লাইভ লোকেশন দেখুন।' },
    result: { en: 'Never miss a train or wait for delayed ones.', bn: 'কখনও ট্রেন মিস করবেন না বা দেরি হওয়া ট্রেনের জন্য অপেক্ষা করবেন না।' },
    action: { en: 'Track Train', bn: 'ট্রেন ট্র্যাক করুন' },
    steps: { en: ['View schedule', 'Open tracker'], bn: ['শিডিউল দেখুন', 'ট্র্যাকার খুলুন'] },
    keywords: ['train', 'railway', 'track', 'ট্রেন', 'রেলওয়ে']
  }
];

export const localized = (value, language = 'en') => value?.[language] || value?.en || '';

export const findService = (slugOrId) => citizenServices.find(
  (service) => service.slug === slugOrId || service.id === Number(slugOrId)
);

export const searchServices = (query, group = 'all') => {
  const normalized = query.trim().toLowerCase();
  return citizenServices.filter((service) => {
    if (group !== 'all' && service.group !== group) return false;
    if (!normalized) return true;
    const searchable = [
      service.name.en,
      service.name.bn,
      service.task.en,
      service.task.bn,
      service.result.en,
      service.result.bn,
      ...service.keywords
    ].join(' ').toLowerCase();
    return searchable.includes(normalized);
  });
};
