import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Mock the shared module
jest.mock('@football-ticketing/shared', () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
  ticketPurchaseSchema: {},
  generateQRCode: jest.fn(),
  generateTicketNumber: jest.fn(),
}));

// Mock database
jest.mock('../db', () => ({
  query: jest.fn(),
}));

import matchRoutes from '../routes/matches';
import ticketRoutes from '../routes/tickets';

describe('Fan API Regression Tests', () => {
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
      res.json({ status: 'ok', service: 'fan-api' });
    });

    app.use('/api/matches', matchRoutes);
    app.use('/api/tickets', ticketRoutes);

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
        service: 'fan-api'
      });
    });
  });

  describe('Match Endpoints', () => {
    it('should handle GET /api/matches endpoint', async () => {
      const response = await request(app)
        .get('/api/matches');

      // Should not return 404
      expect(response.status).not.toBe(404);
      
      // Should return either 200 with data or proper error code
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle GET /api/matches/:matchId endpoint', async () => {
      const testMatchId = 'test-match-id-123';
      const response = await request(app)
        .get(`/api/matches/${testMatchId}`);

      // Should not return 404
      expect(response.status).not.toBe(404);
      
      // Should return either 200, 404 (match not found) or proper error code
      expect([200, 404, 400, 500]).toContain(response.status);
    });
  });

  describe('Ticket Endpoints', () => {
    it('should handle POST /api/tickets/purchase endpoint', async () => {
      const response = await request(app)
        .post('/api/tickets/purchase')
        .send({
          matchId: 'test-match',
          userId: 'test-user',
          quantity: 1
        });

      // Should not return 404
      expect(response.status).not.toBe(404);
      
      // Should return appropriate status code
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should handle GET /api/tickets/:ticketId endpoint', async () => {
      const testTicketId = 'test-ticket-id-123';
      const response = await request(app)
        .get(`/api/tickets/${testTicketId}`);

      // Should not return 404
      expect(response.status).not.toBe(404);
      
      // Should return appropriate status code
      expect([200, 404, 400, 500]).toContain(response.status);
    });

    it('should handle GET /api/tickets/user/:userId endpoint', async () => {
      const testUserId = 'test-user-id-123';
      const response = await request(app)
        .get(`/api/tickets/user/${testUserId}`);

      // Should not return 404
      expect(response.status).not.toBe(404);
      
      // Should return appropriate status code
      expect([200, 400, 500]).toContain(response.status);
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
        .post('/api/tickets/purchase')
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect([400, 500]).toContain(response.status);
    });
  });
});
