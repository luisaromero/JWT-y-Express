require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('./middlewares/auth');


const app = express();
app.use(express.json());

// usuario de prueba en memoria (temporal, hasta que conectemos Postgres)
const users = [
    { email: 'demo@mail.com', passwordHash: bcrypt.hashSync('123456', 10), role: 'user' }
];

// POST /auth/login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Email y password son requeridos' });
    }

    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
        { sub: email, email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '15m' }
    );

    return res.status(200).json({ ok: true, token });
});

// ruta protegida
app.get('/api/perfil', auth, (req, res) => {
    res.json({ ok: true, data: { email: req.user.email, role: req.user.role } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API segura en http://localhost:${PORT}`));