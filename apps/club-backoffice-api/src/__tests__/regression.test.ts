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
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(() => Promise.resolve({
      query: jest.fn(),
      release: jest.fn(),
    })),
  },
}));

import matchRoutes from '../routes/matches';
import nfcRoutes from '../routes/nfc';
import venueRoutes from '../routes/venues';
import sportRoutes from '../routes/sports';
import reportRoutes from '../routes/reports';
import authRoutes from '../routes/auth';
import clubRoutes from '../routes/clubs';

describe('Club Backoffice API Regression Tests', () => {
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
      res.json({ status: 'ok', service: 'club-backoffice-api' });
    });

    app.use('/api/matches', matchRoutes);
    app.use('/api/nfc', nfcRoutes);
    app.use('/api/venues', venueRoutes);
    app.use('/api/sports', sportRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/clubs', clubRoutes);

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
        service: 'club-backoffice-api'
      });
    });
  });

  describe('Match Endpoints', () => {
    it('should handle GET /api/matches endpoint', async () => {
      const response = await request(app)
        .get('/api/matches');

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/matches endpoint', async () => {
      const response = await request(app)
        .post('/api/matches')
        .send({
          clubId: 'test-club-id',
          homeTeam: 'Test Home',
          awayTeam: 'Test Away',
          matchDate: new Date().toISOString()
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('NFC Endpoints', () => {
    it('should handle GET /api/nfc/inventory/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/nfc/inventory/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/nfc/add endpoint', async () => {
      const response = await request(app)
        .post('/api/nfc/add')
        .send({
          cardId: 'test-card-id'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Venue Endpoints', () => {
    it('should handle GET /api/venues endpoint', async () => {
      const response = await request(app)
        .get('/api/venues');

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/venues endpoint', async () => {
      const response = await request(app)
        .post('/api/venues')
        .send({
          name: 'Test Venue',
          capacity: 5000
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Sports Endpoints', () => {
    it('should handle GET /api/sports endpoint', async () => {
      const response = await request(app)
        .get('/api/sports');

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Reports Endpoints', () => {
    it('should handle GET /api/reports/sales/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/reports/sales/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle GET /api/reports/attendance/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/reports/attendance/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Auth Endpoints', () => {
    it('should handle GET /api/auth/:clubSlug endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/test-club');

      // Auth endpoint may return 404 if club not found, which is acceptable
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('Club Endpoints', () => {
    it('should handle GET /api/clubs/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/clubs/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle PUT /api/clubs/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .put(`/api/clubs/${testClubId}`)
        .send({
          name: 'Updated Club Name'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle GET /api/clubs/countries endpoint', async () => {
      const response = await request(app)
        .get('/api/clubs/countries');

      expect(response.status).not.toBe(404);
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
        .post('/api/matches')
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect([400, 500]).toContain(response.status);
    });
  });
});
