
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    login: (slug: string, email: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [club, setClub] = useState<Club | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('club_user');
        const storedClub = localStorage.getItem('club_data');
        if (storedUser && storedClub) {
            setUser(JSON.parse(storedUser));
            setClub(JSON.parse(storedClub));
        }
    }, []);

    const login = async (slug: string, email: string) => {
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

            localStorage.setItem('club_user', JSON.stringify(mockUser));
            localStorage.setItem('club_data', JSON.stringify(clubData));

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
        localStorage.removeItem('club_user');
        localStorage.removeItem('club_data');
        // Reset colors
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-secondary');
    };

    return (
        <AuthContext.Provider value={{ user, club, login, logout, isAuthenticated: !!user }}>
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
