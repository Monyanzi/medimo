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
  caregiver?: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    isEmergencyContact: boolean;
    checkInSettings?: {
      enabled: boolean;
      frequency: 'daily' | 'twice-daily' | 'custom';
      customHours?: number;
      reminderTime?: string;
      missedCheckInThreshold: number;
    };
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
  doctorName: string;
  location: string;
  dateTime: string;
  type?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  prescriptionPeriod?: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
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

export interface VitalSigns {
  id: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  weight?: number;
  temperature?: number;
  recordedDate: string;
  notes?: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  storagePath: string;
  category: 'Medical Records' | 'Lab Results' | 'Prescriptions' | 'Insurance' | 'Images' | 'Other';
  fileSize: number;
  description?: string;
  tags?: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  category: 'Medication' | 'Appointment' | 'Document' | 'Vitals' | 'Test' | 'Other';
  relatedId?: string;
}

export interface HealthDataContextType {
  medications: Medication[];
  appointments: Appointment[];
  documents: Document[];
  timelineEvents: TimelineEvent[];
  vitalSigns: VitalSigns[];
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addDocument: (document: Omit<Document, 'id'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateTimelineEvent: (id: string, event: Partial<TimelineEvent>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;
  addVitalSigns: (vitals: Omit<VitalSigns, 'id'>) => Promise<void>;
  updateVitalSigns: (id: string, vitals: Partial<VitalSigns>) => Promise<void>;
  deleteVitalSigns: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
