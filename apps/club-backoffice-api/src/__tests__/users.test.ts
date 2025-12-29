import request from 'supertest';
import express from 'express';

// Mock the pg module before importing anything else
const mockQuery = jest.fn();
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery
    }))
  };
});

// Now import after mock is set up
import userRoutes from '../routes/users';

const app = express();
app.use(express.json());
app.use('/api/clubs', userRoutes);

describe('User Management API Tests', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  describe('GET /api/clubs/:clubId/users', () => {
    it('should return list of users for a club', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            phone: '1234567890',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            role_id: 'role-1',
            role_name: 'Club Admin',
            role_description: 'Full access',
            role_permissions: ['manage_users', 'manage_matches']
          }
        ]
      });

      const response = await request(app)
        .get('/api/clubs/test-club-id/users')
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/clubs/:clubId/roles', () => {
    it('should return list of roles for a club', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'role-1',
            name: 'Club Admin',
            description: 'Full access',
            permissions: ['manage_users'],
            is_system_role: true
          }
        ]
      });

      const response = await request(app)
        .get('/api/clubs/test-club-id/roles')
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/clubs/:clubId/users', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/clubs/test-club-id/users')
        .send({})
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('PUT /api/clubs/:clubId/users/:userId', () => {
    it('should handle updates', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      const updates = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/clubs/test-club-id/users/test-user-id')
        .send(updates)
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/clubs/:clubId/users/:userId', () => {
    it('should handle deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      const response = await request(app)
        .delete('/api/clubs/test-club-id/users/test-user-id')
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(404);
    });
  });
});
