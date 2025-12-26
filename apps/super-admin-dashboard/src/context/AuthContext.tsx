import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('sa_user');
        const expiresAt = localStorage.getItem('sa_expires_at');

        if (!storedUser) return null;

        // Check if session has expired (only if expiresAt exists)
        if (expiresAt) {
            const now = new Date().getTime();
            if (now > parseInt(expiresAt)) {
                // Session expired, clear storage
                localStorage.removeItem('sa_user');
                localStorage.removeItem('sa_token');
                localStorage.removeItem('sa_expires_at');
                return null;
            }
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('sa_user');
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('sa_token');
        const expiresAt = localStorage.getItem('sa_expires_at');

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

    const login = async (newToken: string, newUser: User, rememberMe: boolean = false) => {
        // optimistically update state
        setToken(newToken);
        setUser(newUser);

        localStorage.setItem('sa_token', newToken);
        localStorage.setItem('sa_user', JSON.stringify(newUser));

        // Set authorization header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        try {
            // Fetch session durations from settings
            const response = await axios.get('/api/settings');
            const sessionHours = parseInt(response.data.session_duration_hours?.value || '24');
            const rememberMeDays = parseInt(response.data.remember_me_duration_days?.value || '30');

            if (rememberMe) {
                // Set expiration based on settings
                const expiresAt = new Date().getTime() + (rememberMeDays * 24 * 60 * 60 * 1000);
                localStorage.setItem('sa_expires_at', expiresAt.toString());
            } else {
                // Set expiration based on settings
                const expiresAt = new Date().getTime() + (sessionHours * 60 * 60 * 1000);
                localStorage.setItem('sa_expires_at', expiresAt.toString());
            }
        } catch (error) {
            // Fallback to default values if settings fetch fails
            console.error('Failed to fetch settings, using defaults:', error);
            if (rememberMe) {
                const expiresAt = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
                localStorage.setItem('sa_expires_at', expiresAt.toString());
            } else {
                const expiresAt = new Date().getTime() + SESSION_DURATION;
                localStorage.setItem('sa_expires_at', expiresAt.toString());
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_user');
        localStorage.removeItem('sa_expires_at');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
