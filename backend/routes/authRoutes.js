const express = require('express');
const router = express.Router();
const { registerUser, loginUser, demoLoginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo-login', demoLoginUser);

module.exports = router;
