const express = require('express');
const router = express.Router();
const {
  getParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot
} = require('../controllers/parkingController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getParkingLots)
  .post(protect, allowRoles('Admin', 'Authority'), createParkingLot);

router.route('/:id')
  .put(protect, allowRoles('Admin', 'Authority'), updateParkingLot)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteParkingLot);

module.exports = router;
