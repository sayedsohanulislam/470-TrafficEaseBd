# TrafficEase BD: Intelligent Multi-Modal Urban Mobility Platform

[![Release](https://img.shields.io/badge/Release-v1.1.0-blue.svg)](https://github.com/sayedsohanulislam/470-TrafficEaseBd)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Backend Tests](https://img.shields.io/badge/Tests-33%20Passed-success.svg)]()
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)]()
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

TrafficEase BD is a modern, full-stack multi-modal urban mobility and traffic management platform designed for Dhaka city. It provides commuters with real-time route optimization, public transit routing, transparent fare estimates, hazard reporting, and authorities with an integrated operations dashboard.

---

## 🚀 Tech Stack

- **Frontend:** React.js, CSS3, React-Leaflet, Google Maps API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Architecture:** Layered MVC (React Views, Express Routes, Controllers, Business Services, Mongoose Models)
- **Deployment:** Vercel (Frontend & Serverless API Gateway)

---

## 🌟 Key Platform Modules

- **Dynamic Traffic & Departure Guidance:** Real-time citywide traffic analysis with plain-language departure guidance (*"Good time to leave"*, *"Leave with extra time"*, *"Wait a little"*).
- **Interactive Live Map:** Multi-layer map featuring corridor congestion overlays, live vehicle markers, and incident pins.
- **Incident Management Lifecycle:** Crowdsourced reporting for road damages, waterlogging, and collisions with admin review and status workflows (*Under Review → Investigating → Resolved*).
- **Fleet & Vehicle Monitoring:** Registration, telemetry status, and vehicle capacity tracking.
- **Authority Safety Broadcasting:** High-priority public alert notifications broadcast to citizens.
- **Parking & Amenities:** Parking Koi integration for real-time space availability, rates, and operating hours.
- **Public Transit & Metro:** MRT-6 station guide with headways and timetables, plus origin-destination bus route planner.
- **Operations Dashboard:** Comprehensive metrics for city authorities and administrators.

---

## 🎯 20 User-Facing Citizen Services

1. **Route Planner:** Multi-criteria road navigation and travel-time comparisons.
2. **Fare Estimator:** Official BRTA baseline fare calculation for CNG auto-rickshaws and cycle-rickshaws.
3. **Live Road Incidents:** Real-time map displaying reported traffic obstructions.
4. **Trackable Incident Reporting:** Citizen reporting pipeline with authenticated tracking.
5. **MRT-6 Metro Guide:** Dhaka metro stations, schedules, and interchange info.
6. **Bus Route Finder:** Bus recommendation engine matching origin and destination stops.
7. **Parking Finder:** Nearest parking spots with tariff rates and hours.
8. **Emergency Hotlines:** 1-click dispatch to police, fire, and ambulance services.
9. **Waterlogging Detours:** Real-time waterlogged road avoidance and bypass suggestions.
10. **Fuel & CNG Finder:** Nearby filling stations with status and pricing.
11. **Departure Window Optimizer:** Congestion forecasting to pick the best travel time.
12. **Emergency Healthcare Finder:** Dhaka hospital directory with direct phone numbers.
13. **Active School Zones:** Alerts for high-pedestrian school zones during peak hours.
14. **CNG & Rickshaw Stands:** Verified local stand locations.
15. **Road Closures & Diversions:** Official road diversion notices and roadwork maps.
16. **Modal Cost Comparison:** Side-by-side travel expense comparisons across transit modes.
17. **Traffic Police Directory:** Area-wise division contacts and duty officer numbers.
18. **Incident Tracker:** Historical tracking of user-submitted reports and resolution status.
19. **Commute Saver:** Shortcut profiles for daily home-to-work travel patterns.
20. **Official Traffic Alerts:** Verified alerts issued by traffic control authorities.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables (.env)
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/trafficease_bd
# JWT_SECRET=your_jwt_secret_key

npm run dev
```

Run test suite:
```bash
npm test
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Optional: create frontend/.env if pointing to an external backend
# REACT_APP_API_URL=http://localhost:5000/api

npm start
```

Run tests:
```bash
npm test -- --watchAll=false
```

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and uptime | Public |
| `POST` | `/api/auth/register` | Register commuter or driver account | Public |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token | Public |
| `POST` | `/api/auth/demo-login` | 1-Click demo authentication session | Development |
| `GET` | `/api/summary` | Citywide mobility metrics summary | Public |
| `GET, POST` | `/api/incidents` | List or submit road incident reports | Authenticated |
| `GET, POST` | `/api/alerts` | Public traffic advisories and alerts | Public / Admin |
| `GET, POST` | `/api/vehicles` | Fleet management and status | Authority / Admin |
| `GET, POST` | `/api/parking` | Parking lot locations and occupancy | Public / Admin |
| `GET, POST` | `/api/signals` | Traffic signal operational status | Public / Admin |
| `GET, POST` | `/api/transit` | Transit routes and metro schedules | Public / Admin |
| `GET` | `/api/live-traffic` | Corridor speed, delays, and guidance | Public |
| `GET, POST` | `/api/operations` | Administrative operations and audit | Authority / Admin |

---

## 🔒 Security & Architecture

- **Layered MVC:** Clear division of responsibilities across `models`, `controllers`, `services`, `routes`, and React view components.
- **RBAC:** Four-tier Role-Based Access Control (`Commuter`, `Driver`, `Authority`, `Admin`).
- **Resilient Fallbacks:** In-memory fallback and offline data providers ensure core navigation and fare checks remain available even during temporary network interruptions.
- **Cloud Ready:** Optimized for containerized deployments and serverless environments via `vercel.json`.

---

## 📄 License & Attribution

Distributed under the MIT License. Developed for intelligent urban mobility in Bangladesh.
