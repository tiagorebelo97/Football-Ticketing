import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter, authLimiter } from '@football-ticketing/shared';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import refundRoutes from './routes/refunds';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pos-api' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`POS API running on port ${PORT}`);
});
