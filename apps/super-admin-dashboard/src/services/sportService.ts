import axios from 'axios';

export interface Sport {
  id: string;
  name: string;
  code: string;
  field_dimensions?: {
    length: number;
    width: number;
    unit: string;
  };
  icon_url?: string;
}

export const sportService = {
  /**
   * Get all available sports
   */
  async getSports(): Promise<Sport[]> {
    const response = await axios.get('/api/sports');
    return response.data;
  },

  /**
   * Get single sport by ID
   */
  async getSportById(id: string): Promise<Sport> {
    const response = await axios.get(`/api/sports/${id}`);
    return response.data;
  }
};
