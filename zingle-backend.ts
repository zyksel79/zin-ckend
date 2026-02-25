import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// ----------------------
// PostgreSQL & Redis Setup
// ----------------------
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});

const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

// ----------------------
// Utils
// ----------------------
function generateToken(userID: string, role: string = 'user') {
    return jwt.sign({ id: userID, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

// ----------------------
// Middleware
// ----------------------
function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        (req as any).user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function roleMiddleware(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user.role;
        if (userRole !== role) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}

// ----------------------
// Express App
// ----------------------
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------------
// Auth Routes
// ----------------------
app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id, username, email',
        [username, email, hashed]
    );
    res.json({ user: result.rows[0] });
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rows[0]) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = generateToken(result.rows[0].id);
    res.json({ token });
});

// ----------------------
// User Routes
// ----------------------
app.get('/user/profile', authMiddleware, async (req, res) => {
    const userID = (req as any).user.id;
    const result = await pool.query('SELECT id, username, email FROM users WHERE id=$1', [userID]);
    res.json({ user: result.rows[0] });
});

// ----------------------
// Wallet Routes
// ----------------------
app.get('/wallet/:userID', authMiddleware, async (req, res) => {
    const userID = req.params.userID;
    const result = await pool.query('SELECT balance FROM wallets WHERE user_id=$1', [userID]);
    res.json({ balance: result.rows[0]?.balance || 0 });
});

app.post('/wallet/transaction', authMiddleware, async (req, res) => {
    const { userID, type, amount } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query('INSERT INTO transactions (user_id,type,amount) VALUES ($1,$2,$3)', [userID, type, amount]);
        await pool.query('UPDATE wallets SET balance = balance + $1 WHERE user_id=$2', [amount, userID]);
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// ----------------------
// Gift Routes
// ----------------------
app.get('/gift', async (_req, res) => {
    const result = await pool.query('SELECT * FROM gifts');
    res.json({ gifts: result.rows });
});

app.post('/gift/send', authMiddleware, async (req, res) => {
    const { senderID, receiverID, giftID } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1,$2,$3)',
            [senderID, 'gift', -1]
        );
        await pool.query(
            'INSERT INTO gifts_sent (sender_id, receiver_id, gift_id) VALUES ($1,$2,$3)',
            [senderID, receiverID, giftID]
        );
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Gift sending failed' });
    }
});

// ----------------------
// Agency Routes
// ----------------------
app.get('/agency', async (_req, res) => {
    const result = await pool.query('SELECT * FROM agencies');
    res.json({ agencies: result.rows });
});

app.post('/agency/create', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO agencies (name) VALUES ($1) RETURNING *', [name]);
    res.json({ agency: result.rows[0] });
});

// ----------------------
// Admin Routes
// ----------------------
app.get('/admin/users', authMiddleware, roleMiddleware('admin'), async (_req, res) => {
    const result = await pool.query('SELECT id, username, email FROM users');
    res.json({ users: result.rows });
});

app.get('/admin/transactions', authMiddleware, roleMiddleware('admin'), async (_req, res) => {
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json({ transactions: result.rows });
});

// ----------------------
// Live & PK (Simplified)
// ----------------------
app.post('/live/create', authMiddleware, async (req, res) => {
    const { hostID, title } = req.body;
    const result = await pool.query('INSERT INTO live_rooms (host_id,title,status) VALUES ($1,$2,$3) RETURNING *', [hostID, title, 'active']);
    res.json({ liveRoom: result.rows[0] });
});

app.post('/pk/start', authMiddleware, async (req, res) => {
    const { roomID, user1ID, user2ID } = req.body;
    const result = await pool.query(
        'INSERT INTO pk_battles (room_id,user1_id,user2_id,status) VALUES ($1,$2,$3,$4) RETURNING *',
        [roomID, user1ID, user2ID, 'pending']
    );
    res.json({ pkBattle: result.rows[0] });
});

// ----------------------
// Server Start
// ----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Zingle backend running on port ${PORT}`));
