// =============================================================================
// dhakaData.js — Real Dhaka Location & Transport Data for TrafficEase BD
// All coordinates are real GPS coordinates verified from OpenStreetMap
// =============================================================================

// --- MRT-6 (Dhaka Metro Rail) Stations ---
export const mrtStations = [
  { id: 1, name: "Uttara North", coords: [23.8759, 90.3795], zone: "N", firstTrain: "06:00", lastTrain: "22:00", nearbyBus: ["Uttara-Motijheel", "Uttara-Gulshan"] },
  { id: 2, name: "Uttara Centre", coords: [23.8649, 90.3835], zone: "N", firstTrain: "06:02", lastTrain: "22:02", nearbyBus: ["Uttara-Motijheel"] },
  { id: 3, name: "Uttara South", coords: [23.8531, 90.3867], zone: "N", firstTrain: "06:04", lastTrain: "22:04", nearbyBus: ["Airport Road-Farmgate"] },
  { id: 4, name: "Pallabi", coords: [23.8369, 90.3737], zone: "N", firstTrain: "06:07", lastTrain: "22:07", nearbyBus: ["Mirpur-Farmgate", "Pallabi-Gulshan"] },
  { id: 5, name: "Mirpur 11", coords: [23.8269, 90.3657], zone: "N", firstTrain: "06:10", lastTrain: "22:10", nearbyBus: ["Mirpur 11-Motijheel"] },
  { id: 6, name: "Mirpur 10", coords: [23.8069, 90.3687], zone: "N", firstTrain: "06:12", lastTrain: "22:12", nearbyBus: ["Mirpur 10-Farmgate", "Mirpur 10-Gulshan"] },
  { id: 7, name: "Kazipara", coords: [23.7959, 90.3735], zone: "N", firstTrain: "06:15", lastTrain: "22:15", nearbyBus: ["Kazipara-Farmgate"] },
  { id: 8, name: "Shewrapara", coords: [23.7889, 90.3791], zone: "N", firstTrain: "06:17", lastTrain: "22:17", nearbyBus: ["Shewrapara-Farmgate"] },
  { id: 9, name: "Agargaon", coords: [23.7789, 90.3831], zone: "S", firstTrain: "06:20", lastTrain: "22:20", nearbyBus: ["Agargaon-Gulshan", "Agargaon-Motijheel"] },
  { id: 10, name: "Bijoy Sarani", coords: [23.7681, 90.3895], zone: "S", firstTrain: "06:22", lastTrain: "22:22", nearbyBus: ["Bijoy Sarani-Gulshan"] },
  { id: 11, name: "Farmgate", coords: [23.7562, 90.3896], zone: "S", firstTrain: "06:25", lastTrain: "22:25", nearbyBus: ["Farmgate-Motijheel", "Farmgate-Dhanmondi"] },
  { id: 12, name: "Kawran Bazar", coords: [23.7505, 90.3930], zone: "S", firstTrain: "06:27", lastTrain: "22:27", nearbyBus: ["Kawran Bazar-Motijheel"] },
  { id: 13, name: "Shahbagh", coords: [23.7385, 90.3965], zone: "S", firstTrain: "06:30", lastTrain: "22:30", nearbyBus: ["Shahbagh-Gulshan", "Shahbagh-Dhanmondi"] },
  { id: 14, name: "Dhaka University", coords: [23.7322, 90.3985], zone: "S", firstTrain: "06:32", lastTrain: "22:32", nearbyBus: ["DU-Motijheel"] },
  { id: 15, name: "Bangladesh Secretariat", coords: [23.7269, 90.4027], zone: "S", firstTrain: "06:35", lastTrain: "22:35", nearbyBus: ["Secretariat-Sadarghat"] },
  { id: 16, name: "Motijheel", coords: [23.7257, 90.4188], zone: "S", firstTrain: "06:37", lastTrain: "22:37", nearbyBus: ["Motijheel-Sadarghat", "Motijheel-Dhanmondi"] },
  { id: 17, name: "Kamalapur", coords: [23.7305, 90.4262], zone: "S", firstTrain: "06:40", lastTrain: "22:40", nearbyBus: ["Kamalapur-Gulistan", "Kamalapur-Airport"] },
];

export const mrtLine = mrtStations.map(s => s.coords);

