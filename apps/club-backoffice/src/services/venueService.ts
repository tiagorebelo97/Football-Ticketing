import axios from 'axios';

export interface Row {
  id?: string;
  name: string;
  rowNumber: number;
  seatsCount: number;
}

export interface Sector {
  id?: string;
  name: string;
  sectorNumber: number;
  totalSeats: number;
  configuredSeats?: number;
  rows?: Row[];
}

export interface Floor {
  id?: string;
  name: string;
  floorNumber: number;
  totalSectors?: number;
  totalCapacity?: number;
  sectors?: Sector[];
}

export interface Stand {
  id?: string;
  name: string;
  position: 'north' | 'south' | 'east' | 'west';
  color?: string;
  totalFloors?: number;
  totalCapacity?: number;
  floors?: Floor[];
}

export interface Venue {
  id?: string;
  clubId?: string;
  name: string;
  city: string;
  address?: string;
  sportId: string;
  sportName?: string;
  sportCode?: string;
  photoUrl?: string;
  capacity?: number;
  totalStands?: number;
  totalSectors?: number;
  totalRows?: number;
  stands?: Stand[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenuePayload {
  clubId: string;
  name: string;
  city: string;
  address?: string;
  sportId: string;
  photoUrl?: string;
  capacity?: number;
  stands?: Stand[];
}

export interface UpdateVenuePayload {
  name?: string;
  city?: string;
  address?: string;
  sportId?: string;
  photoUrl?: string;
  capacity?: number;
  stands?: Stand[];
}

export const venueService = {
  /**
   * Get all venues for a club
   */
  async getVenues(clubId: string): Promise<Venue[]> {
    const response = await axios.get(`/api/venues?clubId=${clubId}`);
    return response.data;
  },

  /**
   * Get single venue by ID with full hierarchy
   */
  async getVenueById(id: string): Promise<Venue> {
    const response = await axios.get(`/api/venues/${id}`);
    const data = response.data;

    // Transform snake_case from API to camelCase for frontend
    return {
      ...data,
      sportId: data.sport_id || data.sportId,
      sportName: data.sport_name || data.sportName,
      sportCode: data.sport_code || data.sportCode,
      clubId: data.club_id || data.clubId,
      photoUrl: data.photo_url || data.photoUrl,
      totalStands: data.total_stands || data.totalStands,
      totalSectors: data.total_sectors || data.totalSectors,
      totalRows: data.total_rows || data.totalRows,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt
    };
  },

  /**
   * Create new venue
   */
  async createVenue(payload: CreateVenuePayload): Promise<Venue> {
    const response = await axios.post('/api/venues', payload);
    return response.data;
  },

  /**
   * Update existing venue
   */
  async updateVenue(id: string, payload: UpdateVenuePayload): Promise<void> {
    await axios.put(`/api/venues/${id}`, payload);
  },

  /**
   * Delete venue
   */
  async deleteVenue(id: string): Promise<void> {
    await axios.delete(`/api/venues/${id}`);
  }
};
