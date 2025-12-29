import axios from 'axios';

const API_BASE = '/api';

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystemRole: boolean;
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    role: {
        id: string;
        name: string;
        description: string;
        permissions: string[];
    };
}

export interface CreateUserRequest {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId: string;
}

export interface UpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId?: string;
    isActive?: boolean;
}

export const userService = {
    async getUsers(clubId: string): Promise<User[]> {
        const response = await axios.get(`${API_BASE}/clubs/${clubId}/users`);
        return response.data;
    },

    async getRoles(clubId: string): Promise<Role[]> {
        const response = await axios.get(`${API_BASE}/clubs/${clubId}/roles`);
        return response.data;
    },

    async createUser(clubId: string, data: CreateUserRequest): Promise<User> {
        const response = await axios.post(`${API_BASE}/clubs/${clubId}/users`, data);
        return response.data;
    },

    async updateUser(clubId: string, userId: string, data: UpdateUserRequest): Promise<User> {
        const response = await axios.put(`${API_BASE}/clubs/${clubId}/users/${userId}`, data);
        return response.data;
    },

    async deleteUser(clubId: string, userId: string): Promise<void> {
        await axios.delete(`${API_BASE}/clubs/${clubId}/users/${userId}`);
    }
};

// Permission helpers
export const PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    MANAGE_MATCHES: 'manage_matches',
    MANAGE_VENUES: 'manage_venues',
    MANAGE_NFC: 'manage_nfc',
    VIEW_REPORTS: 'view_reports',
    MANAGE_SETTINGS: 'manage_settings'
} as const;

export const PERMISSION_LABELS: Record<string, string> = {
    [PERMISSIONS.MANAGE_USERS]: 'Manage Users',
    [PERMISSIONS.MANAGE_MATCHES]: 'Manage Matches',
    [PERMISSIONS.MANAGE_VENUES]: 'Manage Venues',
    [PERMISSIONS.MANAGE_NFC]: 'Manage NFC Cards',
    [PERMISSIONS.VIEW_REPORTS]: 'View Reports',
    [PERMISSIONS.MANAGE_SETTINGS]: 'Manage Settings'
};
