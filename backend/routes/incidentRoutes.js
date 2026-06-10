const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  approveIncident,
  deleteIncident
} = require('../controllers/incidentController');
const { optionalAuth, protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getIncidents)
  .post(protect, allowRoles('Commuter', 'Driver'), createIncident);

router.patch('/:id/approve', protect, allowRoles('Admin'), approveIncident);

router.route('/:id')
  .get(optionalAuth, getIncidentById)
  .put(protect, allowRoles('Admin', 'Authority'), updateIncident)
  .delete(protect, allowRoles('Admin'), deleteIncident);

module.exports = router;