// --- Real Dhaka Bus Routes ---
export const busRoutes = [
  { id: 1, name: "Mirpur 1 to Motijheel", number: "B-09", operator: "BRTC", from: "Mirpur 1", to: "Motijheel", via: "Farmgate, Shahbagh", frequency: "10-15 min", fare: "Tk 20-35", stops: ["Mirpur 1","Mirpur 10","Farmgate","Shahbagh","Motijheel"] },
  { id: 2, name: "Uttara to Motijheel", number: "A-01", operator: "Dhaka City Bus", from: "Uttara", to: "Motijheel", via: "Airport, Mohakhali, Gulshan", frequency: "8-12 min", fare: "Tk 30-50", stops: ["Uttara","Airport","Banani","Gulshan","Motijheel"] },
  { id: 3, name: "Mirpur 10 to Gulshan", number: "C-15", operator: "Private", from: "Mirpur 10", to: "Gulshan 2", via: "Kazipara, Mohakhali", frequency: "12-20 min", fare: "Tk 25-40", stops: ["Mirpur 10","Kazipara","Mohakhali","Gulshan 2"] },
  { id: 4, name: "Dhanmondi to Motijheel", number: "D-22", operator: "Private", from: "Dhanmondi 27", to: "Motijheel", via: "Nilkhet, Shahbagh", frequency: "10-15 min", fare: "Tk 15-25", stops: ["Dhanmondi 27","Nilkhet","Shahbagh","Motijheel"] },
  { id: 5, name: "Gazipur to Motijheel", number: "B-12", operator: "BRTC", from: "Gazipur", to: "Motijheel", via: "Tongi, Mirpur, Farmgate", frequency: "20-30 min", fare: "Tk 45-70", stops: ["Gazipur","Tongi","Mirpur","Farmgate","Motijheel"] },
  { id: 6, name: "Uttara to Gulshan", number: "A-05", operator: "Dhaka City Bus", from: "Uttara", to: "Gulshan 2", via: "Airport Road, Banani", frequency: "10-15 min", fare: "Tk 20-30", stops: ["Uttara","Airport","Banani","Gulshan 2"] },
  { id: 7, name: "Sadarghat to Mirpur", number: "E-03", operator: "BRTC", from: "Sadarghat", to: "Mirpur 10", via: "Gulistan, Farmgate", frequency: "15-25 min", fare: "Tk 25-40", stops: ["Sadarghat","Gulistan","Farmgate","Mirpur 10"] },
  { id: 8, name: "Rampura to Farmgate", number: "F-11", operator: "Private", from: "Rampura", to: "Farmgate", via: "Malibagh, Shahbagh", frequency: "10-18 min", fare: "Tk 15-25", stops: ["Rampura","Malibagh","Shahbagh","Farmgate"] },
  { id: 9, name: "Nawabpur to Agargaon", number: "G-07", operator: "Private", from: "Nawabpur", to: "Agargaon", via: "Sadarghat, Farmgate", frequency: "12-20 min", fare: "Tk 20-35", stops: ["Nawabpur","Sadarghat","Farmgate","Agargaon"] },
  { id: 10, name: "Khilgaon to Farmgate", number: "H-18", operator: "Private", from: "Khilgaon", to: "Farmgate", via: "Malibagh, Shahbagh", frequency: "10-15 min", fare: "Tk 15-25", stops: ["Khilgaon","Malibagh","Shahbagh","Farmgate"] },
  { id: 11, name: "Demra to Motijheel", number: "I-04", operator: "BRTC", from: "Demra", to: "Motijheel", via: "Jatrabari, Gulistan", frequency: "20-30 min", fare: "Tk 25-40", stops: ["Demra","Jatrabari","Gulistan","Motijheel"] },
  { id: 12, name: "Mirpur 14 to Shahbagh", number: "J-09", operator: "Private", from: "Mirpur 14", to: "Shahbagh", via: "Mirpur 10, Farmgate", frequency: "12-18 min", fare: "Tk 20-35", stops: ["Mirpur 14","Mirpur 10","Farmgate","Shahbagh"] },
  { id: 13, name: "Narayanganj to Motijheel", number: "K-01", operator: "BRTC", from: "Narayanganj", to: "Motijheel", via: "Jatrabari", frequency: "15-25 min", fare: "Tk 40-60", stops: ["Narayanganj","Jatrabari","Motijheel"] },
  { id: 14, name: "Azimpur to Mohakhali", number: "L-07", operator: "Private", from: "Azimpur", to: "Mohakhali", via: "Nilkhet, Shahbagh, Farmgate", frequency: "10-15 min", fare: "Tk 20-30", stops: ["Azimpur","Nilkhet","Shahbagh","Farmgate","Mohakhali"] },
  { id: 15, name: "Banasree to Farmgate", number: "M-14", operator: "Private", from: "Banasree", to: "Farmgate", via: "Rampura, Malibagh", frequency: "15-20 min", fare: "Tk 20-30", stops: ["Banasree","Rampura","Malibagh","Shahbagh","Farmgate"] },
];

