/**
 * Health Data API Service
 * 
 * Handles CRUD operations for medications, appointments, vitals, documents, and timeline events.
 * All operations require authentication (token in localStorage).
 */

import api from './api';
import { Medication, Appointment, VitalSigns, Document, TimelineEvent } from '@/types';

// ============================================
// MEDICATIONS
// ============================================

export const medicationsAPI = {
    getAll: async (): Promise<Medication[]> => {
        const response = await api.get('/medications');
        return response.data.medications || [];
    },

    create: async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
        const response = await api.post('/medications', medication);
        return response.data.medication;
    },

    update: async (id: string, medication: Partial<Medication>): Promise<Medication> => {
        const response = await api.put(`/medications/${id}`, medication);
        return response.data.medication;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/medications/${id}`);
    },
};

// ============================================
// APPOINTMENTS
// ============================================

export const appointmentsAPI = {
    getAll: async (): Promise<Appointment[]> => {
        const response = await api.get('/appointments');
        return response.data.appointments || [];
    },

    create: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const response = await api.post('/appointments', appointment);
        return response.data.appointment;
    },

    update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const response = await api.put(`/appointments/${id}`, appointment);
        return response.data.appointment;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/appointments/${id}`);
    },
};

// ============================================
// VITAL SIGNS
// ============================================

export const vitalsAPI = {
    getAll: async (): Promise<VitalSigns[]> => {
        const response = await api.get('/vitals');
        return response.data.vitals || [];
    },

    create: async (vitals: Omit<VitalSigns, 'id'>): Promise<VitalSigns> => {
        const response = await api.post('/vitals', vitals);
        return response.data.vital;
    },

    update: async (id: string, vitals: Partial<VitalSigns>): Promise<VitalSigns> => {
        const response = await api.put(`/vitals/${id}`, vitals);
        return response.data.vital;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/vitals/${id}`);
    },
};

// ============================================
// DOCUMENTS
// ============================================

export const documentsAPI = {
    getAll: async (): Promise<Document[]> => {
        const response = await api.get('/documents');
        return response.data.documents || [];
    },

    create: async (document: Omit<Document, 'id'>): Promise<Document> => {
        const response = await api.post('/documents', document);
        return response.data.document;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/documents/${id}`);
    },
};

// ============================================
// TIMELINE EVENTS
// ============================================

export const timelineAPI = {
    getAll: async (): Promise<TimelineEvent[]> => {
        const response = await api.get('/timeline');
        return response.data.events || [];
    },

    create: async (event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> => {
        const response = await api.post('/timeline', event);
        return response.data.event;
    },

    update: async (id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> => {
        const response = await api.put(`/timeline/${id}`, event);
        return response.data.event;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/timeline/${id}`);
    },
};

// ============================================
// USER PROFILE (Extended data)
// ============================================

export const profileAPI = {
    getAllergies: async (): Promise<string[]> => {
        const response = await api.get('/users/allergies');
        return response.data.allergies || [];
    },

    addAllergy: async (name: string, severity?: string): Promise<void> => {
        await api.post('/users/allergies', { name, severity });
    },

    deleteAllergy: async (id: string): Promise<void> => {
        await api.delete(`/users/allergies/${id}`);
    },

    getConditions: async (): Promise<string[]> => {
        const response = await api.get('/users/conditions');
        return response.data.conditions || [];
    },

    addCondition: async (name: string): Promise<void> => {
        await api.post('/users/conditions', { name });
    },

    deleteCondition: async (id: string): Promise<void> => {
        await api.delete(`/users/conditions/${id}`);
    },

    getEmergencyContacts: async (): Promise<Array<{ id: string; name: string; phone: string; relationship: string }>> => {
        const response = await api.get('/users/emergency-contacts');
        return response.data.contacts || [];
    },

    setEmergencyContact: async (contact: { name: string; phone: string; relationship: string }): Promise<void> => {
        await api.post('/users/emergency-contacts', contact);
    },
};

// Export all APIs as a single object
const healthDataAPI = {
    medications: medicationsAPI,
    appointments: appointmentsAPI,
    vitals: vitalsAPI,
    documents: documentsAPI,
    timeline: timelineAPI,
    profile: profileAPI,
};

export default healthDataAPI;
