
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from 'sonner';
import { regenerateQRCode as serviceRegenerateQRCode, loadQRCodeFromStorage } from '@/services/qrCodeService';

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

  const generateQRCodeForUser = async (userData: User): Promise<User> => {
    try {
      console.log('Generating QR code for user...');
      const { data, imageUrl } = await serviceRegenerateQRCode(userData);
      
      return {
        ...userData,
        qrCode: {
          id: data.id,
          imageUrl: imageUrl,
          generatedAt: data.generatedAt
        }
      };
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
      return userData;
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    const initializeUser = async () => {
      try {
        // Check if QR code exists in storage
        const storedQRCode = loadQRCodeFromStorage();
        
        let userWithQR = mockUser;
        
        if (storedQRCode) {
          console.log('Loading existing QR code from storage');
          userWithQR = {
            ...mockUser,
            qrCode: {
              id: storedQRCode.data.id,
              imageUrl: storedQRCode.imageUrl,
              generatedAt: storedQRCode.data.generatedAt
            }
          };
        } else {
          console.log('Generating new QR code at startup');
          userWithQR = await generateQRCodeForUser(mockUser);
        }
        
        setUser(userWithQR);
        console.log('User loaded with QR code:', userWithQR);
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(mockUser);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeUser, 1000);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userWithQR = await generateQRCodeForUser(mockUser);
      setUser(userWithQR);
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
    localStorage.removeItem('medimo_qr_code');
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
      
      // Regenerate QR code if critical data changed
      const criticalFields = ['name', 'dob', 'bloodType', 'allergies', 'conditions', 'emergencyContact', 'organDonor'];
      const hasCriticalChanges = criticalFields.some(field => userData[field as keyof User] !== undefined);
      
      if (hasCriticalChanges) {
        console.log('Critical data changed, regenerating QR code...');
        const userWithNewQR = await generateQRCodeForUser(updatedUser);
        setUser(userWithNewQR);
        toast.success('Profile updated and QR code regenerated!');
      } else {
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const errorMessage = 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateQRCode = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userWithNewQR = await generateQRCodeForUser(user);
      setUser(userWithNewQR);
      toast.success('QR code regenerated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to regenerate QR code. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    regenerateQRCode,
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
