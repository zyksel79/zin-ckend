import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import walletRoutes from './routes/wallet.routes';
import giftRoutes from './routes/gift.routes';
import liveRoutes from './routes/live.routes';
import pkRoutes from './routes/pk.routes';
import agencyRoutes from './routes/agency.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/gift', giftRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/pk', pkRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Zingle TypeScript backend running on port ${PORT}`));
