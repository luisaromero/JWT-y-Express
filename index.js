require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('./middlewares/auth');
const pool = require('./db');



const app = express();
app.use(express.json());

// POST /auth/register
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Email y password son requeridos' });
    }

    try {
        // revisar si ya existe
        const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ ok: false, mensaje: 'Email ya registrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO usuarios (email, password_hash, role) VALUES ($1, $2, $3)',
            [email, passwordHash, 'user']
        );

        return res.status(201).json({ ok: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
    }
});

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