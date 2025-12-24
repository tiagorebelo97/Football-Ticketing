
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'fan';
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('fan_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        // Handled in initialization
    }, []);

    const login = async (email: string) => {
        // Mock login for now, simply assuming success and setting a dummy user
        // In real implementation, this would call the API
        const mockUser: User = {
            id: 'user_123',
            name: 'Fan User',
            email,
            role: 'fan'
        };
        setUser(mockUser);
        localStorage.setItem('fan_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fan_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
