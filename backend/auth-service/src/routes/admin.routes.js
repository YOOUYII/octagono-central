const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyAdmin = require('../middleware/verifyAdmin');

// Todas las rutas aquí están protegidas por verifyAdmin
router.use(verifyAdmin);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.changeStatus);
router.patch('/users/:id/role', adminController.changeRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
