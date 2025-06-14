
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Medication, Appointment, Document, TimelineEvent, HealthDataContextType } from '@/types';
import { toast } from 'sonner';

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

// Mock data for demo
const mockMedications: Medication[] = [
  {
    id: "MED-001",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    instructions: "Take with water, preferably in the morning",
    status: "active"
  },
  {
    id: "MED-002", 
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    instructions: "Take with meals",
    status: "active"
  }
];

const mockAppointments: Appointment[] = [
  {
    id: "APT-001",
    title: "Cardiology Follow-up",
    doctorName: "Dr. Evelyn Reed",
    location: "Heart Health Center, Suite 203",
    dateTime: "2024-06-20T09:30:00.000Z",
    notes: "Follow-up on hypertension management"
  },
  {
    id: "APT-002",
    title: "Annual Physical",
    doctorName: "Dr. James Mitchell",
    location: "Family Practice Clinic",
    dateTime: "2024-07-15T14:00:00.000Z",
    notes: "Routine annual checkup"
  }
];

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "TL-001",
    title: "Blood Pressure Logged",
    details: "135/85 mmHg, resting",
    date: "2024-06-14T08:00:00.000Z",
    category: "Vitals"
  },
  {
    id: "TL-002",
    title: "New Medication Started",
    details: "Lisinopril 10mg, once daily",
    date: "2024-06-10T09:00:00.000Z",
    category: "Medication"
  }
];

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load mock data
    setMedications(mockMedications);
    setAppointments(mockAppointments);
    setTimelineEvents(mockTimelineEvents);
    setIsLoading(false);
  }, []);

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      const newMedication = {
        ...medication,
        id: `MED-${Date.now()}`
      };
      setMedications(prev => [...prev, newMedication]);
      
      // Add timeline event
      const timelineEvent: Omit<TimelineEvent, 'id'> = {
        title: `New Medication: ${medication.name}`,
        details: `${medication.dosage}, ${medication.frequency}`,
        date: new Date().toISOString(),
        category: 'Medication'
      };
      await addTimelineEvent(timelineEvent);
      
      toast.success('Medication added successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add medication';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateMedication = async (id: string, medicationData: Partial<Medication>) => {
    try {
      setMedications(prev => 
        prev.map(med => 
          med.id === id ? { ...med, ...medicationData } : med
        )
      );
      toast.success('Medication updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update medication';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const medication = medications.find(med => med.id === id);
      if (medication) {
        await updateMedication(id, { status: 'discontinued' });
        
        // Add timeline event
        const timelineEvent: Omit<TimelineEvent, 'id'> = {
          title: `Medication Discontinued: ${medication.name}`,
          details: `Stopped taking ${medication.dosage}`,
          date: new Date().toISOString(),
          category: 'Medication'
        };
        await addTimelineEvent(timelineEvent);
      }
      toast.success('Medication discontinued successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to discontinue medication';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = {
        ...appointment,
        id: `APT-${Date.now()}`
      };
      setAppointments(prev => [...prev, newAppointment]);
      
      // Add timeline event
      const timelineEvent: Omit<TimelineEvent, 'id'> = {
        title: `Appointment Scheduled: ${appointment.title}`,
        details: `With ${appointment.doctorName} at ${appointment.location}`,
        date: new Date().toISOString(),
        category: 'Appointment'
      };
      await addTimelineEvent(timelineEvent);
      
      toast.success('Appointment added successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add appointment';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, ...appointmentData } : apt
        )
      );
      toast.success('Appointment updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const appointment = appointments.find(apt => apt.id === id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      
      if (appointment) {
        // Add timeline event
        const timelineEvent: Omit<TimelineEvent, 'id'> = {
          title: `Appointment Cancelled: ${appointment.title}`,
          details: `Cancelled appointment with ${appointment.doctorName}`,
          date: new Date().toISOString(),
          category: 'Appointment'
        };
        await addTimelineEvent(timelineEvent);
      }
      
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const addDocument = async (document: Omit<Document, 'id'>) => {
    try {
      const newDocument = {
        ...document,
        id: `DOC-${Date.now()}`
      };
      setDocuments(prev => [...prev, newDocument]);
      toast.success('Document uploaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>) => {
    try {
      const newEvent = {
        ...event,
        id: `TL-${Date.now()}`
      };
      setTimelineEvents(prev => [...prev, newEvent].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add timeline event';
      setError(message);
      throw err;
    }
  };

  const updateTimelineEvent = async (id: string, eventData: Partial<TimelineEvent>) => {
    try {
      setTimelineEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        )
      );
      toast.success('Timeline event updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update timeline event';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const deleteTimelineEvent = async (id: string) => {
    try {
      setTimelineEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Timeline event deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete timeline event';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const value: HealthDataContextType = {
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

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = (): HealthDataContextType => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
