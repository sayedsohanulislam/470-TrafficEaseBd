const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
} = require('../controllers/vehicleController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/stats', getVehicleStats);

router.route('/')
  .get(getVehicles)
  .post(protect, allowRoles('Admin', 'Authority', 'Driver'), createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(protect, allowRoles('Admin', 'Authority', 'Driver'), updateVehicle)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteVehicle);

module.exports = router;
