import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('sa_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('sa_token');
        if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            return storedToken;
        }
        return null;
    });

    useEffect(() => {
        // This effect can now be empty or removed if no other initialization is needed.
        // Keeping it empty for now to avoid breaking existing imports if any, or just removing it.
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('sa_token', newToken);
        localStorage.setItem('sa_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_user');
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
