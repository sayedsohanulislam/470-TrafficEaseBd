const express = require('express');
const router = express.Router();
const {
  getSignals,
  createSignal,
  updateSignal,
  deleteSignal
} = require('../controllers/trafficSignalController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSignals)
  .post(protect, allowRoles('Admin', 'Authority'), createSignal);

router.route('/:id')
  .put(protect, allowRoles('Admin', 'Authority'), updateSignal)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteSignal);

module.exports = router;
