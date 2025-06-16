
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medication, Appointment, Document, TimelineEvent, VitalSigns, HealthDataContextType } from '@/types';
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
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
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
      storagePath: "/documents/blood_test_nov2024.pdf",
      category: "Lab Results",
      fileSize: 2048000
    },
    {
      id: "doc-002",
      fileName: "Chest_Xray_Oct2024.jpg",
      fileType: "Image",
      uploadDate: "2024-10-22T15:45:00Z",
      storagePath: "/documents/chest_xray_oct2024.jpg",
      category: "Images", 
      fileSize: 1536000
    }
  ];

  const mockVitalSigns: VitalSigns[] = [
    {
      id: "vital-001",
      bloodPressureSystolic: 135,
      bloodPressureDiastolic: 85,
      heartRate: 72,
      weight: 175,
      recordedDate: "2024-11-14T08:00:00Z",
      notes: "Morning reading before medication"
    }
  ];

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "event-001",
      title: "Medication Started",
      details: "Lisinopril 10mg prescribed for hypertension management",
      date: "2024-11-10T09:00:00Z",
      category: "Medication",
      relatedId: "med-001"
    },
    {
      id: "event-002",
      title: "Blood Pressure Recorded",
      details: "135/85 mmHg, Heart Rate: 72 bpm",
      date: "2024-11-14T08:00:00Z",
      category: "Vitals",
      relatedId: "vital-001"
    },
    {
      id: "event-003",
      title: "Lab Results Uploaded",
      details: "Blood test results from November 2024",
      date: "2024-11-15T10:30:00Z",
      category: "Document",
      relatedId: "doc-001"
    },
    {
      id: "event-004",
      title: "Appointment Scheduled",
      details: "Cardiology follow-up with Dr. Evelyn Reed",
      date: "2024-11-16T14:00:00Z",
      category: "Appointment",
      relatedId: "apt-001"
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
      setVitalSigns(mockVitalSigns);
      setIsLoading(false);
      console.log('Health data loaded');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Helper function to create timeline events
  const createTimelineEvent = (event: Omit<TimelineEvent, 'id'>): TimelineEvent => {
    return {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  };

  const addMedication = async (medication: Omit<Medication, 'id'>): Promise<void> => {
    try {
      const newMedication: Medication = {
        ...medication,
        id: `med-${Date.now()}`
      };
      setMedications(prev => [...prev, newMedication]);
      
      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Medication Added",
        details: `${medication.name} ${medication.dosage} - ${medication.frequency}`,
        date: new Date().toISOString(),
        category: "Medication",
        relatedId: newMedication.id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);
      
      toast.success('Medication added successfully!');
    } catch (err) {
      toast.error('Failed to add medication');
      throw err;
    }
  };

  const updateMedication = async (id: string, medication: Partial<Medication>): Promise<void> => {
    try {
      const existingMedication = medications.find(m => m.id === id);
      setMedications(prev => prev.map(med => med.id === id ? { ...med, ...medication } : med));
      
      // Auto-generate timeline event for significant changes
      let eventGenerated = false;
      if (medication.status && existingMedication?.status !== medication.status) {
        const timelineEvent = createTimelineEvent({
          title: `Medication Status Updated: ${medication.name || existingMedication?.name}`,
          details: `Status changed from ${existingMedication?.status} to ${medication.status}`,
          date: new Date().toISOString(),
          category: "Medication",
          relatedId: id
        });
        setTimelineEvents(prev => [...prev, timelineEvent]);
        eventGenerated = true;
      } else if (medication.dosage !== undefined && existingMedication?.dosage !== medication.dosage ||
                 medication.frequency !== undefined && existingMedication?.frequency !== medication.frequency) {
        const timelineEvent = createTimelineEvent({
          title: `Medication Updated: ${medication.name || existingMedication?.name}`,
          details: `Dosage/frequency updated for ${medication.name || existingMedication?.name}. New: ${medication.dosage || existingMedication?.dosage}, ${medication.frequency || existingMedication?.frequency}`,
          date: new Date().toISOString(),
          category: "Medication",
          relatedId: id
        });
        setTimelineEvents(prev => [...prev, timelineEvent]);
        eventGenerated = true;
      }
      
      toast.success('Medication updated successfully!');
    } catch (err) {
      toast.error('Failed to update medication');
      throw err;
    }
  };

  const deleteMedication = async (id: string): Promise<void> => {
    try {
      const medication = medications.find(med => med.id === id);
      setMedications(prev => prev.filter(med => med.id !== id));
      
      // Auto-generate timeline event
      if (medication) {
        const timelineEvent = createTimelineEvent({
          title: "Medication Removed",
          details: `${medication.name} removed from medication list`,
          date: new Date().toISOString(),
          category: "Medication",
          relatedId: id
        });
        setTimelineEvents(prev => [...prev, timelineEvent]);
      }
      
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
      
      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Appointment Scheduled",
        details: `${appointment.title} with ${appointment.doctorName}`,
        date: new Date().toISOString(),
        category: "Appointment",
        relatedId: newAppointment.id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);
      
      toast.success('Appointment added successfully!');
    } catch (err) {
      toast.error('Failed to add appointment');
      throw err;
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<void> => {
    try {
      const existingAppointment = appointments.find(a => a.id === id);
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...appointment } : apt));

      // Auto-generate timeline event for updates
      const timelineEvent = createTimelineEvent({
        title: `Appointment Updated: ${appointment.title || existingAppointment?.title}`,
        details: `Details updated for appointment with ${appointment.doctorName || existingAppointment?.doctorName}.`,
        date: new Date().toISOString(), // Or use appointment.dateTime if it's more relevant for "update" time
        category: "Appointment",
        relatedId: id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);

      toast.success('Appointment updated successfully!');
    } catch (err) {
      toast.error('Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      const appointment = appointments.find(apt => apt.id === id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      
      // Auto-generate timeline event
      if (appointment) {
        const timelineEvent = createTimelineEvent({
          title: "Appointment Cancelled",
          details: `${appointment.title} appointment cancelled`,
          date: new Date().toISOString(),
          category: "Appointment",
          relatedId: id
        });
        setTimelineEvents(prev => [...prev, timelineEvent]);
      }
      
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
      
      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Document Uploaded",
        details: `${document.fileName} - ${document.category}`,
        date: new Date().toISOString(),
        category: "Document",
        relatedId: newDocument.id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);
      
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload document');
      throw err;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      const document = documents.find(doc => doc.id === id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Auto-generate timeline event
      if (document) {
        const timelineEvent = createTimelineEvent({
          title: "Document Deleted",
          details: `${document.fileName} removed from vault`,
          date: new Date().toISOString(),
          category: "Document",
          relatedId: id
        });
        setTimelineEvents(prev => [...prev, timelineEvent]);
      }
      
      toast.success('Document deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete document');
      throw err;
    }
  };

  const addVitalSigns = async (vitals: Omit<VitalSigns, 'id'>): Promise<void> => {
    try {
      const newVitals: VitalSigns = {
        ...vitals,
        id: `vital-${Date.now()}`
      };
      setVitalSigns(prev => [...prev, newVitals]);
      
      // Auto-generate timeline event
      const details = [];
      if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
        details.push(`BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`);
      }
      if (vitals.heartRate) details.push(`HR: ${vitals.heartRate} bpm`);
      if (vitals.weight) details.push(`Weight: ${vitals.weight} lbs`);
      if (vitals.temperature) details.push(`Temp: ${vitals.temperature}°F`);
      
      const timelineEvent = createTimelineEvent({
        title: "Vitals Recorded",
        details: details.join(', ') || 'Vital signs recorded',
        date: new Date().toISOString(),
        category: "Vitals",
        relatedId: newVitals.id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);
      
      toast.success('Vital signs recorded successfully!');
    } catch (err) {
      toast.error('Failed to record vital signs');
      throw err;
    }
  };

  const updateVitalSigns = async (id: string, vitals: Partial<VitalSigns>): Promise<void> => {
    try {
      setVitalSigns(prev => prev.map(v => v.id === id ? { ...v, ...vitals } : v));

      // Auto-generate timeline event for updates
      const details = [];
      if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
        details.push(`BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`);
      }
      if (vitals.heartRate) details.push(`HR: ${vitals.heartRate} bpm`);
      // Add other vital fields as needed for the details string

      const timelineEvent = createTimelineEvent({
        title: "Vitals Updated",
        details: details.length > 0 ? `Updated: ${details.join(', ')}` : 'Vital signs record updated.',
        date: new Date().toISOString(), // Or use vitals.recordedDate if that's being updated
        category: "Vitals",
        relatedId: id
      });
      setTimelineEvents(prev => [...prev, timelineEvent]);

      toast.success('Vital signs updated successfully!');
    } catch (err) {
      toast.error('Failed to update vital signs');
      throw err;
    }
  };

  const deleteVitalSigns = async (id: string): Promise<void> => {
    try {
      setVitalSigns(prev => prev.filter(v => v.id !== id));
      toast.success('Vital signs deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete vital signs');
      throw err;
    }
  };

  const addTimelineEvent = async (event: Omit<TimelineEvent, 'id'>): Promise<void> => {
    try {
      const newEvent = createTimelineEvent(event);
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
    vitalSigns,
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
    addVitalSigns,
    updateVitalSigns,
    deleteVitalSigns,
    isLoading,
    error
  };

  console.log('HealthDataContext rendering with data:', {
    medications: medications.length,
    appointments: appointments.length,
    documents: documents.length,
    timelineEvents: timelineEvents.length,
    vitalSigns: vitalSigns.length
  });

  return (
    <HealthDataContext.Provider value={contextValue}>
      {children}
    </HealthDataContext.Provider>
  );
};
