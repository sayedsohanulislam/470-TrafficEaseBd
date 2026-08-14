# TrafficEase BD - CSE470 Software Engineering Project

## Project Title
TrafficEase BD: Intelligent Multi-Modal Urban Mobility and Traffic Management Platform

## Tech Stack
- Frontend: React.js + CSS + Leaflet.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: JWT + bcrypt
- Architecture: Layered MVC (React views, Express routes/controllers/services, Mongoose models)

## Implemented Modules
- JWT login and registration with commuter, driver, admin, and authority roles
- Bilingual, commuter-first traffic page with plain-language leave-now guidance and road-by-road delays
- Live traffic map with incident markers, vehicle markers, and colored corridor pressure overlays
- Incident reporting and incident status management
- Vehicle registration, fleet status, and vehicle statistics
- Public alert publishing
- Parking lot capacity and availability tracking
- Traffic signal monitoring
- Public transit route management
- Operations summary dashboard
- 20 task-based citizen services with search, five everyday-need groups, favorites, and direct deep links

## 20 User-Completable Services
1. Plan a road route
2. Check CNG and rickshaw fares
3. See reported road problems on a map
4. Submit a trackable road-problem report
5. Use the MRT-6 station guide
6. Find a bus by origin and destination
7. Find parking and check its rate and hours
8. Call the correct emergency service
9. Avoid waterlogged roads using alternate-road guidance
10. Find fuel or CNG stations
11. Choose a better departure time
12. Find a hospital and emergency phone number
13. Check currently active school zones
14. Find a CNG or rickshaw stand
15. Check road closures and detours
16. Compare journey costs across transport modes
17. Find and call the responsible traffic-police division
18. Track submitted incident reports
19. Save a daily home-to-work commute
20. Read official traffic alerts

Each service produces an observable result or next action—navigate, calculate, call, report, save, filter, or track. The canonical user-service-to-code mapping is maintained in `docs/CITIZEN_SERVICE_TRACEABILITY.md`. The older `docs/FEATURE_TRACEABILITY.md` now documents supporting technical and authority capabilities rather than the commuter-facing feature count.

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Optional: create .env file
npm run dev
npm test
```

### Frontend
```bash
cd frontend
npm install
npm start
npm test -- --watchAll=false
npm run build
```

### MongoDB
Use MongoDB Atlas or local MongoDB. Update MONGO_URI in backend/.env

## Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/trafficease_bd
JWT_SECRET=replace_with_a_unique_random_secret_of_at_least_32_characters
```

## Frontend Environment Variables
Create `frontend/.env` only if the backend is not running at `http://localhost:5000`.

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Main API Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/summary`
- `GET, POST /api/incidents`
- `GET, POST /api/vehicles`
- `GET, POST /api/alerts`
- `GET, POST /api/parking`
- `GET, POST /api/signals`
- `GET, POST /api/transit`
- `GET /api/live-traffic`
- `GET /api/live-traffic/features`
- `GET, POST /api/operations` (Authority/Admin)

## Notes
- Login/Registration is a platform prerequisite and is not part of the 20-service count. Most commuter services work without an account; tracking personal reports requires login.
- Public registration creates only Commuter or Driver accounts. Authority/Admin roles are provisioned separately.
- Local demo admin: `admin@trafficease.com` / `password123` (development only). This account approves or deletes community incident reports.
- The login screen also provides one-tap Commuter, Driver, Authority, and Admin demo sessions in local/demo mode.
- MVC responsibilities are separated across `models`, `controllers`, `routes`, `services`, `config`, and React views.
- Use GitHub and add faculty as collaborator.
