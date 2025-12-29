
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Club {
    id: string;
    name: string;
    slug: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'club_admin';
    clubId: string;
}

interface AuthContextType {
    user: User | null;
    club: Club | null;
    token: string | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('club_user');
        const expiresAt = localStorage.getItem('club_expires_at');

        if (!storedUser) return null;

        // Check if session has expired (only if expiresAt exists)
        if (expiresAt) {
            const now = new Date().getTime();
            if (now > parseInt(expiresAt)) {
                // Session expired, clear storage
                localStorage.removeItem('club_user');
                localStorage.removeItem('club_token');
                localStorage.removeItem('club_expires_at');
                localStorage.removeItem('club_data');
                return null;
            }
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            // Check for legacy/invalid club IDs
            if (parsedUser.clubId === 'demo-club-id' || parsedUser.clubId === 'test-club-id') {
                console.warn('Found legacy invalid clubId, clearing session');
                localStorage.removeItem('club_user');
                localStorage.removeItem('club_token');
                localStorage.removeItem('club_expires_at');
                localStorage.removeItem('club_data');
                return null;
            }
            return parsedUser;
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('club_user');
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('club_token');
        const expiresAt = localStorage.getItem('club_expires_at');

        if (!storedToken) return null;

        // Check if session has expired (only if expiresAt exists)
        if (expiresAt) {
            const now = new Date().getTime();
            if (now > parseInt(expiresAt)) {
                // Session expired
                return null;
            }
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        return storedToken;
    });

    const [club, setClub] = useState<Club | null>(() => {
        const storedClub = localStorage.getItem('club_data');
        if (storedClub) {
            try {
                const clubData = JSON.parse(storedClub);
                // Dynamically update CSS variables for branding
                document.documentElement.style.setProperty('--color-primary', clubData.primaryColor);
                document.documentElement.style.setProperty('--color-secondary', clubData.secondaryColor);
                return clubData;
            } catch (error) {
                console.error('Failed to parse stored club data:', error);
                localStorage.removeItem('club_data');
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
        // No longer needed here as it's handled in state initialization
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        // Mock authentication - in real app would verify credentials
        try {
            // TODO: Replace with real authentication
            // For now, we'll mock a user lookup by email
            // In production, this would verify password and return user data

            // Mock user data - hardcoded for development
            // In reality, this would come from the auth API
            const mockClubId = 'b9bb9b55-fe9e-4bf3-9aa8-34b76b26f185'; // fofo club

            // Fetch club data by club_id
            const clubResponse = await fetch(`/api/clubs/${mockClubId}`);

            if (!clubResponse.ok) {
                throw new Error('Failed to load club data');
            }

            const foundClub = await clubResponse.json();

            // Mock token (in real app this would come from API)
            const mockToken = `mock_token_${Date.now()}`;

            const mockUser: User = {
                id: 'admin_123',
                name: 'Club Admin',
                email,
                role: 'club_admin',
                clubId: foundClub.id
            };

            const clubData: Club = {
                id: foundClub.id,
                name: foundClub.name,
                slug: foundClub.slug,
                primaryColor: foundClub.primary_color,
                secondaryColor: foundClub.secondary_color,
                logoUrl: foundClub.logo_url
            };

            setUser(mockUser);
            setClub(clubData);
            setToken(mockToken);

            localStorage.setItem('club_user', JSON.stringify(mockUser));
            localStorage.setItem('club_data', JSON.stringify(clubData));
            localStorage.setItem('club_token', mockToken);

            // Set authorization header for subsequent requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

            // Set expiration based on rememberMe
            if (rememberMe) {
                // 30 days for remember me
                const expiresAt = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
                localStorage.setItem('club_expires_at', expiresAt.toString());
            } else {
                // 24 hours default
                const expiresAt = new Date().getTime() + SESSION_DURATION;
                localStorage.setItem('club_expires_at', expiresAt.toString());
            }

            // Dynamically update CSS variables for branding
            document.documentElement.style.setProperty('--color-primary', clubData.primaryColor);
            document.documentElement.style.setProperty('--color-secondary', clubData.secondaryColor);

        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setClub(null);
        setToken(null);
        localStorage.removeItem('club_user');
        localStorage.removeItem('club_data');
        localStorage.removeItem('club_token');
        localStorage.removeItem('club_expires_at');
        delete axios.defaults.headers.common['Authorization'];
        // Reset colors
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-secondary');
    };

    return (
        <AuthContext.Provider value={{ user, club, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
