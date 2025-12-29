import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';

// Mock the pg module
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

import clubRoutes from '../routes/clubs';

describe('Club Endpoints', () => {
  let app: express.Application;
  let mockPool: any;

  beforeAll(() => {
    // Mock console.error to prevent Jest from treating it as test failure
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    app = express();
    app.use(express.json());
    app.use('/api/clubs', clubRoutes);

    const PoolConstructor = Pool as unknown as jest.Mock;
    mockPool = PoolConstructor.mock.results[0].value;
  });

  afterAll(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/clubs/:clubId', () => {
    it('should return club details when club exists', async () => {
      const mockClub = {
        id: 'club-123',
        name: 'Test FC',
        short_name: 'TFC',
        slug: 'test-fc',
        logo_url: 'https://example.com/logo.png',
        country_id: 'country-456',
        country_name: 'Portugal',
        country_code: 'PT',
        founded_year: 1990,
        stadium_capacity: 50000,
        website: 'https://testfc.com',
        primary_color: '#FF0000',
        secondary_color: '#0000FF',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockClub] });

      const response = await request(app)
        .get('/api/clubs/club-123')
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockClub.id,
        name: mockClub.name,
        slug: mockClub.slug
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['club-123']
      );
    });

    it('should return 404 when club does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/clubs/nonexistent-id')
        .expect(404);

      expect(response.body).toEqual({ error: 'Club not found' });
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/clubs/club-123')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch club' });
    });
  });

  describe('PUT /api/clubs/:clubId', () => {
    it('should update club details successfully', async () => {
      const updateData = {
        name: 'Updated FC',
        short_name: 'UFC',
        founded_year: 1995,
        website: 'https://updated-fc.com'
      };

      const updatedClub = {
        id: 'club-123',
        ...updateData,
        slug: 'test-fc',
        logo_url: null,
        country_id: null,
        stadium_capacity: null,
        primary_color: '#FF0000',
        secondary_color: '#0000FF',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({ rows: [updatedClub] });

      const response = await request(app)
        .put('/api/clubs/club-123')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'club-123',
        name: 'Updated FC',
        short_name: 'UFC'
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE clubs'),
        expect.arrayContaining([...Object.values(updateData), 'club-123'])
      );
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .put('/api/clubs/club-123')
        .send({ short_name: 'TFC' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Name is required' });
    });

    it('should return 404 when club does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/clubs/nonexistent-id')
        .send({ name: 'Test FC' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Club not found' });
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put('/api/clubs/club-123')
        .send({ name: 'Test FC' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to update club' });
    });
  });

  describe('GET /api/clubs/countries', () => {
    it('should return list of countries', async () => {
      const mockCountries = [
        { id: 'country-1', name: 'Portugal', code: 'PT', flag_url: 'https://example.com/pt.png' },
        { id: 'country-2', name: 'Spain', code: 'ES', flag_url: 'https://example.com/es.png' }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockCountries });

      const response = await request(app)
        .get('/api/clubs/countries')
        .expect(200);

      expect(response.body).toEqual(mockCountries);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, code, flag_url FROM countries')
      );
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/clubs/countries')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch countries' });
    });
  });
});
