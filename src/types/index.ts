
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
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: 'active' | 'discontinued';
}

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  location: string;
  dateTime: string; // ISO 8601 format
  notes?: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'Image' | 'Lab Report' | 'Prescription' | 'Insurance Card' | 'Medical Record';
  uploadDate: string; // ISO 8601 format
  storagePath: string; // Local device path
  category: 'Medical Records' | 'Lab Results' | 'Prescriptions' | 'Insurance' | 'Images' | 'Other';
  fileSize: number; // in bytes
  description?: string;
  tags?: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  date: string;
  category: 'Medication' | 'Appointment' | 'Vitals' | 'Observation';
}

export type Permission = 
  | 'VIEW_DASHBOARD' 
  | 'VIEW_TIMELINE' 
  | 'VIEW_VAULT'
  | 'UPDATE_OWN_PROFILE'
  | 'GENERATE_EMERGENCY_QR'
  | 'EXPORT_PDF_REPORT'
  | 'MANAGE_MEDICATIONS'
  | 'MANAGE_APPOINTMENTS'
  | 'MANAGE_DOCUMENTS';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface HealthDataContextType {
  medications: Medication[];
  appointments: Appointment[];
  documents: Document[];
  timelineEvents: TimelineEvent[];
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
  isLoading: boolean;
  error: string | null;
}
