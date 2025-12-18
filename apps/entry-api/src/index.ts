import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter } from '@football-ticketing/shared';
import { createServer } from 'http';
import { Server } from 'socket.io';
import validationRoutes from './routes/validation';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'entry-api' });
});

// Attach io to request for controllers
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

app.use('/api/validation', validationRoutes);

// WebSocket for real-time capacity updates
io.on('connection', (socket) => {
  console.log('Client connected for capacity tracking');
  
  socket.on('subscribe-match', (matchId) => {
    socket.join(`match-${matchId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log(`Entry API running on port ${PORT}`);
});