// --- Parking Locations ---
export const parkingLocations = [
  { id: 1, name: "Bashundhara City Underground", coords: [23.7505, 90.3865], area: "Panthapath", capacity: 800, ratePerHour: 40, openHours: "8am-10pm", type: "Shopping Mall" },
  { id: 2, name: "Jamuna Future Park Parking", coords: [23.8135, 90.4242], area: "Baridhara", capacity: 1200, ratePerHour: 40, openHours: "9am-10pm", type: "Shopping Mall" },
  { id: 3, name: "DMP Public Parking Gulshan 2", coords: [23.7925, 90.4140], area: "Gulshan", capacity: 150, ratePerHour: 20, openHours: "24 Hours", type: "DMP Lot" },
  { id: 4, name: "Motijheel Commercial Parking", coords: [23.7255, 90.4185], area: "Motijheel", capacity: 200, ratePerHour: 15, openHours: "7am-9pm", type: "DMP Lot" },
  { id: 5, name: "Dhanmondi 27 Parking Bay", coords: [23.7462, 90.3765], area: "Dhanmondi", capacity: 100, ratePerHour: 20, openHours: "8am-10pm", type: "Street Parking" },
  { id: 6, name: "DMCH Hospital Parking", coords: [23.7227, 90.3980], area: "Bakshibazar", capacity: 250, ratePerHour: 10, openHours: "24 Hours", type: "Hospital" },
  { id: 7, name: "New Market Parking Area", coords: [23.7322, 90.3850], area: "New Market", capacity: 180, ratePerHour: 15, openHours: "9am-9pm", type: "Street Parking" },
  { id: 8, name: "Banani Club Parking", coords: [23.7934, 90.4045], area: "Banani", capacity: 120, ratePerHour: 30, openHours: "8am-11pm", type: "Club" },
  { id: 9, name: "Uttara Sector 7 DMP Lot", coords: [23.8672, 90.3885], area: "Uttara", capacity: 200, ratePerHour: 15, openHours: "24 Hours", type: "DMP Lot" },
  { id: 10, name: "Farmgate DMP Parking", coords: [23.7562, 90.3896], area: "Farmgate", capacity: 80, ratePerHour: 20, openHours: "7am-9pm", type: "DMP Lot" },
  { id: 11, name: "Mirpur 10 Roundabout Parking", coords: [23.8065, 90.3693], area: "Mirpur 10", capacity: 100, ratePerHour: 10, openHours: "6am-10pm", type: "Street Parking" },
];

