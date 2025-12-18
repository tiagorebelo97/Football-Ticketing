import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import clubRoutes from './routes/clubs';
import nfcStockRoutes from './routes/nfc-stock';
import feeConfigRoutes from './routes/fee-config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'super-admin-api' });
});

// Routes
app.use('/api/clubs', clubRoutes);
app.use('/api/nfc-stock', nfcStockRoutes);
app.use('/api/fee-config', feeConfigRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Super Admin API running on port ${PORT}`);
});
