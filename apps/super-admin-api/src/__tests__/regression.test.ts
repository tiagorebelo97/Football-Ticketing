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
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(() => Promise.resolve({
      query: jest.fn(),
      release: jest.fn(),
    })),
  },
}));

// Mock external dependencies
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => next(),
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

import clubRoutes from '../routes/clubs';
import nfcStockRoutes from '../routes/nfc-stock';
import feeConfigRoutes from '../routes/fee-config';
import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import settingsRoutes from '../routes/settings';
import countriesRoutes from '../routes/countries';
import venuesRoutes from '../routes/venues';
import competitionsRoutes from '../routes/competitions';
import seasonsRoutes from '../routes/seasons';
import sportsRoutes from '../routes/sports';

describe('Super Admin API Regression Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create a test instance of the app
    app = express();
    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'super-admin-api' });
    });

    app.use('/api/countries', countriesRoutes);
    app.use('/api/clubs', clubRoutes);
    app.use('/api/venues', venuesRoutes);
    app.use('/api/competitions', competitionsRoutes);
    app.use('/api/seasons', seasonsRoutes);
    app.use('/api/sports', sportsRoutes);
    app.use('/api/nfc-stock', nfcStockRoutes);
    app.use('/api/fee-config', feeConfigRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/settings', settingsRoutes);

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
        service: 'super-admin-api'
      });
    });
  });

  describe('Club Endpoints', () => {
    it('should handle GET /api/clubs endpoint', async () => {
      const response = await request(app)
        .get('/api/clubs');

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/clubs endpoint', async () => {
      const response = await request(app)
        .post('/api/clubs')
        .send({
          name: 'Test Club',
          slug: 'test-club',
          primaryColor: '#FF0000',
          secondaryColor: '#0000FF'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 409, 500]).toContain(response.status);
    });

    it('should handle GET /api/clubs/:clubId endpoint', async () => {
      const testClubId = 'test-club-id-123';
      const response = await request(app)
        .get(`/api/clubs/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 404, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Auth Endpoints', () => {
    it('should handle POST /api/auth/register endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 409, 500]).toContain(response.status);
    });

    it('should handle POST /api/auth/login endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/auth/verify-email endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'test-verification-token'
        });

      expect(response.status).not.toBe(404);
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('NFC Stock Endpoints', () => {
    it('should handle GET /api/nfc-stock/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/nfc-stock/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/nfc-stock/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .post(`/api/nfc-stock/${testClubId}`)
        .send({
          cardId: 'test-card-id',
          type: 'staff'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Fee Config Endpoints', () => {
    it('should handle GET /api/fee-config/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .get(`/api/fee-config/${testClubId}`);

      expect(response.status).not.toBe(404);
      expect([200, 400, 401, 500]).toContain(response.status);
    });

    it('should handle POST /api/fee-config/:clubId endpoint', async () => {
      const testClubId = 'test-club-id';
      const response = await request(app)
        .post(`/api/fee-config/${testClubId}`)
        .send({
          platformFee: 0.05,
          stripeFee: 0.029
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('User Endpoints', () => {
    it('should handle GET /api/users endpoint', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).not.toBe(404);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    it('should handle POST /api/users endpoint', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'test123',
          role: 'club_admin'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 403, 500]).toContain(response.status);
    });

    it('should handle PUT /api/users/:id endpoint', async () => {
      const testUserId = 'test-user-id-123';
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send({
          email: 'updated@example.com'
        });

      expect(response.status).not.toBe(404);
      expect([200, 404, 400, 401, 403, 500]).toContain(response.status);
    });

    it('should handle DELETE /api/users/:id endpoint', async () => {
      const testUserId = 'test-user-id-123';
      const response = await request(app)
        .delete(`/api/users/${testUserId}`);

      expect(response.status).not.toBe(404);
      expect([200, 204, 404, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('Settings Endpoints', () => {
    it('should handle GET /api/settings endpoint', async () => {
      const response = await request(app)
        .get('/api/settings');

      expect(response.status).not.toBe(404);
      expect([200, 401, 500]).toContain(response.status);
    });

    it('should handle PUT /api/settings/:key endpoint', async () => {
      const response = await request(app)
        .put('/api/settings/test-setting')
        .send({
          value: 'test-value'
        });

      expect(response.status).not.toBe(404);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('Countries Endpoints', () => {
    it('should handle GET /api/countries endpoint', async () => {
      const response = await request(app)
        .get('/api/countries');

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('Venues Endpoints', () => {
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
          capacity: 50000,
          city: 'Test City',
          country: 'Test Country'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Competitions Endpoints', () => {
    it('should handle GET /api/competitions endpoint', async () => {
      const response = await request(app)
        .get('/api/competitions');

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle POST /api/competitions endpoint', async () => {
      const response = await request(app)
        .post('/api/competitions')
        .send({
          name: 'Test Competition',
          sport: 'Football',
          country: 'Test Country'
        });

      expect(response.status).not.toBe(404);
      expect([200, 201, 400, 401, 500]).toContain(response.status);
    });
  });

  describe('Seasons Endpoints', () => {
    it('should handle GET /api/seasons endpoint', async () => {
      const response = await request(app)
        .get('/api/seasons');

      expect(response.status).not.toBe(404);
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle POST /api/seasons endpoint', async () => {
      const response = await request(app)
        .post('/api/seasons')
        .send({
          name: '2024/2025',
          competitionId: 'test-competition-id',
          startDate: '2024-08-01',
          endDate: '2025-05-31'
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
        .post('/api/clubs')
        .set('Content-Type', 'application/json')
        .send('invalid-json');

      expect([400, 500]).toContain(response.status);
    });
  });
});
