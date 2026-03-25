const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/news.controller');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyToken = require('../middleware/verifyToken');

// Públicas
router.get('/', ctrl.getNews);
router.get('/:id', ctrl.getNewsById);

// Usuari@ autenticad@
router.post('/:id/like', verifyToken, ctrl.toggleLike);

// Admin
router.post('/', verifyAdmin, ctrl.createNews);
router.put('/:id', verifyAdmin, ctrl.updateNews);
router.delete('/:id', verifyAdmin, ctrl.deleteNews);

module.exports = router;