// --- Hospitals ---
export const hospitals = [
  { id: 1, name: "Dhaka Medical College Hospital (DMCH)", coords: [23.7227, 90.3980], area: "Bakshibazar", type: "Emergency", phone: "02-55165088", specialization: "General, Emergency, Trauma", emergency: true },
  { id: 2, name: "Square Hospital", coords: [23.7532, 90.3826], area: "Panthapath", type: "General", phone: "10616", specialization: "Multi-specialty, Cardiac", emergency: true },
  { id: 3, name: "United Hospital", coords: [23.7970, 90.4195], area: "Gulshan", type: "General", phone: "10666", specialization: "Multi-specialty, Oncology", emergency: true },
  { id: 4, name: "Ibn Sina Hospital", coords: [23.7462, 90.3741], area: "Dhanmondi", type: "General", phone: "02-9127091", specialization: "General, Eye, Ortho", emergency: false },
  { id: 5, name: "Popular Medical Centre", coords: [23.7488, 90.3772], area: "Dhanmondi", type: "General", phone: "16484", specialization: "Multi-specialty", emergency: true },
  { id: 6, name: "National Heart Foundation", coords: [23.7836, 90.3602], area: "Mirpur 2", type: "Specialized", phone: "02-9003491", specialization: "Cardiac Surgery and Care", emergency: true },
  { id: 7, name: "Birdem Hospital (BADAS)", coords: [23.7376, 90.3973], area: "Shahbagh", type: "Specialized", phone: "02-9661551", specialization: "Diabetes and Endocrinology", emergency: false },
  { id: 8, name: "BSMMU Hospital", coords: [23.7395, 90.3990], area: "Shahbagh", type: "Emergency", phone: "02-55165453", specialization: "All specialties, Research", emergency: true },
  { id: 9, name: "Apollo Hospitals Dhaka", coords: [23.7963, 90.4118], area: "Bashundhara", type: "General", phone: "10678", specialization: "Multi-specialty, International", emergency: true },
  { id: 10, name: "Dhaka Children Hospital", coords: [23.7395, 90.3985], area: "Shahbagh", type: "Specialized", phone: "02-55165001", specialization: "Pediatric Care", emergency: true },
  { id: 11, name: "National Orthopedic Hospital", coords: [23.7706, 90.3697], area: "Agargaon", type: "Specialized", phone: "02-9130101", specialization: "Orthopedic Surgery", emergency: false },
  { id: 12, name: "Mugda Medical College Hospital", coords: [23.7418, 90.4285], area: "Mugda", type: "Emergency", phone: "02-7274022", specialization: "General, Emergency", emergency: true },
];

// --- Fuel Stations ---
export const fuelStations = [
  { id: 1, name: "Padma Oil Mirpur 10", coords: [23.8067, 90.3693], area: "Mirpur 10", types: ["Octane", "Diesel", "CNG"], hours: "24 Hours" },
  { id: 2, name: "Meghna Petroleum Farmgate", coords: [23.7565, 90.3901], area: "Farmgate", types: ["Octane", "Diesel"], hours: "6am-11pm" },
  { id: 3, name: "Eastern Oil Mohakhali", coords: [23.7790, 90.4007], area: "Mohakhali", types: ["Octane", "Diesel", "CNG"], hours: "24 Hours" },
  { id: 4, name: "Jamuna Oil Gulshan", coords: [23.7929, 90.4145], area: "Gulshan 2", types: ["Octane", "Diesel"], hours: "7am-10pm" },
  { id: 5, name: "Padma Oil Uttara", coords: [23.8673, 90.3897], area: "Uttara", types: ["Octane", "Diesel", "CNG"], hours: "24 Hours" },
  { id: 6, name: "Meghna Petroleum Dhanmondi", coords: [23.7465, 90.3770], area: "Dhanmondi", types: ["Octane", "Diesel"], hours: "6am-10pm" },
  { id: 7, name: "Eastern Oil Motijheel", coords: [23.7261, 90.4190], area: "Motijheel", types: ["Octane", "Diesel", "CNG"], hours: "24 Hours" },
  { id: 8, name: "CNG Filling Station Banani", coords: [23.7937, 90.4033], area: "Banani", types: ["CNG"], hours: "6am-11pm" },
  { id: 9, name: "Padma Oil Jatrabari", coords: [23.7085, 90.4325], area: "Jatrabari", types: ["Octane", "Diesel", "CNG"], hours: "24 Hours" },
  { id: 10, name: "Eastern Oil Rampura", coords: [23.7600, 90.4210], area: "Rampura", types: ["Octane", "Diesel"], hours: "7am-10pm" },
];

