const verifyToken = require('./verifyToken');

const verifyAdmin = [verifyToken, (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
    }
}];

module.exports = verifyAdmin;
