const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/events.controller');
const verifyAdmin = require('../middleware/verifyAdmin');

// Públicas
router.get('/', ctrl.getEvents);
router.get('/:id', ctrl.getEventById);
router.get('/:id/fights', ctrl.getFightsByEvent);
router.get('/fights/:id/stats', ctrl.getStatsByFight);

// Admin
router.post('/', verifyAdmin, ctrl.createEvent);
router.put('/:id', verifyAdmin, ctrl.updateEvent);
router.delete('/:id', verifyAdmin, ctrl.deleteEvent);
router.post('/:id/fights', verifyAdmin, ctrl.addFightToEvent);
router.put('/fights/:id', verifyAdmin, ctrl.updateFight);
router.delete('/fights/:id', verifyAdmin, ctrl.deleteFight);
router.post('/fights/:id/stats', verifyAdmin, ctrl.createStats);
router.put('/fights/:id/stats/:fighterId', verifyAdmin, ctrl.updateStats);

module.exports = router;
