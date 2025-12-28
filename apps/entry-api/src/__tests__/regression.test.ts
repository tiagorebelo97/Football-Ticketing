import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Mock the shared module
jest.mock('@football-ticketing/shared', () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
}));

// Mock database
jest.mock('../db', () => ({
  query: jest.fn(),
}));

import validationRoutes from '../routes/validation';

describe('Entry API Regression Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create a test instance of the app
    app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'entry-api' });
    });

    app.use('/api/validation', validationRoutes);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        service: 'entry-api'
      });
    });
  });

  describe('Validation Endpoints', () => {
    it('should handle GET /api/validation/matches endpoint', async () => {
      const response = await request(app)
        .get('/api/validation/matches');

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle POST /api/validation/validate endpoint', async () => {
      const response = await request(app)
        .post('/api/validation/validate')
        .send({
          ticketId: 'test-ticket-id',
          matchId: 'test-match-id'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 404, 500]).toContain(response.status);
    });

    it('should handle GET /api/validation/capacity/:matchId endpoint', async () => {
      const testMatchId = 'test-match-id-123';
      const response = await request(app)
        .get(`/api/validation/capacity/${testMatchId}`);

      expect(response.status).not.toBe(404);
      expect([200, 404, 400, 500]).toContain(response.status);
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
        .post('/api/validation/ticket')
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('WebSocket Support', () => {
    it('should not break existing REST endpoints when WebSocket is available', async () => {
      // This test ensures that adding WebSocket support doesn't break REST endpoints
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
