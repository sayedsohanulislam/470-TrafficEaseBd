const express = require('express');
const router = express.Router();
const {
  getLiveTraffic,
  getFeatureModules
} = require('../controllers/liveTrafficController');

router.get('/', getLiveTraffic);
router.get('/features', getFeatureModules);

module.exports = router;
