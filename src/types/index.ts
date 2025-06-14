
export interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  organDonor: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    memberId: string;
  };
  roles: string[];
  permissions: string[];
  qrCode?: {
    id: string;
    imageUrl: string;
    generatedAt: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  regenerateQRCode: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface HealthRecord {
  id: string;
  type: 'appointment' | 'medication' | 'vital' | 'document' | 'test';
  title: string;
  description?: string;
  date: string;
  provider?: string;
  status?: string;
  data?: any;
}

export interface Appointment {
  id: string;
  title: string;
  provider: string;
  location: string;
  dateTime: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
}

export interface Vital {
  id: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: string;
  recordedBy?: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url: string;
  category: string;
}
