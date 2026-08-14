# TrafficEase BD — Complete Viva Preparation Guide

This document is your preparation handbook for tomorrow's project viva. It details exactly what to run, what links to show the examiner, how to walk through the presentation, and provides answers to typical Software Engineering viva questions.

---

## 1. Setup & Deployment Checklist

Make sure to verify both local and production statuses before starting:

### 1. **Production Deployment (Vercel)**
* **Verify Web UI is active:** Open [https://trafficease-bd.vercel.app](https://trafficease-bd.vercel.app) in your browser. The landing page should render.
* **Verify API is active:** Open [https://trafficease-bd.vercel.app/api/summary](https://trafficease-bd.vercel.app/api/summary) in your browser. It should return a JSON status object.

### 2. **Local Fallback Setup (If Vercel experiences high latency)**
* Start backend locally: `cd backend && npm run dev` (API at `http://localhost:5000`)
* Start frontend locally: `cd frontend && npm start` (App at `http://localhost:3000`)

---

## 2. The "Gold Mine" Links to Show Your Teacher

Examiners love to see organized documentation, evidence of individual contribution, and live API endpoints. Open these tabs in your browser *before* starting the presentation:

### 🌐 **Live Web Application & API Links (Vercel Production)**
* **Frontend SPA:** [https://trafficease-bd.vercel.app](https://trafficease-bd.vercel.app) (Main dashboard login and command panels)
* **Backend Summary Endpoint:** [https://trafficease-bd.vercel.app/api/summary](https://trafficease-bd.vercel.app/api/summary) (Show them the raw JSON payload to prove database integration)
* **Feature Traceability Endpoint:** [https://trafficease-bd.vercel.app/api/live-traffic/features](https://trafficease-bd.vercel.app/api/live-traffic/features) (Backend returns the full list of all 30 features as database objects)
* **Active Alert Broadcasts Feed:** [https://trafficease-bd.vercel.app/api/alerts](https://trafficease-bd.vercel.app/api/alerts)
* **Active Commuter Incidents Feed:** [https://trafficease-bd.vercel.app/api/incidents](https://trafficease-bd.vercel.app/api/incidents)

### 📁 **Contribution & Proof-of-Work Evidence (GitHub)**
* **Main Github Repo:** [https://github.com/sayedsohanulislam/470-TrafficEaseBd](https://github.com/sayedsohanulislam/470-TrafficEaseBd)
* **Feature Traceability Matrix:** [docs/FEATURE_TRACEABILITY.md](file:///d:/TrafficEase_BD_Redesigned/docs/FEATURE_TRACEABILITY.md) 
  *(Show them this file! It explicitly maps functional requirements FR-01 through FR-30 directly to code lead owners and proof of work).*
* **Git Contribution Logs:** [https://github.com/sayedsohanulislam/470-TrafficEaseBd/commits/main](https://github.com/sayedsohanulislam/470-TrafficEaseBd/commits/main) (Shows your commits and contribution logs)

---

## 3. Step-by-Step Presentation Script (The 11 Sprint Features)

Follow this sequence to present your 11 features smoothly. Under each step is the exact code file you can pull up in your editor (VS Code/Cursor) if the examiner says *"Show me the code for this."*

### **Part 1: The Interactive GIS Map & Coordinates**
1. **Show Google Maps Traffic Overlay (Feature 1)**
   * **In browser:** Go to `https://trafficease-bd.vercel.app/map`. Point to the colored road segments overlaying the map.
   * **Show the code:** [LiveMap.js:L354-L356](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveMap.js#L354-L356)
   * **Explanation:** *"We overlay Google Maps' real-time traffic tile server inside Leaflet using coordinate mapping, avoiding expensive SDK usage."*
2. **Show Nominatim Search Engine (Feature 2)**
   * **In browser:** On the map search box, type `Banani` or `Farmgate` and click search. Watch the map pan.
   * **Show the code:** [LiveMap.js:L106-L120](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveMap.js#L106-L120)
   * **Explanation:** *"We fetch OpenStreetMap's geocoding API asynchronously to map text queries to latitude/longitude coordinates."*
3. **Show Click-to-Pin Location Picker (Feature 3)**
   * **In browser:** Click `Report Incident` on navbar. Click anywhere on the map to drop a red pin. Notice the latitude and longitude inputs populate automatically.
   * **Show the code:** [ReportIncident.js:L27-L40](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/ReportIncident.js#L27-L40) (`LocationPicker` component)
   * **Explanation:** *"We listen to map click events using Leaflet's coordinate projection system and set our form states."*

### **Part 2: The Operations Dashboard & Purging**
4. **Show Incident Purging Handler (Feature 7)**
   * **In browser:** Log in as Administrator (`admin@trafficease.com` / `admin123`). Go to the Operations Dashboard (`https://trafficease-bd.vercel.app/dashboard`). Locate an incident and click **Delete**.
   * **Show the code:**
     * Frontend: [Dashboard.js:L57-L66](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/Dashboard.js#L57-L66) (`handleDeleteIncident`)
     * Backend Endpoint: [incidentRoutes.js:L19](file:///d:/TrafficEase_BD_Redesigned/backend/routes/incidentRoutes.js#L19) (`DELETE /api/incidents/:id`)
     * Backend Controller: [incidentController.js:L116-L131](file:///d:/TrafficEase_BD_Redesigned/backend/controllers/incidentController.js#L116-L131) (`deleteIncident`)
   * **Explanation:** *"Authorized operations staff can purge mock or resolved incidents. The request is processed only after backend JWT middleware validates user role policies."*

### **Part 3: The Live Command Center & Simulators**
Navigate to the Live Traffic Hub (`https://trafficease-bd.vercel.app/live-traffic`) to show the simulator features:
5. **Show Real-time Congestion Trend Chart (Feature 6)**
   * **In browser:** Show the line graph displaying network delays over time.
   * **Show the code:** [LiveTraffic.js:L151-L166](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveTraffic.js#L151-L166)
   * **Explanation:** *"We construct raw SVG line and area paths on the fly based on historical state arrays to build lightweight, zero-dependency charts."*
6. **Show Corridor Load Indicators (Feature 9)**
   * **In browser:** Scroll to 'Live Corridor Pressure'. Show the colored bars indicating delay percentage. Click a row to show details on the right panel.
   * **Show the code:** [LiveTraffic.js:L1224-L1246](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveTraffic.js#L1224-L1246)
   * **Explanation:** *"Loops over monitored corridors to render load progress tracks using CSS variables dynamically updated by state."*
7. **Show Adaptive Signal Timing Calculator (Feature 8)**
   * **In browser:** Select Feature Module **05 (Adaptive signal timing)** in the Simulator. Move the demand slider and show the calculated optimized green light seconds changing dynamically.
   * **Show the code:** [trafficCalculations.js:L20-L24](file:///d:/TrafficEase_BD_Redesigned/frontend/src/services/trafficCalculations.js#L20-L24) (`adaptiveSignalPlan`)
   * **Explanation:** *"Calculates traffic light durations based on load. High-congestion streets receive up to 90 seconds of priority green timing."*
8. **Show Multimodal Travel Duration & ETA Estimator (Feature 4)**
   * **In browser:** Select Feature Module **26 (ETA comparison)** in the Simulator. Move the distance slider and compare Car vs. MRT vs. Bus travel times.
   * **Show the code:** [trafficCalculations.js:L28-L35](file:///d:/TrafficEase_BD_Redesigned/frontend/src/services/trafficCalculations.js#L28-L35) (`etaComparison`)
   * **Explanation:** *"Performs duration scoring based on distance parameters, incorporating overhead components (waiting/transit headways)."*
9. **Show Weather & Flood Sensor Risk Estimators (Feature 5)**
   * **In browser:** Select Feature Module **11 (Weather impact)**. Move the slider to show risk scores. Then select Module **12 (Flood-prone road)**. Adjust water depth to show vehicle clearance restrictions.
   * **Show the code:** [trafficCalculations.js:L26](file:///d:/TrafficEase_BD_Redesigned/frontend/src/services/trafficCalculations.js#L26) (`weatherRiskScore`)
   * **Explanation:** *"Simulates weather alerts. When water logging depths exceed 18 inches, the system triggers alerts stating that small vehicles must divert."*
10. **Show Signal Failure Controller Alerts (Feature 10)**
    * **In browser:** Select Feature Module **06 (Signal failure alerts)**. Toggle the checkpoints on. Show the flashing red alerts warning that dispatcher crews are required.
    * **Show the code:** [LiveTraffic.js:L378-L414](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveTraffic.js#L378-L414)
    * **Explanation:** *"Simulates traffic control failures, sending audit alarms and warning indicators to the controller console."*
11. **Show Interactive Parking Spot Allocator (Feature 11)**
    * **In browser:** Select Feature Module **18 (Parking availability)**. Click the P1 to P12 buttons to reserve slots. Watch their colors toggle and the available slots count decrease.
    * **Show the code:** [LiveTraffic.js:L719-L754](file:///d:/TrafficEase_BD_Redesigned/frontend/src/pages/LiveTraffic.js#L719-L754)
    * **Explanation:** *"Simulates a real-time reservation grid by binding button states to a boolean array in our component state."*

---

## 4. Expected Viva Questions & Model Answers

### 🛡️ **Authentication & Authorization**
* **Q: How does the server authenticate API calls?**
  * *A:* We use JWT (JSON Web Tokens). When a user registers or logs in, the backend signs a token containing the user ID and role using a secret string (`JWT_SECRET`). The client stores it locally. For protected routes, the client includes the token in the `Authorization` HTTP header.
* **Q: How do you enforce role-based access control (RBAC)?**
  * *A:* We created a backend middleware called `allowRoles` in [authMiddleware.js](file:///d:/TrafficEase_BD_Redesigned/backend/middleware/authMiddleware.js). It checks the decoded JWT role against the authorized roles for that endpoint. If the user doesn't have permissions (e.g., a commuter trying to delete an incident), the server blocks the request with a `403 Forbidden` response.

### 🗺️ **GIS & Leaflet Integration**
* **Q: What coordinate reference system does Leaflet use?**
  * *A:* It uses EPSG:3857 (Spherical Mercator), which is standard for web maps like OpenStreetMap and Google Maps.
* **Q: How do you query spatial coordinates in MongoDB?**
  * *A:* We define the `location` field as a GeoJSON Point object: `{ type: "Point", coordinates: [Lng, Lat] }`. Then, we apply a Mongoose spatial index: `schema.index({ location: '2dsphere' })`. This allows us to run `$near` or `$geoWithin` operations to find incidents near a user's location.

### 💾 **Resiliency & Fault Tolerance**
* **Q: What happens if MongoDB Atlas or your local MongoDB server goes down during the presentation?**
  * *A:* We implemented a connection fallback. When booting the backend, if database connection fails, the controllers automatically read/write to an in-memory mock database defined in [mockDatabase.js](file:///d:/TrafficEase_BD_Redesigned/backend/data/mockDatabase.js). This allows the application to run smoothly even without a database.

### ⚙️ **Codebase Architecture & MVC**
* **Q: Why did you create a separate 'Services' directory in the backend?**
  * *A:* To separate concerns. The controllers in `controllers/` should only deal with processing HTTP request properties and returning HTTP responses. Actual domain utilities (like checking password hashes, checking auth policy validation, or generating tokens) are outsourced to `services/` (e.g., [tokenService.js](file:///d:/TrafficEase_BD_Redesigned/backend/services/tokenService.js)), keeping routes focused only on parsing requests and returning JSON responses.
* **Q: How did you verify the calculations used in the frontend?**
  * *A:* We wrote automated tests. You can run `cd frontend && npm test` to trigger the test suite in [trafficCalculations.test.js](file:///d:/TrafficEase_BD_Redesigned/frontend/src/services/trafficCalculations.test.js) which asserts correct math returns for adaptive timing, weather risks, and queue length models.
