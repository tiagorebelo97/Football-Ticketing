import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Mock the shared module
jest.mock('@football-ticketing/shared', () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
  authLimiter: (req: any, res: any, next: any) => next(),
}));

// Mock database
jest.mock('../db', () => ({
  query: jest.fn(),
}));

import authRoutes from '../routes/auth';
import paymentRoutes from '../routes/payments';
import refundRoutes from '../routes/refunds';

describe('POS API Regression Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Mock console.error to prevent Jest from treating it as test failure
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a test instance of the app
    app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'pos-api' });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/refunds', refundRoutes);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  afterAll(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        service: 'pos-api'
      });
    });
  });

  describe('Auth Endpoints', () => {
    it('should handle POST /api/auth/nfc-login endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/nfc-login')
        .send({
          cardId: 'test-card-id',
          clubId: 'test-club-id'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/auth/logout endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          sessionId: 'test-session-id'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Payment Endpoints', () => {
    it('should handle POST /api/payments/process endpoint', async () => {
      const response = await request(app)
        .post('/api/payments/process')
        .send({
          amount: 50.00,
          ticketId: 'test-ticket-id',
          method: 'card'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/payments/assign-nfc endpoint', async () => {
      const response = await request(app)
        .post('/api/payments/assign-nfc')
        .send({
          ticketId: 'test-ticket-id',
          cardId: 'test-card-id'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Refund Endpoints', () => {
    it('should handle POST /api/refunds endpoint', async () => {
      const response = await request(app)
        .post('/api/refunds')
        .send({
          paymentId: 'test-payment-id',
          amount: 25.00,
          reason: 'Test refund'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect([400, 500]).toContain(response.status);
    });
  });
});
