const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometric.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/login-challenge', biometricController.loginChallenge);
router.post('/login', biometricController.login);

router.use(verifyToken);
router.get('/register-challenge', biometricController.registerChallenge);
router.post('/register', biometricController.register);


module.exports = router;
