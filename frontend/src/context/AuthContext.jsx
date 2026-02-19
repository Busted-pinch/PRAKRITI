import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => { },
    signup: () => { },
    logout: () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // verify token and get user data
                    const response = await api.get('/auth/me');
                    setUser(response.data.user); // Assuming /auth/me returns { user: ... }
                } catch (err) {
                    console.error("Session verification failed", err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data; // Adjust based on actual API response

            // Backend returns: { access_token, refresh_token, token_type }
            // /auth/me returns user data. 
            // So we need to set token first, then fetch user.

            localStorage.setItem('token', access_token);

            // Fetch user details immediately after login
            const meResponse = await api.get('/auth/me');
            setUser(meResponse.data.user);

            return true;
        } catch (err) {
            console.error("Login failed", err);
            setError(err.response?.data?.detail || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (full_name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register', { full_name, email, password });
            // Auto login or redirect to login? 
            // Usually redirect to login or show success message.
            return true;
        } catch (err) {
            console.error("Signup failed", err);
            setError(err.response?.data?.detail || "Signup failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
