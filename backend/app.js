const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/signals', require('./routes/trafficSignalRoutes'));
app.use('/api/transit', require('./routes/transitRouteRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));
app.use('/api/live-traffic', require('./routes/liveTrafficRoutes'));
app.use('/api/operations', require('./routes/operationRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'TrafficEase BD API is running...', architecture: 'MVC' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
