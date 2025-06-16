
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from 'sonner';
import { regenerateQRCode as serviceRegenerateQRCode, loadQRCodeFromStorage } from '@/services/qrCodeService';
import { MockAuthService, MockUser } from '@/services/mockAuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convert MockUser to User format
const convertMockUserToUser = (mockUser: MockUser): User => {
  return {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    isOnboardingComplete: mockUser.isOnboardingComplete, // Mapped this field
    dob: "1985-04-15", // Default values - will be updated during onboarding
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const initializeUser = () => { // No longer async itself, parts are async
      try {
        const mockUser = MockAuthService.getCurrentUser();
        
        if (mockUser) {
          let initialUser = convertMockUserToUser(mockUser);
          setUser(initialUser); // Set basic user data first
          console.log('Initial user data set:', initialUser.name);

          const storedQRCode = loadQRCodeFromStorage();
          if (storedQRCode) {
            // If QR is in storage, add it synchronously
            initialUser = {
              ...initialUser,
              qrCode: {
                id: storedQRCode.data.id,
                imageUrl: storedQRCode.imageUrl,
                generatedAt: storedQRCode.data.generatedAt
              }
            };
            setUser(initialUser); // Update with QR
            console.log('User loaded with stored QR code:', initialUser.name);
          } else {
            // Generate QR code asynchronously and update user state
            console.log('Generating new QR code at startup (async) for:', initialUser.name);
            generateQRCodeForUser(initialUser).then(userWithQR => {
              setUser(userWithQR); // Update user state with QR code
              console.log('User loaded with newly generated QR code:', userWithQR.name);
            }).catch(qrError => {
                console.error("Initial QR generation failed for user " + initialUser.id + ":", qrError);
                // User state remains with core data, QR is missing.
            });
          }
        } else {
          console.log('No authenticated user found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null); // Ensure user is null on error
      } finally {
        setIsLoading(false); // Set loading false after initial sync setup
      }
    };

    initializeUser();
  }, []); // generateQRCodeForUser should be stable or wrapped in useCallback if included in deps

  const login = async (email: string, password: string): Promise<{ success: boolean; user: User | null; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Logging in user:', email);
      // MockAuthService.login now has no artificial delay
      const response = await MockAuthService.login(email, password);
      
      if (response.success && response.user) {
        const convertedUser = convertMockUserToUser(response.user);

        let userToSet = convertMockUserToUser(response.user);

        toast.success('Login successful! Core user data loaded.');
        console.log('Core user data set for:', userToSet.name);

        // Attempt to load QR code from storage
        const storedQRCode = loadQRCodeFromStorage();
        if (storedQRCode && storedQRCode.data.medicalId === userToSet.id) {
          console.log('Using stored QR code for user:', userToSet.name);
          userToSet.qrCode = {
            id: storedQRCode.data.qrId, // Ensure mapping from new QRCodeData structure
            imageUrl: storedQRCode.imageUrl,
            generatedAt: storedQRCode.data.generatedAt
          };
          setUser(userToSet); // Set user with stored QR
        } else {
          // No stored QR or mismatched ID, set core user first, then generate QR async
          setUser(userToSet);
          console.log('No valid stored QR code found or ID mismatch for', userToSet.name + '. Generating new QR asynchronously.');
          generateQRCodeForUser(userToSet).then(userWithQR => {
            setUser(userWithQR); // Update user state with QR code
            console.log('QR code generated and user state updated for:', userWithQR.name);
          }).catch(qrError => {
            console.error("QR generation failed post-login for " + userToSet.id + ":", qrError);
          });
        }
        // Return user (potentially without QR if generation is async and not yet complete)
        return { success: true, user: userToSet };
      } else {
        const errorMessage = response.error || 'Login failed';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, user: null, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, user: null, error: errorMessage };
    } finally {
      setIsLoading(false); // Context's isLoading for the login operation itself
    }
  };

  const logout = (): void => {
    console.log('Logging out user...');
    MockAuthService.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem('medimo_qr_code');
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) {
      const error = 'No user logged in';
      console.error(error);
      toast.error(error);
      throw new Error(error);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let updatedUserObject = { ...user, ...userData };
      let qrRegenerated = false;

      // Regenerate QR code if relevant data changed
      // After PI-PROF-001, QRCodeData contains: qrId, userName, medicalId, emergencyContactName, emergencyContactPhone, generatedAt
      // User fields that map to this are: user.name (for userName), user.id (for medicalId), user.emergencyContact (for name & phone)
      const qrRelevantFields: (keyof User)[] = ['name', 'emergencyContact'];
      const hasQrRelevantChanges = qrRelevantFields.some(fieldKey => {
        if (!userData.hasOwnProperty(fieldKey)) return false; // Only check if field is in userData

        const newValue = userData[fieldKey];
        const oldValue = user[fieldKey];

        if (fieldKey === 'emergencyContact') {
          const oldEc = oldValue as User['emergencyContact']; // Type assertion
          const newEc = newValue as Partial<User['emergencyContact']>; // Type assertion
          // Check if newEc is provided and if its relevant sub-fields differ
          return newEc && (newEc.name !== oldEc.name || newEc.phone !== oldEc.phone);
        }
        return newValue !== undefined && JSON.stringify(newValue) !== JSON.stringify(oldValue);
      });

      if (hasQrRelevantChanges) {
        console.log('QR relevant data changed, regenerating QR code for user:', user.id);
        updatedUserObject = await generateQRCodeForUser(updatedUserObject);
        toast.success('Profile updated and QR code regenerated!');
        qrRegenerated = true;
      } else if (!updatedUserObject.qrCode && updatedUserObject.id) {
        // Case: User had no QR code before (e.g. first update after registration, or cleared storage)
        // And it's not an empty update (e.g. just isOnboardingComplete status change without other fields)
        if (Object.keys(userData).filter(k => k !== 'isOnboardingComplete').length > 0) {
            console.log('User has no QR code, generating one for user:', user.id);
            updatedUserObject = await generateQRCodeForUser(updatedUserObject);
            toast.info('QR code generated for your profile.');
            qrRegenerated = true; // Technically generated, not regenerated
        }
      }

      // If QR was not regenerated, but other userData was provided (not just isOnboardingComplete)
      if (!qrRegenerated && Object.keys(userData).some(k => k !== 'isOnboardingComplete' && userData[k as keyof User] !== undefined)) {
          toast.success('Profile updated successfully!');
      }

      setUser(updatedUserObject); // Update React state with all changes

      // If isOnboardingComplete was part of this update and set to true,
      // ensure MockAuthService is also updated.
      // This should use user.id from the original user object before it's updated in the current scope.
      if (userData.isOnboardingComplete === true && user.id) {
        await MockAuthService.updateUserOnboardingStatus(user.id, true);
        console.log('Onboarding status updated in MockAuthService for user:', user.id);
      }

      // console.log('User update completed:', updatedUserObject); // Use the latest user object
      
    } catch (err) {
      const errorMessage = 'Failed to update profile. Please try again.';
      console.error('Update user error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateQRCode = async (): Promise<void> => {
    if (!user) {
      const error = 'No user logged in';
      console.error(error);
      toast.error(error);
      throw new Error(error);
    }
    
    setIsLoading(true);
    
    try {
      console.log('Regenerating QR code for user:', user.name);
      const userWithNewQR = await generateQRCodeForUser(user);
      setUser(userWithNewQR);
      console.log('QR code regenerated successfully');
    } catch (err) {
      const errorMessage = 'Failed to regenerate QR code. Please try again.';
      console.error('Regenerate QR code error:', err);
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
    regenerateQRCode,
    isLoading,
    error
  };

  console.log('AuthContext rendering with user:', user ? user.name : 'null');

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
