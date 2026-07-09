const express = require('express');
const { getLiveAirQuality } = require('../controllers/airQualityController');

const router = express.Router();
router.get('/', getLiveAirQuality);

module.exports = router;
