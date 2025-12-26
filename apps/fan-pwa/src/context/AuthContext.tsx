
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'fan';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('fan_user');
        const expiresAt = localStorage.getItem('fan_expires_at');
        
        if (!storedUser) return null;

        // Check if session has expired (only if expiresAt exists)
        if (expiresAt) {
            const now = new Date().getTime();
            if (now > parseInt(expiresAt)) {
                // Session expired, clear storage
                localStorage.removeItem('fan_user');
                localStorage.removeItem('fan_token');
                localStorage.removeItem('fan_expires_at');
                return null;
            }
        }

        return JSON.parse(storedUser);
    });

    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('fan_token');
        const expiresAt = localStorage.getItem('fan_expires_at');

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

    useEffect(() => {
        // Handled in initialization
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        // Mock login for now, simply assuming success and setting a dummy user
        // In real implementation, this would call the API
        const mockToken = `mock_token_${Date.now()}`;
        
        const mockUser: User = {
            id: 'user_123',
            name: 'Fan User',
            email,
            role: 'fan'
        };
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('fan_user', JSON.stringify(mockUser));
        localStorage.setItem('fan_token', mockToken);

        // Set authorization header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

        // Set expiration based on rememberMe
        if (rememberMe) {
            // 30 days for remember me
            const expiresAt = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
            localStorage.setItem('fan_expires_at', expiresAt.toString());
        } else {
            // 24 hours default
            const expiresAt = new Date().getTime() + SESSION_DURATION;
            localStorage.setItem('fan_expires_at', expiresAt.toString());
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('fan_user');
        localStorage.removeItem('fan_token');
        localStorage.removeItem('fan_expires_at');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
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
