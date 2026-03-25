const express = require('express');
const router = express.Router();
const fightersController = require('../controllers/fighters.controller');
const verifyAdmin = require('../middleware/verifyAdmin');

// Rutas públicas
router.get('/', fightersController.getFighters);
router.get('/:id', fightersController.getFighterById);

// Rutas protegidas (admin)
router.post('/', verifyAdmin, fightersController.createFighter);
router.put('/:id', verifyAdmin, fightersController.updateFighter);
router.delete('/:id', verifyAdmin, fightersController.deleteFighter);

module.exports = router;
