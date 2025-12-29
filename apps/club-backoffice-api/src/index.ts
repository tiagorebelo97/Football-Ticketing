import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter } from '@football-ticketing/shared';
import matchRoutes from './routes/matches';
import nfcRoutes from './routes/nfc';
import venueRoutes from './routes/venues';
import sportRoutes from './routes/sports';
import reportRoutes from './routes/reports';
import authRoutes from './routes/auth';
import clubsRoutes from './routes/clubs';
import membersRoutes from './routes/members';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'club-backoffice-api' });
});


app.use('/api/matches', matchRoutes);
app.use('/api/nfc', nfcRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/clubs', membersRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Club Backoffice API running on port ${PORT}`);
});
