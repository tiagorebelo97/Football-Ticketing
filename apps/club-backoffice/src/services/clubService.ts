import axios from 'axios';

export interface Country {
    id: string;
    name: string;
    code: string;
    flag_url?: string;
}

export interface Club {
    id: string;
    name: string;
    short_name?: string;
    slug: string;
    logo_url?: string;
    country_id?: string;
    country_name?: string;
    country_code?: string;
    founded_year?: number;
    stadium_capacity?: number;
    website?: string;
    primary_color: string;
    secondary_color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UpdateClubData {
    name: string;
    short_name?: string;
    logo_url?: string;
    country_id?: string;
    founded_year?: number;
    stadium_capacity?: number;
    website?: string;
    primary_color?: string;
    secondary_color?: string;
}

const API_BASE_URL = '/api/clubs';

export const clubService = {
    getClubById: async (clubId: string): Promise<Club> => {
        const response = await axios.get(`${API_BASE_URL}/${clubId}`);
        return response.data;
    },

    updateClub: async (clubId: string, data: UpdateClubData): Promise<Club> => {
        const response = await axios.put(`${API_BASE_URL}/${clubId}`, data);
        return response.data;
    },

    getCountries: async (): Promise<Country[]> => {
        const response = await axios.get(`${API_BASE_URL}/countries`);
        return response.data;
    }
};
