/**
 * Authentication Service
 * 
 * Handles authentication with the backend API.
 * Includes token management and session persistence.
 */

import api from './api';

const TOKEN_KEY = 'medimo_auth_token';
const USER_KEY = 'medimo_current_user';

// Types matching the User interface from types/index.ts
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    dob?: string;
    bloodType?: string;
    organDonor?: boolean;
    importantNotes?: string;
    isOnboardingComplete?: boolean;
    allergies?: string[];
    conditions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    insurance?: {
        provider: string;
        policyNumber: string;
        memberId: string;
    };
}

export interface AuthResponse {
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

/**
 * Store authentication token
 */
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get stored authentication token
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token
 */
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store user data in localStorage (for quick access without API call)
 */
export const setStoredUser = (user: AuthUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get stored user data
 */
export const getStoredUser = (): AuthUser | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

/**
 * Remove stored user data
 */
export const removeStoredUser = (): void => {
    localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login', credentials);
        const { success, user, token, error } = response.data;

        if (success && token && user) {
            setToken(token);
            setStoredUser(user);
            return { success: true, user, token };
        }

        return { success: false, error: error || 'Login failed' };
    } catch (error: any) {
        const message = error.response?.data?.error || 'Login failed. Please try again.';
        return { success: false, error: message };
    }
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/register', data);
        const { success, user, token, error } = response.data;

        if (success && token && user) {
            setToken(token);
            setStoredUser(user);
            return { success: true, user, token };
        }

        return { success: false, error: error || 'Registration failed' };
    } catch (error: any) {
        const message = error.response?.data?.error || 'Registration failed. Please try again.';
        return { success: false, error: message };
    }
};

/**
 * Get current user profile from API
 */
export const getProfile = async (): Promise<AuthResponse> => {
    try {
        const response = await api.get('/auth/me');
        const { user } = response.data;

        if (user) {
            setStoredUser(user);
            return { success: true, user };
        }

        return { success: false, error: 'Failed to get profile' };
    } catch (error: any) {
        // If 401, token is invalid
        if (error.response?.status === 401) {
            logout();
        }
        return { success: false, error: 'Failed to get profile' };
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (userData: Partial<AuthUser>): Promise<AuthResponse> => {
    try {
        const response = await api.put('/users/profile', userData);
        const { user } = response.data;

        if (user) {
            setStoredUser(user);
            return { success: true, user };
        }

        return { success: false, error: 'Failed to update profile' };
    } catch (error: any) {
        const message = error.response?.data?.error || 'Failed to update profile';
        return { success: false, error: message };
    }
};

/**
 * Logout user - clear all auth data
 */
export const logout = (): void => {
    removeToken();
    removeStoredUser();
    // Clear other user-specific data
    localStorage.removeItem('medimo_qr_code');
    localStorage.removeItem('medimo_emergency_profile');
};

/**
 * Delete user account permanently
 */
export const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await api.delete('/auth/account');
        const { success, error } = response.data;

        if (success) {
            // Clear all local data after successful deletion
            logout();
            return { success: true };
        }

        return { success: false, error: error || 'Failed to delete account' };
    } catch (error: any) {
        const message = error.response?.data?.error || 'Failed to delete account. Please try again.';
        return { success: false, error: message };
    }
};

/**
 * Initialize auth state from stored data
 * Returns stored user if token exists, null otherwise
 */
export const initializeAuth = (): AuthUser | null => {
    const token = getToken();
    if (!token) {
        return null;
    }
    return getStoredUser();
};

// Export as default object for convenience
const authService = {
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    deleteAccount,
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
    removeStoredUser,
    isAuthenticated,
    initializeAuth,
};

export default authService;
