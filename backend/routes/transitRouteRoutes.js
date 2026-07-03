const express = require('express');
const router = express.Router();
const {
  getTransitRoutes,
  createTransitRoute,
  updateTransitRoute,
  deleteTransitRoute
} = require('../controllers/transitRouteController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTransitRoutes)
  .post(protect, allowRoles('Admin', 'Authority'), createTransitRoute);

router.route('/:id')
  .put(protect, allowRoles('Admin', 'Authority'), updateTransitRoute)
  .delete(protect, allowRoles('Admin', 'Authority'), deleteTransitRoute);

module.exports = router;
