
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
    login: (slug: string, email: string, password: string, rememberMe?: boolean) => Promise<void>;
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

        return JSON.parse(storedUser);
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
            const clubData = JSON.parse(storedClub);
            // Dynamically update CSS variables for branding
            document.documentElement.style.setProperty('--color-primary', clubData.primaryColor);
            document.documentElement.style.setProperty('--color-secondary', clubData.secondaryColor);
            return clubData;
        }
        return null;
    });

    useEffect(() => {
        // No longer needed here as it's handled in state initialization
    }, []);

    const login = async (slug: string, email: string, password: string, rememberMe: boolean = false) => {
        // In a real app, we would verify credentials against the API
        // For now, we fetch the club by slug to get the ID, then mock the user
        try {

            // We now query our own API which has the /auth/:slug endpoint
            // The Nginx proxy at port 3102 forwards /api to port 3002 (club-backoffice-api)
            const response = await fetch(`/api/auth/${slug}`);

            if (response.status === 404) {
                throw new Error('Club not found');
            }

            const foundClub = await response.json();

            if (!foundClub) {
                throw new Error('Club not found');
            }

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
