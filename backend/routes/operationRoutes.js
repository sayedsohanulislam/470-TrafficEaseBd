const express = require('express');
const router = express.Router();
const { getOperations, createOperation } = require('../controllers/operationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect, allowRoles('Admin', 'Authority'));
router.route('/')
  .get(getOperations)
  .post(createOperation);

module.exports = router;
