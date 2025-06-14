
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user data for development
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
      memberId: "BCBS987654321"
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

  useEffect(() => {
    console.log('AuthProvider initializing...');
    // Simulate loading delay
    const timer = setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
      console.log('User loaded:', mockUser);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUser);
      toast.success('Login successful!');
    } catch (err) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setError(null);
    localStorage.removeItem('medimo_auth_token');
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isLoading,
    error
  };

  console.log('AuthContext rendering with user:', user);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