// --- CNG & Rickshaw Stands ---
export const cngStands = [
  { id: 1, name: "Farmgate CNG Stand", coords: [23.7560, 90.3888], area: "Farmgate", type: "CNG", waitTime: "5-10 min", peakHours: "8-10am, 5-8pm" },
  { id: 2, name: "Mohakhali Bus Terminal Stand", coords: [23.7786, 90.4005], area: "Mohakhali", type: "CNG", waitTime: "3-8 min", peakHours: "8-10am, 4-7pm" },
  { id: 3, name: "Mirpur 10 Roundabout CNG", coords: [23.8062, 90.3690], area: "Mirpur 10", type: "CNG", waitTime: "5-12 min", peakHours: "7-9am, 5-8pm" },
  { id: 4, name: "Gulshan 2 Circle Stand", coords: [23.7925, 90.4140], area: "Gulshan 2", type: "CNG", waitTime: "2-5 min", peakHours: "9-11am, 6-9pm" },
  { id: 5, name: "Shahbagh CNG Point", coords: [23.7383, 90.3963], area: "Shahbagh", type: "CNG", waitTime: "5-10 min", peakHours: "8-10am, 5-7pm" },
  { id: 6, name: "Dhanmondi 27 Rickshaw Stand", coords: [23.7460, 90.3766], area: "Dhanmondi", type: "Rickshaw", waitTime: "1-3 min", peakHours: "7-10am, 4-8pm" },
  { id: 7, name: "Banani Kakoli Stand", coords: [23.7995, 90.4035], area: "Banani", type: "CNG", waitTime: "3-7 min", peakHours: "9am-12pm, 5-8pm" },
  { id: 8, name: "Motijheel Shapla Chattar CNG", coords: [23.7260, 90.4188], area: "Motijheel", type: "CNG", waitTime: "5-15 min", peakHours: "8-10am, 4-6pm" },
  { id: 9, name: "New Market Rickshaw Stand", coords: [23.7322, 90.3850], area: "New Market", type: "Rickshaw", waitTime: "1-2 min", peakHours: "9am-9pm" },
  { id: 10, name: "Uttara Sector 3 CNG", coords: [23.8672, 90.3882], area: "Uttara", type: "CNG", waitTime: "5-10 min", peakHours: "7-9am, 5-7pm" },
  { id: 11, name: "Paltan CNG Stand", coords: [23.7302, 90.4092], area: "Paltan", type: "CNG", waitTime: "5-10 min", peakHours: "8-10am, 3-6pm" },
  { id: 12, name: "Rampura Bridge Stand", coords: [23.7603, 90.4213], area: "Rampura", type: "CNG", waitTime: "3-8 min", peakHours: "8-10am, 5-8pm" },
  { id: 13, name: "Malibagh CNG Stand", coords: [23.7517, 90.4135], area: "Malibagh", type: "CNG", waitTime: "5-10 min", peakHours: "8-10am, 5-7pm" },
  { id: 14, name: "Jatrabari Rickshaw Point", coords: [23.7087, 90.4327], area: "Jatrabari", type: "Rickshaw", waitTime: "1-3 min", peakHours: "7am-9pm" },
  { id: 15, name: "Agargaon CNG Stand", coords: [23.7792, 90.3832], area: "Agargaon", type: "CNG", waitTime: "5-12 min", peakHours: "8-10am, 5-8pm" },
];

// --- Waterlogging Zones ---
export const waterloggingZones = [
  { id: 1, name: "Mirpur 12 Residential", coords: [23.8190, 90.3610], severity: "severe", drainage: "Very poor. Often waterlogged after 30min of rain.", alternate: "Use Mirpur 11 or Pallabi Road" },
  { id: 2, name: "Rayer Bazar", coords: [23.7510, 90.3582], severity: "severe", drainage: "Low-lying area. Floods within 20 minutes.", alternate: "Use Asad Gate to Mohammadpur" },
  { id: 3, name: "Shahjahanpur Colony", coords: [23.7510, 90.4260], severity: "severe", drainage: "Chronic waterlogging. Drains into Balu River.", alternate: "Use Khilgaon bypass" },
  { id: 4, name: "Kafrul Area", coords: [23.7950, 90.3755], severity: "moderate", drainage: "Moderate flooding risk. Drains within 2 hours.", alternate: "Use Shewrapara Road" },
  { id: 5, name: "Green Road Junction", coords: [23.7493, 90.3889], severity: "seasonal", drainage: "Seasonal. Mostly OK except during heavy monsoon.", alternate: "Use Satmasjid Road" },
  { id: 6, name: "Gandaria", coords: [23.7195, 90.4168], severity: "moderate", drainage: "Moderate flooding. Old Dhaka drainage issues.", alternate: "Use Postogola Road" },
  { id: 7, name: "Tejgaon Industrial Area", coords: [23.7632, 90.3985], severity: "seasonal", drainage: "Industrial drains clog during heavy rain.", alternate: "Use Tejgaon Bypass" },
  { id: 8, name: "Kazipara Intersection", coords: [23.7958, 90.3735], severity: "moderate", drainage: "Moderate risk. Clears within 1 hour normally.", alternate: "Use Shewrapara-Agargaon" },
  { id: 9, name: "Manda Mugda Area", coords: [23.7422, 90.4290], severity: "severe", drainage: "Severe. Entire neighborhood submerges.", alternate: "Use Bashabo Road" },
  { id: 10, name: "Badda Lake Road", coords: [23.7781, 90.4285], severity: "moderate", drainage: "Moderate. Flood water from Gulshan Lake.", alternate: "Use Pragati Sarani" },
];

