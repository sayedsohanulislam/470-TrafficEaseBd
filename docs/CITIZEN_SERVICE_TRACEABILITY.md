# TrafficEase BD Citizen-Service Traceability

This is the canonical commuter-facing feature list. A feature counts here only when a user can complete a meaningful task and observe a useful result or next action. Authentication and the authority control APIs are supporting platform capabilities, not citizen-service features.

| ID | User goal | What the user does | Observable result or action | Primary implementation |
|---:|---|---|---|---|
| CS-01 | Plan a route | Enters an origin and destination | Receives route geometry, distance, ETA, and fare estimates | `SmartHub.js` → `RoutePlanner`; Nominatim and OSRM |
| CS-02 | Check a fair fare | Enters an origin and destination | Compares CNG, rickshaw, bus, ride-share, and metro estimates | `SmartHub.js` → `CNGFareCalc` |
| CS-03 | See road problems | Opens the incident map and selects a marker | Sees incident type, severity, and location before travelling | `SmartHub.js` → `LiveIncidentMap`; `GET /api/incidents` |
| CS-04 | Report a road problem | Selects problem type, area, severity, and details | Creates a report in the shared incident feed | `SmartHub.js` → `QuickReportForm`; `POST /api/incidents` |
| CS-05 | Use the metro | Checks service status and selects a station | Sees first/last train times and nearby bus connections | `SmartHub.js` → `MetroGuide` |
| CS-06 | Find a bus | Enters starting area and destination | Receives matching buses, stops, frequency, and fare | `SmartHub.js` → `BusRouteFinder` |
| CS-07 | Find parking | Selects a parking location | Sees capacity, rate, opening hours, and location | `SmartHub.js` → `ParkingFinder` |
| CS-08 | Get emergency help | Chooses police, fire, ambulance, flood, or traffic help | Uses a large tap-to-call control for the correct number | `SmartHub.js` → `EmergencyContacts` |
| CS-09 | Avoid waterlogging | Selects a flood-prone area on the map | Sees risk, drainage notes, and an alternate road | `SmartHub.js` → `WaterloggingMap` |
| CS-10 | Find fuel | Filters by octane, diesel, or CNG | Sees matching stations and opening hours | `SmartHub.js` → `FuelStations` |
| CS-11 | Choose when to leave | Selects weekday or weekend | Sees the best and worst one-hour travel windows | `SmartHub.js` → `BestTimeCalc` |
| CS-12 | Find medical help | Filters hospitals and selects a location | Sees specialty, emergency availability, and phone number | `SmartHub.js` → `HospitalFinder` |
| CS-13 | Drive safely near schools | Opens the current school-zone map | Sees which zones are active at the current time | `SmartHub.js` → `SchoolZones` |
| CS-14 | Find local transport | Filters CNG or rickshaw stands | Sees typical waiting time and busy hours | `SmartHub.js` → `CNGStandFinder` |
| CS-15 | Avoid a closed road | Filters active or upcoming road work | Sees affected lanes, dates, and a detour | `SmartHub.js` → `RoadClosures` |
| CS-16 | Compare travel budgets | Enters trip distance | Compares six transport-mode costs | `SmartHub.js` → `JourneyCost` |
| CS-17 | Contact traffic police | Selects a traffic division | Sees jurisdiction and can tap to call | `SmartHub.js` → `PoliceZones` |
| CS-18 | Track a submitted report | Opens reports previously submitted from the same device | Sees whether each report is open, investigating, or resolved | `SmartHub.js` → `MyReports`; `GET /api/incidents/:id` |
| CS-19 | Save a daily commute | Saves home and work areas | Receives a reusable leave-now recommendation | `SmartHub.js` → `CommutePlanner`; device-local preferences |
| CS-20 | Read official alerts | Opens the official-alert feed | Sees affected area, severity, and commuter advice | `SmartHub.js` → `AuthorityAlerts`; `GET /api/alerts` |

## User-experience acceptance rules

- The home page starts with the question commuters actually have: where they want to go.
- The service hub is searchable in English and Bangla.
- The 20 services are organized into five everyday needs, with four services in each group.
- Every card states the task, expected result, and a direct action button.
- Each service opens through a stable deep link such as `/smart-hub?tool=bus-finder`.
- Users can save frequently used services on their device.
- Key controls are keyboard accessible and sized for touch use.
- The live-traffic page uses plain-language advice and no longer exposes the 30 simulator workspaces to commuters.

## Supporting capabilities

Signals, dispatch, audit logging, protected authority actions, database fallback, JWT authorization, and traffic calculations remain important technical capabilities. They are documented separately in `FEATURE_TRACEABILITY.md` and should be demonstrated as architecture or authority workflows—not counted as 20 additional commuter features.
