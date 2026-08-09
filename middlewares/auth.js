// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ ok: false, mensaje: 'Token requerido' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { sub, email, role, iat, exp }
        next();
    } catch (e) {
        return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }
};