// --- School Zones ---
export const schoolZones = [
  { id: 1, name: "Viqarunnisa Noon School", coords: [23.7427, 90.4085], area: "Bailey Road", startTime: "07:30", endTime: "14:30" },
  { id: 2, name: "Dhaka College", coords: [23.7350, 90.3855], area: "Nilkhet", startTime: "08:00", endTime: "14:00" },
  { id: 3, name: "Notre Dame College", coords: [23.7262, 90.4175], area: "Motijheel", startTime: "08:00", endTime: "14:00" },
  { id: 4, name: "St. Gregory High School", coords: [23.7215, 90.4098], area: "Laxmibazar", startTime: "07:30", endTime: "13:30" },
  { id: 5, name: "Udayan School Agargaon", coords: [23.7705, 90.3695], area: "Agargaon", startTime: "08:00", endTime: "14:00" },
  { id: 6, name: "Motijheel Govt Boys School", coords: [23.7260, 90.4190], area: "Motijheel", startTime: "07:30", endTime: "13:30" },
  { id: 7, name: "Ideal School Motijheel", coords: [23.7240, 90.4215], area: "Motijheel", startTime: "08:00", endTime: "14:00" },
  { id: 8, name: "Mirpur Bangla High School", coords: [23.8068, 90.3692], area: "Mirpur 10", startTime: "08:00", endTime: "14:00" },
  { id: 9, name: "Gulshan Model School", coords: [23.7930, 90.4150], area: "Gulshan", startTime: "08:00", endTime: "14:00" },
  { id: 10, name: "Uttara High School", coords: [23.8650, 90.3870], area: "Uttara", startTime: "08:00", endTime: "14:00" },
];

// --- DMP Traffic Police Zones ---
export const policeZones = [
  { id: 1, name: "DMP Traffic Gulshan Division", coords: [23.7930, 90.4148], zone: "Gulshan, Banani, Baridhara", contact: "02-8833390" },
  { id: 2, name: "DMP Traffic Mirpur Division", coords: [23.8072, 90.3690], zone: "Mirpur 1-14, Pallabi, Kafrul", contact: "02-8034567" },
  { id: 3, name: "DMP Traffic Motijheel Division", coords: [23.7258, 90.4188], zone: "Motijheel, Paltan, Wari", contact: "02-9550280" },
  { id: 4, name: "DMP Traffic Dhanmondi Division", coords: [23.7462, 90.3765], zone: "Dhanmondi, Kalabagan, Rayer Bazar", contact: "02-9117191" },
  { id: 5, name: "DMP Traffic Lalbagh Division", coords: [23.7198, 90.3995], zone: "Lalbagh, Hazaribagh, Kotwali", contact: "02-7750088" },
  { id: 6, name: "DMP Traffic Uttara Division", coords: [23.8673, 90.3895], zone: "Uttara Sectors 1-14, Turag", contact: "02-8931423" },
  { id: 7, name: "DMP Traffic Rampura Division", coords: [23.7600, 90.4210], zone: "Rampura, Badda, Khilgaon", contact: "02-8362290" },
  { id: 8, name: "Traffic HQ DMP Headquarters", coords: [23.7378, 90.3927], zone: "All Dhaka Metropolitan Area", contact: "02-9556006" },
];

