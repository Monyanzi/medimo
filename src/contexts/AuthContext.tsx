
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, Medication } from '@/types';
import { toast } from 'sonner';
import { regenerateQRCode as serviceRegenerateQRCode, loadQRCodeFromStorage } from '@/services/qrCodeService';
import { MockAuthService, MockUser } from '@/services/mockAuthService';
import { saveEmergencyDataToStorage } from '@/components/features/DigitalEmergencyCard';
import config from '@/config';
import * as apiAuthService from '@/services/authService';
import { medicationReminderService } from '@/services/medicationReminderService';

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
  // Argentina Scenario Injection for Sarah Johnson
  if (mockUser.email === "sarah.johnson@email.com") {
    return {
      id: mockUser.id,
      name: "Sarah van der Berg", // Scenario Name
      email: mockUser.email,
      isOnboardingComplete: mockUser.isOnboardingComplete,
      dob: "1993-04-15", // 32 years old
      bloodType: "O-", // Critical for scenario
      allergies: ["Penicillin", "Sulfa drugs", "Latex"],
      conditions: ["Asthma", "Hypothyroidism"],
      organDonor: true,
      importantNotes: "Possible early pregnancy (4-6 weeks, unconfirmed). Do NOT give X-ray without consent. Latex allergy - use nitrile gloves only.",
      emergencyContact: {
        name: "David van der Berg",
        phone: "+27 82 555 1234",
        relationship: "Husband"
      },
      insurance: {
        provider: "Discovery Health International",
        policyNumber: "DH29481726",
        memberId: "DH29481726"
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
  }

  // David Martinez - Distinct test user profile
  if (mockUser.email === "david.martinez@example.com") {
    return {
      id: mockUser.id,
      name: "David Martinez",
      email: mockUser.email,
      isOnboardingComplete: mockUser.isOnboardingComplete,
      dob: "1978-11-22",
      bloodType: "A+",
      allergies: ["Aspirin"],
      conditions: ["Migraine", "Lower Back Pain"],
      organDonor: false,
      importantNotes: "",
      emergencyContact: {
        name: "Maria Martinez",
        phone: "+1 (555) 987-6543",
        relationship: "Wife"
      },
      insurance: {
        provider: "Aetna Health",
        policyNumber: "AET55512345",
        memberId: "AET55512345"
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
  }

  // Kenji Nakamura - Data Isolation Test User
  // VASTLY DIFFERENT from Sarah and David - if any of their data appears, test FAILS
  if (mockUser.email === "kenji.nakamura@test.jp") {
    return {
      id: mockUser.id,
      name: "Kenji Nakamura",
      email: mockUser.email,
      isOnboardingComplete: mockUser.isOnboardingComplete,
      dob: "1965-08-03", // Much older, different generation
      bloodType: "AB-", // Rare blood type, different from Sarah (O-) and David (A+)
      allergies: ["Shellfish", "Iodine Contrast Dye"], // Completely different allergies
      conditions: ["Type 2 Diabetes", "Glaucoma", "Gout"], // Different conditions
      organDonor: true,
      importantNotes: "Insulin-dependent. Carries glucose tablets. Vision impaired - needs large print materials. Speaks Japanese primarily, limited English.",
      emergencyContact: {
        name: "Yuki Nakamura",
        phone: "+81 90-1234-5678",
        relationship: "Daughter"
      },
      insurance: {
        provider: "Japan Health Insurance (JHI)",
        policyNumber: "JHI-TKY-2024-8899",
        memberId: "NAK-6508030001"
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
  }

  // Default fallback for any other users
  return {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    isOnboardingComplete: mockUser.isOnboardingComplete,
    dob: "1985-04-15",
    bloodType: "O+",
    allergies: [],
    conditions: [],
    organDonor: false,
    importantNotes: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    insurance: {
      provider: "",
      policyNumber: "",
      memberId: ""
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

  const generateQRCodeForUser = async (userData: User, medications: Medication[] = []): Promise<User> => {
    try {
      const { data, imageUrl } = await serviceRegenerateQRCode(userData, medications);

      return {
        ...userData,
        qrCode: {
          id: data.qrId,
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
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        if (config.useApi) {
          // API MODE: Check for stored token and fetch profile
          const storedUser = apiAuthService.initializeAuth();

          if (storedUser) {
            // We have a stored user, fetch fresh profile from API
            const profileResponse = await apiAuthService.getProfile();

            if (profileResponse.success && profileResponse.user) {
              const user: User = {
                id: profileResponse.user.id,
                name: profileResponse.user.name,
                email: profileResponse.user.email,
                isOnboardingComplete: profileResponse.user.isOnboardingComplete ?? false,
                dob: profileResponse.user.dob || '',
                bloodType: profileResponse.user.bloodType || '',
                allergies: profileResponse.user.allergies || [],
                conditions: profileResponse.user.conditions || [],
                organDonor: profileResponse.user.organDonor ?? false,
                importantNotes: profileResponse.user.importantNotes || '',
                emergencyContact: profileResponse.user.emergencyContact || { name: '', phone: '', relationship: '' },
                insurance: profileResponse.user.insurance || { provider: '', policyNumber: '', memberId: '' },
                roles: ['patient'],
                permissions: ['VIEW_DASHBOARD', 'VIEW_TIMELINE', 'VIEW_VAULT', 'UPDATE_OWN_PROFILE', 'GENERATE_EMERGENCY_QR', 'EXPORT_PDF_REPORT', 'MANAGE_MEDICATIONS', 'MANAGE_APPOINTMENTS', 'MANAGE_DOCUMENTS'],
              };

              if (!cancelled) setUser(user);

              // Load QR code
              const storedQRCode = loadQRCodeFromStorage();
              if (storedQRCode) {
                user.qrCode = { id: storedQRCode.data.qrId, imageUrl: storedQRCode.imageUrl, generatedAt: storedQRCode.data.generatedAt };
                if (!cancelled) setUser({ ...user });
              } else {
                generateQRCodeForUser(user).then(userWithQR => { if (!cancelled) setUser(userWithQR); }).catch(console.error);
              }
            } else {
              // Token invalid, clear and show login
              apiAuthService.logout();
              if (!cancelled) setUser(null);
            }
          } else {
            if (!cancelled) setUser(null);
          }
        } else {
          // MOCK MODE: Existing behavior
          const mockUser = MockAuthService.getCurrentUser();
          if (mockUser) {
            let baseUser = convertMockUserToUser(mockUser);
            if (!cancelled) setUser(baseUser);
            const storedQRCode = loadQRCodeFromStorage();
            if (storedQRCode) {
              baseUser = {
                ...baseUser,
                qrCode: { id: storedQRCode.data.qrId, imageUrl: storedQRCode.imageUrl, generatedAt: storedQRCode.data.generatedAt }
              };
              if (!cancelled) setUser(baseUser);
            } else {
              generateQRCodeForUser(baseUser).then(userWithQR => { if (!cancelled) setUser(userWithQR); }).catch(console.error);
            }
          } else {
            if (!cancelled) setUser(null);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    initializeAuth();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user: User | null; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      let userToSet: User;

      if (config.useApi) {
        // API MODE: Use real backend
        const response = await apiAuthService.login({ email, password });

        if (!response.success || !response.user) {
          const errorMessage = response.error || 'Login failed';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, user: null, error: errorMessage };
        }

        // Convert API response to User format with defaults for missing fields
        userToSet = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          isOnboardingComplete: response.user.isOnboardingComplete ?? false,
          dob: response.user.dob || '',
          bloodType: response.user.bloodType || '',
          allergies: response.user.allergies || [],
          conditions: response.user.conditions || [],
          organDonor: response.user.organDonor ?? false,
          importantNotes: response.user.importantNotes || '',
          emergencyContact: response.user.emergencyContact || { name: '', phone: '', relationship: '' },
          insurance: response.user.insurance || { provider: '', policyNumber: '', memberId: '' },
          roles: ['patient'],
          permissions: ['VIEW_DASHBOARD', 'VIEW_TIMELINE', 'VIEW_VAULT', 'UPDATE_OWN_PROFILE', 'GENERATE_EMERGENCY_QR', 'EXPORT_PDF_REPORT', 'MANAGE_MEDICATIONS', 'MANAGE_APPOINTMENTS', 'MANAGE_DOCUMENTS'],
        };
      } else {
        // MOCK MODE: Use localStorage-based mock service
        const response = await MockAuthService.login(email, password);

        if (!response.success || !response.user) {
          const errorMessage = response.error || 'Login failed';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, user: null, error: errorMessage };
        }

        userToSet = convertMockUserToUser(response.user);
      }

      toast.success('Login successful!');

      // Attempt to load QR code from storage
      const storedQRCode = loadQRCodeFromStorage();
      if (storedQRCode && storedQRCode.data.medicalId === userToSet.id) {
        userToSet.qrCode = {
          id: storedQRCode.data.qrId,
          imageUrl: storedQRCode.imageUrl,
          generatedAt: storedQRCode.data.generatedAt
        };
        setUser(userToSet);
      } else {
        setUser(userToSet);
        generateQRCodeForUser(userToSet).then(userWithQR => {
          setUser(userWithQR);
        }).catch(qrError => {
          console.error("QR generation failed post-login:", qrError);
        });
      }

      // Persist emergency data for offline access
      saveEmergencyDataToStorage({
        name: userToSet.name,
        bloodType: userToSet.bloodType,
        allergies: userToSet.allergies,
        conditions: userToSet.conditions,
        emergencyContact: userToSet.emergencyContact,
        importantNotes: userToSet.importantNotes,
        qrCodeUrl: userToSet.qrCode?.imageUrl
      });

      return { success: true, user: userToSet };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, user: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; user: User | null; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      let userToSet: User;

      if (config.useApi) {
        // API MODE: Use real backend
        const response = await apiAuthService.register({ name, email, password });

        if (!response.success || !response.user) {
          const errorMessage = response.error || 'Registration failed';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, user: null, error: errorMessage };
        }

        userToSet = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          isOnboardingComplete: true,  // Skip onboarding - name/email/password already collected
          dob: '',
          bloodType: '',
          allergies: [],
          conditions: [],
          organDonor: false,
          importantNotes: '',
          emergencyContact: { name: '', phone: '', relationship: '' },
          insurance: { provider: '', policyNumber: '', memberId: '' },
          roles: ['patient'],
          permissions: ['VIEW_DASHBOARD', 'VIEW_TIMELINE', 'VIEW_VAULT', 'UPDATE_OWN_PROFILE', 'GENERATE_EMERGENCY_QR', 'EXPORT_PDF_REPORT', 'MANAGE_MEDICATIONS', 'MANAGE_APPOINTMENTS', 'MANAGE_DOCUMENTS'],
        };
      } else {
        // MOCK MODE
        const response = await MockAuthService.register(name, email, password);

        if (!response.success || !response.user) {
          const errorMessage = response.error || 'Registration failed';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, user: null, error: errorMessage };
        }

        userToSet = convertMockUserToUser(response.user);
      }

      setUser(userToSet);
      toast.success('Account created successfully!');

      // Generate QR code async
      generateQRCodeForUser(userToSet).then(userWithQR => {
        setUser(userWithQR);
      }).catch(qrError => {
        console.error("QR generation failed post-registration:", qrError);
      });

      return { success: true, user: userToSet };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, user: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    if (config.useApi) {
      // API MODE: Clear token
      apiAuthService.logout();
    } else {
      // MOCK MODE
      MockAuthService.logout();
    }

    // Clear medication reminder data to prevent cross-user leakage
    medicationReminderService.clearData();

    setUser(null);
    setError(null);
    // Clear user-specific cached data for security/separation
    localStorage.removeItem('medimo_qr_code');
    localStorage.removeItem('medimo_emergency_profile');
    toast.success('Logged out successfully');
  };

  const deleteCurrentAccount = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      if (config.useApi) {
        // API MODE: Delete account from backend
        const response = await apiAuthService.deleteAccount();
        
        if (!response.success) {
          const errorMessage = response.error || 'Failed to delete account';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      } else {
        // MOCK MODE: Delete from localStorage
        const currentUser = MockAuthService.getCurrentUser();
        if (!currentUser) {
          toast.error('No account found to delete.');
          return { success: false, error: 'No account found' };
        }
        MockAuthService.deleteCurrentUser();
      }

      // Clear all local data
      medicationReminderService.clearData();
      setUser(null);
      setError(null);
      localStorage.removeItem('medimo_qr_code');
      localStorage.removeItem('medimo_emergency_profile');

      toast.success('Account permanently deleted');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
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
      // QRCodeData now contains allergies, conditions, bloodType, medications
      const qrRelevantFields: (keyof User)[] = ['name', 'emergencyContact', 'allergies', 'conditions', 'bloodType'];
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
        updatedUserObject = await generateQRCodeForUser(updatedUserObject);
        toast.success('Profile updated and QR code regenerated!');
        qrRegenerated = true;
      } else if (!updatedUserObject.qrCode && updatedUserObject.id) {
        // Case: User had no QR code before (e.g. first update after registration, or cleared storage)
        // And it's not an empty update (e.g. just isOnboardingComplete status change without other fields)
        if (Object.keys(userData).filter(k => k !== 'isOnboardingComplete').length > 0) {
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
      // ensure MockAuthService is also updated - but ONLY in mock mode.
      if (userData.isOnboardingComplete === true && user.id && !config.useApi) {
        await MockAuthService.updateUserOnboardingStatus(user.id, true);
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
      const userWithNewQR = await generateQRCodeForUser(user);
      setUser(userWithNewQR);
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
    register,
    logout,
    deleteCurrentAccount,
    updateUser,
    regenerateQRCode,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
