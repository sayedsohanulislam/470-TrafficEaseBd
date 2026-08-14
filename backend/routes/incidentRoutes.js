const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} = require('../controllers/incidentController');
const { optionalAuth, protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getIncidents)
  .post(optionalAuth, createIncident);

router.route('/:id')
  .get(getIncidentById)
  .put(protect, allowRoles('Admin', 'Authority'), updateIncident)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteIncident);

module.exports = router;
