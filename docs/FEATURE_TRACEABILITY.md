# TrafficEase BD Feature Traceability Matrix

This is the canonical feature list for the project idea, SRS, source code, demonstration, and contribution evidence. Authentication is a platform prerequisite and is not counted as a feature.

| ID | Functional requirement | Primary interface | Backend/model evidence | Acceptance evidence | Documented lead |
|---:|---|---|---|---|---|
| FR-01 | Show a citywide congestion index | Live Traffic workspace 01 | `/api/live-traffic` | Slider and API snapshot produce a 0–100 status | Raisha Tasnim Khan |
| FR-02 | Compare current and normal corridor speed | Live Traffic workspace 02 | `/api/live-traffic` | Corridor selection changes delay calculation | Raisha Tasnim Khan |
| FR-03 | Estimate physical traffic queue length | Live Traffic workspace 03 | Calculation service | Vehicle count produces metres and clearance seconds | Raisha Tasnim Khan |
| FR-04 | Display and change a signal phase | Live Traffic workspace 04 | Signal API/model | Selected phase and controller indicator update | Maisha Maliha Nisa |
| FR-05 | Recommend adaptive signal timing | Live Traffic workspace 05 | Calculation service; Signal model | Demand produces green and clearance timing | Maisha Maliha Nisa |
| FR-06 | Flag simulated signal failures | Live Traffic workspace 06 | Signal API/model | Per-intersection fault toggles produce warnings | Maisha Maliha Nisa |
| FR-07 | Submit a geolocated incident | Report Incident | `POST /api/incidents`; Incident model | Valid report persists with coordinates | Md. Mushroor Muttakin Khan / Sayed Sohanul Islam |
| FR-08 | Verify or reject incident reports | Live Traffic workspace 08 | `PUT /api/incidents/:id`; OperationLog | Authority action changes status and writes audit record | Md. Mushroor Muttakin Khan |
| FR-09 | Simulate emergency-vehicle signal priority | Live Traffic workspace 09 | Operation simulator | Toggle produces green-cascade action | Maisha Maliha Nisa |
| FR-10 | Apply a school-zone safe-speed mode | Live Traffic workspace 10 | Operation simulator | Toggle applies 20 km/h restriction | Maisha Maliha Nisa |
| FR-11 | Calculate weather impact risk | Live Traffic workspace 11 | Calculation service | Rainfall changes bounded risk score | Maisha Maliha Nisa |
| FR-12 | Warn by waterlogging depth | Live Traffic workspace 12 | Operation simulator | Depth produces safe/caution/closed guidance | Maisha Maliha Nisa |
| FR-13 | Provide AQI-based mobility guidance | Live Traffic workspace 13 | Operation simulator | AQI produces tiered commuter advisory | Maisha Maliha Nisa |
| FR-14 | Show bus route delay and reliability | Live Traffic workspace 14 | Transit API/model | Delay changes headway and reliability | Maisha Maliha Nisa |
| FR-15 | Show metro feeder connection status | Live Traffic workspace 15 | Transit API/model | Station selection displays connection status | Maisha Maliha Nisa |
| FR-16 | Predict transit delay from congestion | Live Traffic workspace 16 | Calculation service | Congestion changes bus delay prediction | Maisha Maliha Nisa |
| FR-17 | Monitor passenger crowding | Live Traffic workspace 17 | Operation simulator | Load produces low/moderate/critical state | Maisha Maliha Nisa |
| FR-18 | Display and manage parking availability | Live Traffic workspace 18; Dashboard | Parking API/model | Lots and interactive slots show availability | Md. Mushroor Muttakin Khan |
| FR-19 | Forecast parking demand | Live Traffic workspace 19 | Parking data | Lot selection displays peak forecast | Maisha Maliha Nisa |
| FR-20 | Assess ride-share pickup-zone load | Live Traffic workspace 20 | Operation simulator | Queue threshold produces overflow action | Maisha Maliha Nisa |
| FR-21 | Estimate CNG stand waiting time | Live Traffic workspace 21 | Calculation workspace | Wait input produces queue estimate | Maisha Maliha Nisa |
| FR-22 | Track pedestrian crossing demand | Live Traffic workspace 22 | Operation simulator | Button queues crossing calls and adjusts timing | Maisha Maliha Nisa |
| FR-23 | Select road-work scheduling plans | Live Traffic workspace 23 | Planning workspace | Schedule selection writes session audit evidence | Maisha Maliha Nisa |
| FR-24 | Activate event traffic plans | Live Traffic workspace 24 | Planning workspace | Event selection records routing plan | Maisha Maliha Nisa |
| FR-25 | Recommend a route | Live Map; workspace 25 | OSRM integration; traffic/incident APIs | Origin/destination returns selectable route geometry | Sayed Sohanul Islam |
| FR-26 | Compare multimodal ETAs | Live Traffic workspace 26 | Calculation service | Distance produces car, MRT, and bus ETA | Sayed Sohanul Islam |
| FR-27 | Rank traffic hotspots | Live Traffic workspace 27 | Live traffic snapshot | Corridors are ordered by load severity | Raisha Tasnim Khan |
| FR-28 | Dispatch an authority response unit | Live Traffic workspace 28 | `POST /api/operations`; OperationLog | Authority action persists unit, location, and status | Md. Mushroor Muttakin Khan |
| FR-29 | Broadcast a public alert | Live Traffic workspace 29; Dashboard | `POST /api/alerts`; Alert model | Authority alert persists and appears in active alerts | Raisha Tasnim Khan / Md. Mushroor Muttakin Khan |
| FR-30 | Preserve an audit-ready activity log | Live Traffic workspace 30 | `/api/operations`; OperationLog | Protected view reloads persisted actions | Maisha Maliha Nisa / Md. Mushroor Muttakin Khan |

## Cross-cutting prerequisites

- JWT authentication and role-based authorization support protected workflows but are excluded from the 30-feature count.
- React is the View layer; Express controllers coordinate requests; Mongoose schemas and the mock repository are the Model/data layer.
- OSRM, OpenStreetMap/Nominatim, Leaflet, and map tiles are third-party infrastructure. They support presentation and routing; project-specific scoring, workflows, authorization, persistence, and domain logic remain in the repository.
- Features described as simulators intentionally model operational decisions for a classroom demonstration and do not claim connection to government traffic-control hardware.
