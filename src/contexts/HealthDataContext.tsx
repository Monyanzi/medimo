
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medication, Appointment, Document, TimelineEvent, HealthDataContextType } from '@/types';
import { toast } from 'sonner';

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  const mockMedications: Medication[] = [
    {
      id: "med-001",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      instructions: "Take with water, preferably in the morning",
      status: "active"
    },
    {
      id: "med-002", 
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      instructions: "Take with meals to reduce stomach upset",
      status: "active"
    }
  ];

  const mockAppointments: Appointment[] = [
    {
      id: "apt-001",
      title: "Cardiology Follow-up",
      doctorName: "Dr. Evelyn Reed",
      location: "Heart Center, Room 204",
      dateTime: "2024-12-20T09:30:00Z",
      notes: "Follow-up on hypertension management and medication effectiveness"
    },
    {
      id: "apt-002",
      title: "Annual Physical",
      doctorName: "Dr. Sarah Mitchell",
      location: "Primary Care Clinic, Room 101",
      dateTime: "2024-12-25T14:00:00Z",
      notes: "Annual wellness check and lab work review"
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: "doc-001",
      fileName: "Blood_Test_Results_Nov2024.pdf",
      fileType: "PDF",
      uploadDate: "2024-11-15T10:30:00Z",
      storagePath: "/documents/blood_test_nov2024.pdf"
    },
    {
      id: "doc-002",
      fileName: "Chest_Xray_Oct2024.jpg",
      fileType: "Image",
      uploadDate: "2024-10-22T15:45:00Z",
      storagePath: "/documents/chest_xray_oct2024.jpg"
    }
  ];

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "event-001",
      title: "New Medication Started",
      details: "Lisinopril 10mg, once daily for hypertension",
      date: "2024-11-10T09:00:00Z",
      category: "Medication"
    },
    {
      id: "event-002",
      title: "Blood Pressure Logged",
      details: "135/85 mmHg, resting measurement",
      date: "2024-11-14T08:00:00Z",
      category: "Vitals"
    }
  ];

  useEffect(() => {
    console.log('HealthDataProvider initializing...');
    // Simulate data loading
    const timer = setTimeout(() => {
      setMedications(mockMedications);
      setAppointments(mockAppointments);
      setDocuments(mockDocuments);
      setTimelineEvents(mockTimelineEvents);
      setIsLoading(false);
      console.log('Health data loaded');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const addMedication = async (medication: Omit<Medication, 'id'>): Promise<void> => {
    try {
      const newMedication: Medication = {
        ...medication,
        id: `med-${Date.now()}`
      };
      setMedications(prev => [...prev, newMedication]);
      toast.success('Medication added successfully!');
    } catch (err) {
      toast.error('Failed to add medication');
      throw err;
    }
  };

  const updateMedication = async (id: string, medication: Partial<Medication>): Promise<void> => {
    try {
      setMedications(prev => prev.map(med => med.id === id ? { ...med, ...medication } : med));
      toast.success('Medication updated successfully!');
    } catch (err) {
      toast.error('Failed to update medication');
      throw err;
    }
  };

  const deleteMedication = async (id: string): Promise<void> => {
    try {
      setMedications(prev => prev.filter(med => med.id !== id));
      toast.success('Medication removed successfully!');
    } catch (err) {
      toast.error('Failed to remove medication');
      throw err;
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<void> => {
    try {
      const newAppointment: Appointment = {
        ...appointment,
        id: `apt-${Date.now()}`
      };
      setAppointments(prev => [...prev, newAppointment]);
      toast.success('Appointment added successfully!');
    } catch (err) {
      toast.error('Failed to add appointment');
      throw err;
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<void> => {
    try {
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...appointment } : apt));
      toast.success('Appointment updated successfully!');
    } catch (err) {
      toast.error('Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast.success('Appointment cancelled successfully!');
    } catch (err) {
      toast.error('Failed to cancel appointment');
      throw err;
    }
  };

  const addDocument = async (document: Omit<Document, 'id'>): Promise<void> => {
    try {
      const newDocument: Document = {
        ...document,
        id: `doc-${Date.now()}`
      };
      setDocuments(prev => [...prev, newDocument]);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload document');
      throw err;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete document');
      throw err;
    }
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>): Promise<void> => {
    try {
      const newEvent: TimelineEvent = {
        ...event,
        id: `event-${Date.now()}`
      };
      setTimelineEvents(prev => [...prev, newEvent]);
      toast.success('Timeline event added successfully!');
    } catch (err) {
      toast.error('Failed to add timeline event');
      throw err;
    }
  };

  const updateTimelineEvent = async (id: string, event: Partial<TimelineEvent>): Promise<void> => {
    try {
      setTimelineEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...event } : evt));
      toast.success('Timeline event updated successfully!');
    } catch (err) {
      toast.error('Failed to update timeline event');
      throw err;
    }
  };

  const deleteTimelineEvent = async (id: string): Promise<void> => {
    try {
      setTimelineEvents(prev => prev.filter(evt => evt.id !== id));
      toast.success('Timeline event deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete timeline event');
      throw err;
    }
  };

  const contextValue: HealthDataContextType = {
    medications,
    appointments,
    documents,
    timelineEvents,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addDocument,
    deleteDocument,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    isLoading,
    error
  };

  console.log('HealthDataContext rendering with data:', {
    medications: medications.length,
    appointments: appointments.length,
    documents: documents.length,
    timelineEvents: timelineEvents.length
  });

  return (
    <HealthDataContext.Provider value={contextValue}>
      {children}
    </HealthDataContext.Provider>
  );
};
