const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} = require('../controllers/alertController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAlerts)
  .post(protect, allowRoles('Admin', 'Authority'), createAlert);

router.route('/:id')
  .put(protect, allowRoles('Admin', 'Authority'), updateAlert)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteAlert);

module.exports = router;