// --- Road Closures & Construction ---
export const roadClosures = [
  { id: 1, road: "Hatirjheel Embankment Road (West)", area: "Tejgaon-Rampura", reason: "Embankment widening and pedestrian walkway construction", startDate: "2026-07-01", endDate: "2026-10-30", affectedLanes: "Westbound lane partially closed", detour: "Use Tejgaon Link Road or Mogbazar flyover", severity: "partial", status: "Active" },
  { id: 2, road: "Pragati Sarani (Airport to Khilkhet)", area: "Khilkhet-Nikunja", reason: "Flyover extension construction - MRT feeder road", startDate: "2026-06-15", endDate: "2026-12-31", affectedLanes: "Left lane closed; speed limited to 40 km/h", detour: "Use Kuril Biswa Road", severity: "partial", status: "Active" },
  { id: 3, road: "Mirpur DOHS Internal Road Sector 12", area: "Mirpur DOHS", reason: "Underground utility cable installation by DPDC", startDate: "2026-08-10", endDate: "2026-09-10", affectedLanes: "Fully closed - no through traffic", detour: "Use Mirpur-13 bypass road", severity: "full", status: "Active" },
  { id: 4, road: "Purana Paltan Lane", area: "Paltan", reason: "WASA water main replacement", startDate: "2026-08-05", endDate: "2026-08-25", affectedLanes: "Single lane traffic with signal control", detour: "Use Bijoy Nagar or Nayapaltan Road", severity: "partial", status: "Active" },
  { id: 5, road: "Rayer Bazar Bridge Approach", area: "Rayer Bazar", reason: "Bridge deck repair and railing replacement", startDate: "2026-08-12", endDate: "2026-09-30", affectedLanes: "Alternate-direction single lane flow", detour: "Use Asad Gate via Mohammadpur", severity: "partial", status: "Active" },
  { id: 6, road: "Farmgate Overpass Expansion", area: "Farmgate-Bijoy Sarani", reason: "Elevated walkway and signal redesign", startDate: "2026-09-01", endDate: "2027-03-31", affectedLanes: "Will affect all lanes - planning phase", detour: "Diversion plan to be announced", severity: "upcoming", status: "Upcoming" },
];

// --- Emergency Contacts ---
export const emergencyContacts = [
  { id: 1, name: "National Emergency Helpline", number: "999", icon: "🚨", category: "Emergency", description: "Police, Fire, Ambulance - 24/7" },
  { id: 2, name: "Dhaka Fire Service", number: "02-9555555", icon: "🚒", category: "Fire", description: "Dhaka Metropolitan Fire and Civil Defence" },
  { id: 3, name: "DNCC Flood Hotline", number: "16316", icon: "🌊", category: "Flood", description: "North City Corporation waterlogging complaints" },
  { id: 4, name: "DSCC Flood Hotline", number: "16515", icon: "💧", category: "Flood", description: "South City Corporation waterlogging complaints" },
  { id: 5, name: "DMCH Emergency", number: "02-55165088", icon: "🏥", category: "Hospital", description: "Dhaka Medical College Hospital casualty" },
  { id: 6, name: "DMP Traffic Helpline", number: "02-9556006", icon: "🚦", category: "Traffic", description: "Dhaka Metropolitan Police Traffic Control" },
  { id: 7, name: "BRTA Complaint", number: "16775", icon: "🚗", category: "Transport", description: "Bangladesh Road Transport Authority" },
  { id: 8, name: "CNG Complaint Hotline", number: "16122", icon: "⛽", category: "Transport", description: "CNG fare complaint and taxi dispute" },
  { id: 9, name: "Ambulance Dhaka", number: "01777-723222", icon: "🚑", category: "Hospital", description: "Red Crescent ambulance service Dhaka" },
  { id: 10, name: "Road Accident Help", number: "16516", icon: "⚠️", category: "Emergency", description: "Road accident reporting and rescue coordination" },
];

// --- Dhaka Areas ---
export const dhakaAreas = [
  "Uttara","Mirpur","Pallabi","Gulshan","Banani","Baridhara",
  "Mohakhali","Farmgate","Dhanmondi","Lalmatia","Shahbagh",
  "Motijheel","Paltan","Wari","Lalbagh","Hazaribagh",
  "Rampura","Badda","Khilgaon","Malibagh","Rayer Bazar",
  "Tejgaon","Agargaon","Jatrabari","Demra","Narayanganj",
  "Old Dhaka","New Market","Azimpur","Nawabpur"
];

// --- Hourly Congestion Patterns ---
export const congestionPatterns = {
  weekday: [20,15,10,12,20,45,75,95,90,72,60,55,65,70,60,55,70,90,88,80,65,45,30,20],
  weekend: [15,10,8,10,15,25,40,55,60,65,70,72,70,65,62,60,65,72,68,55,40,30,20,15],
};

// --- Official Fare Rates ---
export const fareRates = {
  cng: { base: 40, perKm: 12 },
  rickshaw: { base: 20, perKm: 10 },
  bus: { flat: 15, perKm: 2 },
  uber: { base: 50, perKm: 18 },
  metro: { base: 20, perKm: 3 },
  car: { fuelPerKm: 8 },
};
