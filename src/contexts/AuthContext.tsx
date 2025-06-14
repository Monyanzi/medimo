
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '@/types';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const mockUser: User = {
  id: "USR-2024-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  dob: "1985-04-15",
  bloodType: "O+",
  allergies: ["Penicillin", "Shellfish"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  organDonor: true,
  emergencyContact: {
    name: "Michael Johnson",
    phone: "+1 (555) 123-4567",
    relationship: "Spouse"
  },
  insurance: {
    provider: "Blue Cross Blue Shield",
    policyNumber: "BC123456789",
    memberId: "SJ001234"
  },
  roles: ["patient"],
  permissions: [
    "VIEW_DASHBOARD",
    "VIEW_TIMELINE", 
    "VIEW_VAULT",
    "UPDATE_OWN_PROFILE",
    "GENERATE_EMERGENCY_QR",
    "EXPORT_PDF_REPORT",
    "MANAGE_MEDICATIONS",
    "MANAGE_APPOINTMENTS",
    "MANAGE_DOCUMENTS"
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('medimo_auth_token');
    if (token) {
      // For demo, immediately set mock user
      setUser(mockUser);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, accept any email/password
      if (email && password) {
        const token = 'demo_token_' + Date.now();
        localStorage.setItem('medimo_auth_token', token);
        setUser(mockUser);
        toast.success('Welcome back to Medimo!');
      } else {
        throw new Error('Email and password are required');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medimo_auth_token');
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update user data
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
