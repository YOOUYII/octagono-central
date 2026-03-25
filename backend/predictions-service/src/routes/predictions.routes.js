const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/predictions.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/my-picks', verifyToken, ctrl.getUserPredictions);
router.post('/predict', verifyToken, ctrl.makePrediction);
router.get('/ranking', ctrl.getGlobalRanking); // público

module.exports = router;
