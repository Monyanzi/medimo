
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Medication, Appointment, Document, TimelineEvent, VitalSigns, HealthDataContextType, TimelineEventFilters } from '@/types';
import { toast } from 'sonner';
import { parseISO, isToday, isWithinInterval, subDays } from 'date-fns';
import { useAuth } from './AuthContext';
import config from '@/config';
import { medicationsAPI, appointmentsAPI, vitalsAPI, documentsAPI, timelineAPI } from '@/services/healthDataService';

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
  const [masterTimelineEvents, setMasterTimelineEvents] = useState<TimelineEvent[]>([]); // Renamed to hold all events
  const [exportEventCategories, setExportEventCategories] = useState<string[]>(['Medication', 'Appointment', 'Document', 'Vitals', 'Test', 'Other']);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper to namespace localStorage per user
  const ns = useCallback((suffix: string) => {
    return user ? `medimo_${user.id}__${suffix}` : `medimo_anonymous__${suffix}`;
  }, [user]);

  // Mock data
  // Argentina Scenario Mock Data for Sarah
  const mockMedications: Medication[] = [
    {
      id: "med-arg-001",
      name: "Levothyroxine",
      dosage: "50mcg",
      frequency: "Once daily",
      instructions: "Take in the morning on empty stomach",
      status: "active"
    },
    {
      id: "med-arg-002",
      name: "Ventolin Inhaler",
      dosage: "100mcg",
      frequency: "PRN (As needed)",
      instructions: "2 puffs every 4-6 hours as needed for wheezing",
      status: "active"
    }
  ];

  const mockAppointments: Appointment[] = [
    {
      id: "apt-arg-001",
      title: "OBGYN Consultation",
      doctorName: "Dr. Emily Chen",
      location: "Women's Health Center, Suite 300",
      dateTime: "2026-01-20T10:00:00Z",
      notes: "Early pregnancy confirmation and prenatal planning"
    },
    {
      id: "apt-arg-002",
      title: "Endocrinology Follow-up",
      doctorName: "Dr. James Wilson",
      location: "Metabolic Institute, Room 4B",
      dateTime: "2025-11-15T14:30:00Z",
      notes: "Thyroid function review (TSH levels stable)"
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: "doc-arg-001",
      fileName: "Thyroid_Panel_Results_Nov2025.pdf",
      fileType: "PDF",
      uploadDate: "2025-11-10T09:15:00Z",
      storagePath: "/documents/thyroid_2025.pdf",
      category: "Lab Results",
      fileSize: 1024000
    },
    {
      id: "doc-arg-002",
      fileName: "Brain_MRI_Scan_2024.jpg",
      fileType: "Image",
      uploadDate: "2024-06-12T11:20:00Z",
      storagePath: "/documents/brain_mri_2024.jpg",
      category: "Imaging", // Critical for Trauma Assessment
      fileSize: 4096000
    }
  ];

  // Generate 12 months of daily vitals (~365 records) with deliberate variability & periodic spikes
  const generateYearVitals = (): VitalSigns[] => {
    const out: VitalSigns[] = [];
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const dayMs = 24 * 60 * 60 * 1000;
    const randInt = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
    for (let t = start.getTime(); t <= now.getTime(); t += dayMs) {
      const d = new Date(t);
      const dayIndex = Math.floor((t - start.getTime()) / dayMs);
      const cyc = Math.sin(dayIndex / 14) * 3; // bi‑weekly oscillation component

      // Base vitals (will be adjusted below for spikes)
      let systolic = 118 + cyc + randInt(-6, 6);
      let diastolic = 76 + cyc / 2 + randInt(-4, 4);
      let hr = 70 + cyc + randInt(-6, 6);
      let tempC = 36.6 + (Math.random() - 0.5) * 0.3; // narrow normal band
      let resp = 16 + randInt(-2, 2);
      let spo2 = 97 + randInt(-2, 1); // 95‑98 typical, occasional 94
      let glucose = 100 + randInt(-18, 20);

      // Monthly hypertension flare: first 3 days of each (approx) 30‑day cycle
      if (dayIndex % 30 <= 2) {
        systolic += 18 + randInt(-2, 4);
        diastolic += 10 + randInt(-1, 2);
      }
      // Glucose spike mid‑cycle
      if (dayIndex % 45 === 10) {
        glucose = 165 + randInt(-10, 20); // Amber / Red threshold crossing
      }
      // Respiratory elevation every ~60 days
      if (dayIndex % 60 === 5) {
        resp = 22 + randInt(0, 4);
      }
      // Random brief desaturation (5% chance)
      if (Math.random() < 0.05) {
        spo2 = 93 + randInt(-3, 1); // can dip into Amber/Red
      }
      // Occasional fever event (2% chance)
      if (Math.random() < 0.02) {
        tempC = 38.2 + (Math.random() * 0.5);
      }

      out.push({
        id: `vital-${t}`,
        bloodPressureSystolic: Math.round(systolic),
        bloodPressureDiastolic: Math.round(diastolic),
        heartRate: Math.round(hr),
        temperature: parseFloat(tempC.toFixed(1)),
        oxygenSaturation: Math.min(100, Math.max(85, Math.round(spo2))),
        respiratoryRate: Math.round(resp),
        bloodGlucose: Math.round(glucose),
        recordedDate: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 0, 0).toISOString()
      });
    }
    return out;
  };
  const mockVitalSigns: VitalSigns[] = generateYearVitals();

  // Derive rule-based zone events for timeline (simple thresholds)
  const zone = (metric: string, value: number) => {
    switch (metric) {
      case 'bpSys': return value >= 140 ? 'Red' : value >= 130 ? 'Amber' : 'Green';
      case 'bpDia': return value >= 90 ? 'Red' : value >= 85 ? 'Amber' : 'Green';
      case 'hr': return value >= 110 || value <= 50 ? 'Red' : value >= 90 ? 'Amber' : 'Green';
      case 'spo2': return value < 92 ? 'Red' : value < 95 ? 'Amber' : 'Green';
      case 'tempC': return value >= 38 ? 'Red' : value >= 37.4 ? 'Amber' : 'Green';
      case 'resp': return value >= 24 || value <= 10 ? 'Red' : value >= 20 ? 'Amber' : 'Green';
      case 'glucose': return value >= 180 ? 'Red' : value >= 140 ? 'Amber' : 'Green';
      default: return 'Green';
    }
  };
  const buildZoneTimelineFromVitals = (vitals: VitalSigns[]): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const fmtDay = (iso: string) => {
      const d = new Date(iso); return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    };
    const prev: Record<string, string> = { bp: 'Green', spo2: 'Green', hr: 'Green', temp: 'Green', resp: 'Green', glucose: 'Green' };
    vitals.forEach(v => {
      const bpZone = zone('bpSys', v.bloodPressureSystolic || 0) === 'Red' || zone('bpDia', v.bloodPressureDiastolic || 0) === 'Red'
        ? 'Red'
        : (zone('bpSys', v.bloodPressureSystolic || 0) === 'Amber' || zone('bpDia', v.bloodPressureDiastolic || 0) === 'Amber') ? 'Amber' : 'Green';
      const spoZone = zone('spo2', v.oxygenSaturation || 0);
      const hrZone = zone('hr', v.heartRate || 0);
      const tempZone = zone('tempC', v.temperature || 0);
      const respZone = zone('resp', v.respiratoryRate || 0);
      const gluZone = zone('glucose', v.bloodGlucose || 0);
      const dateLabel = fmtDay(v.recordedDate);
      const addEvent = (metricKey: string, metricLabel: string, zoneVal: string, valueStr: string, insight: string) => {
        events.push({
          id: `${metricKey}-${v.id}`,
          title: `${dateLabel}: ${metricLabel} ${zoneVal === 'Green' ? 'back in Green zone' : `entered ${zoneVal} zone`} (${valueStr})`,
          details: insight,
          date: v.recordedDate,
          category: 'Vitals',
          relatedId: v.id,
          isSystem: true,
          systemType: 'threshold'
        });
      };
      const zoneChange = (key: string, newZone: string, metricLabel: string, valueStr: string) => {
        if (newZone !== prev[key]) {
          const insight = newZone === 'Red' ? 'High - monitor closely.' : newZone === 'Amber' ? 'Slightly high, monitor again tomorrow.' : 'Returned to normal range.';
          addEvent(key, metricLabel, newZone, valueStr, insight);
          prev[key] = newZone;
        }
      };
      zoneChange('bp', bpZone, 'Blood Pressure', `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`);
      zoneChange('spo2', spoZone, 'SpO₂', `${v.oxygenSaturation}%`);
      zoneChange('hr', hrZone, 'Heart Rate', `${v.heartRate} bpm`);
      zoneChange('temp', tempZone, 'Temperature', `${v.temperature}°C`);
      zoneChange('resp', respZone, 'Respiratory Rate', `${v.respiratoryRate} rpm`);
      zoneChange('glucose', gluZone, 'Glucose', `${v.bloodGlucose} mg/dL`);
    });
    return events;
  };
  // Monthly summary events to enrich timeline (average of month & any alerts noted)
  const buildMonthlySummaryEvents = (vitals: VitalSigns[]): TimelineEvent[] => {
    const byMonth: Record<string, VitalSigns[]> = {};
    vitals.forEach(v => {
      const d = new Date(v.recordedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      (byMonth[key] ||= []).push(v);
    });
    const events: TimelineEvent[] = [];
    Object.entries(byMonth).forEach(([key, arr]) => {
      const avg = (fn: (v: VitalSigns) => number | undefined) => {
        const nums = arr.map(fn).filter((n): n is number => typeof n === 'number');
        return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : undefined;
      };
      const aSys = avg(v => v.bloodPressureSystolic);
      const aDia = avg(v => v.bloodPressureDiastolic);
      const aHR = avg(v => v.heartRate);
      const aSpO2 = avg(v => v.oxygenSaturation);
      const aTemp = avg(v => v.temperature);
      const aGlu = avg(v => v.bloodGlucose);
      const aResp = avg(v => v.respiratoryRate);
      const dateForEvent = arr[arr.length - 1].recordedDate; // end of month data point
      const flags: string[] = [];
      if (aSys && aSys >= 140) flags.push('BP Red risk'); else if (aSys && aSys >= 130) flags.push('BP Elevated');
      if (aGlu && aGlu >= 180) flags.push('Glucose High'); else if (aGlu && aGlu >= 140) flags.push('Glucose Elevated');
      if (aSpO2 && aSpO2 < 92) flags.push('Low SpO₂'); else if (aSpO2 && aSpO2 < 95) flags.push('SpO₂ Borderline');
      if (aTemp && aTemp >= 38) flags.push('Fever Episodes');
      if (aResp && (aResp >= 22 || aResp <= 10)) flags.push('Respiratory Irregularities');
      const summary = `Avg BP ${aSys?.toFixed(0)}/${aDia?.toFixed(0)} • HR ${aHR?.toFixed(0)} • SpO₂ ${aSpO2?.toFixed(0)}% • Temp ${aTemp?.toFixed(1)}°C • Glu ${aGlu?.toFixed(0)} mg/dL • Resp ${aResp?.toFixed(0)}`;
      const evt: TimelineEvent = {
        id: `summary-${key}`,
        title: `${key} Summary`,
        details: flags.length ? `${summary} | Flags: ${flags.join(', ')}` : summary,
        date: dateForEvent,
        category: 'Vitals',
        relatedId: undefined,
        isSystem: true,
        systemType: 'summary'
      };
      events.push(evt);
    });
    return events;
  };

  // Create one user-origin style "Vitals Recorded" entry per month (earliest reading), so UI & export distinguish user vs system
  const buildBaselineUserVitalsEvents = (vitals: VitalSigns[]): TimelineEvent[] => {
    const byMonth: Record<string, VitalSigns[]> = {};
    vitals.forEach(v => {
      const d = new Date(v.recordedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      (byMonth[key] ||= []).push(v);
    });
    const events: TimelineEvent[] = [];
    Object.entries(byMonth).forEach(([key, arr]) => {
      const earliest = arr.reduce((min, cur) => new Date(cur.recordedDate) < new Date(min.recordedDate) ? cur : min, arr[0]);
      const detailParts: string[] = [];
      if (earliest.bloodPressureSystolic && earliest.bloodPressureDiastolic) detailParts.push(`BP ${earliest.bloodPressureSystolic}/${earliest.bloodPressureDiastolic} mmHg`);
      if (earliest.heartRate) detailParts.push(`HR ${earliest.heartRate}`);
      if (earliest.oxygenSaturation) detailParts.push(`SpO2 ${earliest.oxygenSaturation}%`);
      if (earliest.temperature) detailParts.push(`Temp ${earliest.temperature.toFixed(1)}°C`);
      if (earliest.bloodGlucose) detailParts.push(`Glucose ${earliest.bloodGlucose} mg/dL`);
      if (earliest.respiratoryRate) detailParts.push(`Resp ${earliest.respiratoryRate} rpm`);
      events.push({
        id: `baseline-vitals-${key}`,
        title: 'Vitals Recorded',
        details: detailParts.join('; '),
        date: earliest.recordedDate,
        category: 'Vitals'
        // intentionally no isSystem flag
      });
    });
    return events;
  };

  const mockTimelineEvents: TimelineEvent[] = ([
    { id: 'event-med-start-arg', title: 'Medication Started', details: 'Levothyroxine 50mcg prescribed for Hypothyroidism', date: mockVitalSigns[0].recordedDate, category: 'Medication', relatedId: 'med-arg-001' },
    ...buildBaselineUserVitalsEvents(mockVitalSigns),
    ...buildMonthlySummaryEvents(mockVitalSigns),
    ...buildZoneTimelineFromVitals(mockVitalSigns)
  ] as TimelineEvent[]).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  // Force reseed for Sarah to clear old data
  const forceReseedForSarah = (storedMeds: string | null) => {
    if (!storedMeds) return true;
    try {
      const meds = JSON.parse(storedMeds);
      // If we find Lisinopril (old mock data), force reseed
      return meds.some((m: any) => m.name === "Lisinopril");
    } catch { return true; }
  };

  // Helper to decide if stored data is outdated / insufficient for demo
  const needsReseed = (storedVitalsRaw: string | null): boolean => {
    if (!storedVitalsRaw) return true;
    try {
      const arr: any[] = JSON.parse(storedVitalsRaw);
      if (arr.length < 250) return true; // expect near year of data
      if (!('respiratoryRate' in arr[0]) || !('bloodGlucose' in arr[0])) return true;
      return false;
    } catch { return true; }
  };

  // Determine if existing timeline is too sparse (older version) and should be reseeded
  const needsTimelineReseed = (storedTimelineRaw: string | null, vitalsWereReseeded: boolean): boolean => {
    if (vitalsWereReseeded) return true; // keep timeline in sync with regenerated vitals
    if (!storedTimelineRaw) return true;
    try {
      const events: any[] = JSON.parse(storedTimelineRaw);
      if (events.length < 15) return true; // we now expect monthly + zone events
      const hasVitalsEvents = events.some(e => e.category === 'Vitals');
      if (!hasVitalsEvents) return true;
      return false;
    } catch { return true; }
  };

  // Load per-user data (or seed defaults on first login)
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedMeds = localStorage.getItem(ns('medications'));
      const storedApts = localStorage.getItem(ns('appointments'));
      const storedDocs = localStorage.getItem(ns('documents'));
      const storedVitals = localStorage.getItem(ns('vitals'));
      const storedTimeline = localStorage.getItem(ns('timeline'));

      // Modified logic to force update for Argentina Scenario
      const isSarah = user?.email === "sarah.johnson@email.com";
      const forceSarahReseed = isSarah && forceReseedForSarah(storedMeds);

      const reseedVitals = (isSarah && needsReseed(storedVitals)) || forceSarahReseed;
      const timelineNeedsReseed = (isSarah && needsTimelineReseed(storedTimeline, reseedVitals)) || forceSarahReseed;

      // CRITICAL: Only seed mock data for Sarah (Argentina Scenario)
      // Other users get empty arrays to ensure complete data separation
      const emptyMeds: typeof mockMedications = [];
      const emptyApts: typeof mockAppointments = [];
      const emptyDocs: typeof mockDocuments = [];
      const emptyVitals: typeof mockVitalSigns = [];
      const emptyTimeline: typeof mockTimelineEvents = [];

      // For Sarah: use mock data if no stored data or reseed needed
      // For others: use stored data or empty arrays (never Sarah's mock data)
      const medsToUse = isSarah
        ? (forceSarahReseed ? mockMedications : (storedMeds ? JSON.parse(storedMeds) : mockMedications))
        : (storedMeds ? JSON.parse(storedMeds) : emptyMeds);

      const aptsToUse = isSarah
        ? (forceSarahReseed ? mockAppointments : (storedApts ? JSON.parse(storedApts) : mockAppointments))
        : (storedApts ? JSON.parse(storedApts) : emptyApts);

      const docsToUse = isSarah
        ? (forceSarahReseed ? mockDocuments : (storedDocs ? JSON.parse(storedDocs) : mockDocuments))
        : (storedDocs ? JSON.parse(storedDocs) : emptyDocs);

      const vitalsToUse = isSarah
        ? (reseedVitals ? mockVitalSigns : JSON.parse(storedVitals || '[]'))
        : (storedVitals ? JSON.parse(storedVitals) : emptyVitals);

      const timelineToUse = isSarah
        ? ((reseedVitals || timelineNeedsReseed) ? mockTimelineEvents : JSON.parse(storedTimeline || '[]'))
        : (storedTimeline ? JSON.parse(storedTimeline) : emptyTimeline);

      setMedications(medsToUse);
      setAppointments(aptsToUse);
      setDocuments(docsToUse);
      setVitalSigns(vitalsToUse);
      setMasterTimelineEvents(timelineToUse);

      // Persist seeded data for Sarah
      if (isSarah && (reseedVitals || timelineNeedsReseed || forceSarahReseed)) {
        localStorage.setItem(ns('medications'), JSON.stringify(medsToUse));
        localStorage.setItem(ns('appointments'), JSON.stringify(aptsToUse));
        localStorage.setItem(ns('documents'), JSON.stringify(docsToUse));
        localStorage.setItem(ns('vitals'), JSON.stringify(vitalsToUse));
        localStorage.setItem(ns('timeline'), JSON.stringify(timelineToUse));
      }

      setError(null);
    } catch (e) {
      console.error('Failed loading user-scoped health data', e);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [ns]);

  // Persist changes per user
  useEffect(() => {
    if (isLoading) return; // avoid persisting initial loading noise
    try {
      localStorage.setItem(ns('medications'), JSON.stringify(medications));
      localStorage.setItem(ns('appointments'), JSON.stringify(appointments));
      localStorage.setItem(ns('documents'), JSON.stringify(documents));
      localStorage.setItem(ns('vitals'), JSON.stringify(vitalSigns));
      localStorage.setItem(ns('timeline'), JSON.stringify(masterTimelineEvents));
    } catch (e) {
      console.error('Failed persisting user-scoped health data', e);
    }
  }, [medications, appointments, documents, vitalSigns, masterTimelineEvents, ns, isLoading]);

  // Helper function to create timeline events
  const createTimelineEvent = (event: Omit<TimelineEvent, 'id'>): TimelineEvent => {
    return {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  };

  const addMedication = async (medication: Omit<Medication, 'id'>): Promise<void> => {
    try {
      let newMedication: Medication;

      if (config.useApi) {
        // API MODE: Create on server
        newMedication = await medicationsAPI.create(medication);
      } else {
        // MOCK MODE: Create locally
        newMedication = {
          ...medication,
          id: `med-${Date.now()}`
        };
      }

      setMedications(prev => [...prev, newMedication]);

      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Medication Added",
        details: `${medication.name} ${medication.dosage} - ${medication.frequency}`,
        date: new Date().toISOString(),
        category: "Medication",
        relatedId: newMedication.id
      });
      setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));

      toast.success('Medication added successfully!');
    } catch (err) {
      toast.error('Failed to add medication');
      throw err;
    }
  };

  const updateMedication = async (id: string, medication: Partial<Medication>): Promise<void> => {
    try {
      const existingMedication = medications.find(m => m.id === id);
      if (!existingMedication) {
        toast.error('Medication not found');
        return;
      }

      // Apply update
      setMedications(prev => prev.map(med => med.id === id ? { ...med, ...medication } : med));

      // Determine changed fields for additive event
      const changed: string[] = [];
      const fieldMap: { key: keyof Medication; label: string }[] = [
        { key: 'name', label: 'Name' },
        { key: 'dosage', label: 'Dosage' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'instructions', label: 'Instructions' },
        { key: 'status', label: 'Status' }
      ];
      fieldMap.forEach(({ key, label }) => {
        if (key in medication && (medication as any)[key] !== (existingMedication as any)[key]) {
          changed.push(`${label}: ${(existingMedication as any)[key] || '—'} → ${(medication as any)[key] || '—'}`);
        }
      });

      if (changed.length) {
        const timelineEvent = createTimelineEvent({
          title: `Medication Updated: ${medication.name || existingMedication.name}`,
          details: changed.join('; '),
          date: new Date().toISOString(),
          category: 'Medication',
          relatedId: id
        });
        setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      }

      toast.success('Medication updated');
    } catch (err) {
      toast.error('Failed to update medication');
      throw err;
    }
  };

  const deleteMedication = async (id: string): Promise<void> => {
    try {
      const medicationToDelete = medications.find(med => med.id === id);

      if (config.useApi) {
        // API MODE: Delete on server
        await medicationsAPI.delete(id);
      }

      setMedications(prev => prev.filter(med => med.id !== id));

      if (medicationToDelete) {
        setMasterTimelineEvents(prev =>
          prev.filter(event => !(event.category === "Medication" && event.relatedId === id))
        );
        toast.success('Medication removed successfully!');
      } else {
        toast.error('Medication not found for deletion.');
      }
    } catch (err) {
      toast.error('Failed to remove medication');
      throw err;
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<void> => {
    try {
      let newAppointment: Appointment;

      if (config.useApi) {
        // API MODE: Create on server
        newAppointment = await appointmentsAPI.create(appointment);
      } else {
        // MOCK MODE: Create locally
        newAppointment = {
          ...appointment,
          id: `apt-${Date.now()}`
        };
      }

      setAppointments(prev => [...prev, newAppointment]);

      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Appointment Scheduled",
        details: `${appointment.title} with ${appointment.doctorName}`,
        date: new Date().toISOString(),
        category: "Appointment",
        relatedId: newAppointment.id
      });
      setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));

      toast.success('Appointment added successfully!');
    } catch (err) {
      toast.error('Failed to add appointment');
      throw err;
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<void> => {
    try {
      const existingAppointment = appointments.find(a => a.id === id);
      if (!existingAppointment) {
        toast.error('Appointment not found');
        return;
      }

      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...appointment } : apt));

      const changed: string[] = [];
      const fieldMap: { key: keyof Appointment; label: string }[] = [
        { key: 'title', label: 'Title' },
        { key: 'doctorName', label: 'Doctor' },
        { key: 'location', label: 'Location' },
        { key: 'dateTime', label: 'Date/Time' },
        { key: 'notes', label: 'Notes' }
      ];
      fieldMap.forEach(({ key, label }) => {
        if (key in appointment && (appointment as any)[key] !== (existingAppointment as any)[key]) {
          changed.push(`${label}: ${(existingAppointment as any)[key] || '—'} → ${(appointment as any)[key] || '—'}`);
        }
      });

      if (changed.length) {
        const timelineEvent = createTimelineEvent({
          title: `Appointment Updated: ${appointment.title || existingAppointment.title}`,
          details: changed.join('; '),
          date: new Date().toISOString(),
          category: 'Appointment',
          relatedId: id
        });
        setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      }

      toast.success('Appointment updated');
    } catch (err) {
      toast.error('Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      const appointmentToDelete = appointments.find(apt => apt.id === id);

      if (config.useApi) {
        await appointmentsAPI.delete(id);
      }

      setAppointments(prev => prev.filter(apt => apt.id !== id));

      if (appointmentToDelete) {
        setMasterTimelineEvents(prev =>
          prev.filter(event => !(event.category === "Appointment" && event.relatedId === id))
        );
        toast.success('Appointment cancelled successfully!');
      } else {
        toast.error('Appointment not found.');
      }
    } catch (err) {
      toast.error('Failed to cancel appointment');
      throw err;
    }
  };

  const addDocument = async (document: Omit<Document, 'id'>): Promise<void> => {
    try {
      let newDocument: Document;

      if (config.useApi) {
        newDocument = await documentsAPI.create(document);
      } else {
        newDocument = {
          ...document,
          id: `doc-${Date.now()}`
        };
      }

      setDocuments(prev => [...prev, newDocument]);

      // Auto-generate timeline event
      const timelineEvent = createTimelineEvent({
        title: "Document Uploaded",
        details: `${document.fileName} - ${document.category}`,
        date: new Date().toISOString(),
        category: "Document",
        relatedId: newDocument.id
      });
      setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));

      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload document');
      throw err;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      const document = documents.find(doc => doc.id === id);

      if (config.useApi) {
        await documentsAPI.delete(id);
      }

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
        setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      }

      toast.success('Document deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete document');
      throw err;
    }
  };

  const addVitalSigns = async (vitals: Omit<VitalSigns, 'id'>): Promise<void> => {
    try {
      let newVitals: VitalSigns;

      if (config.useApi) {
        newVitals = await vitalsAPI.create(vitals);
      } else {
        newVitals = {
          ...vitals,
          id: `vital-${Date.now()}`,
          recordedDate: vitals.recordedDate || new Date().toISOString()
        };
      }

      setVitalSigns(prev => [...prev, newVitals]);

      // Auto-generate timeline event
      const details = [];
      if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
        details.push(`BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`);
      }
      if (vitals.heartRate) details.push(`HR: ${vitals.heartRate} bpm`);
      if (vitals.weight) details.push(`Weight: ${vitals.weight} lbs`);
      if (vitals.height) details.push(`Height: ${vitals.height} in`);
      if (vitals.temperature) details.push(`Temp: ${vitals.temperature}°F`);
      if (vitals.oxygenSaturation) details.push(`SpO2: ${vitals.oxygenSaturation}%`);

      const timelineEvent = createTimelineEvent({
        title: "Vitals Recorded",
        details: details.join(', ') || 'Vital signs recorded',
        date: newVitals.recordedDate,
        category: "Vitals",
        relatedId: newVitals.id
      });
      setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));

      toast.success('Vital signs recorded successfully!');
    } catch (err) {
      toast.error('Failed to record vital signs');
      throw err;
    }
  };

  const updateVitalSigns = async (id: string, vitals: Partial<VitalSigns>): Promise<void> => {
    try {
      // Capture existing for snapshot & compute merged record
      const existing = vitalSigns.find(v => v.id === id);
      const merged = existing ? { ...existing, ...vitals } : undefined;

      // Update vital signs array (in-place replacement)
      setVitalSigns(prev => prev.map(v => v.id === id ? { ...v, ...vitals } : v));

      // Build additive timeline event (do NOT mutate prior event entries)
      if (merged) {
        const detailParts: string[] = [];
        if (merged.bloodPressureSystolic && merged.bloodPressureDiastolic) {
          detailParts.push(`BP: ${merged.bloodPressureSystolic}/${merged.bloodPressureDiastolic} mmHg`);
        }
        if (merged.heartRate) detailParts.push(`HR: ${merged.heartRate} bpm`);
        if (merged.weight) detailParts.push(`Weight: ${merged.weight} lbs`);
        if (merged.height) detailParts.push(`Height: ${merged.height} in`);
        if (merged.temperature) detailParts.push(`Temp: ${merged.temperature}°F`);
        if (merged.oxygenSaturation) detailParts.push(`SpO2: ${merged.oxygenSaturation}%`);

        const timelineEvent = createTimelineEvent({
          title: 'Vitals Updated',
          details: detailParts.join(', ') || 'Vital signs updated',
          date: new Date().toISOString(),
          category: 'Vitals',
          relatedId: id
        });
        setMasterTimelineEvents(prev => [...prev, timelineEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      }

      toast.success('Vital signs updated successfully!');
    } catch (err) {
      toast.error('Failed to update vital signs');
      throw err;
    }
  };

  const deleteVitalSigns = async (id: string): Promise<void> => {
    try {
      if (config.useApi) {
        await vitalsAPI.delete(id);
      }
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
      setMasterTimelineEvents(prev => [...prev, newEvent].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      toast.success('Timeline event added successfully!');
    } catch (err) {
      toast.error('Failed to add timeline event');
      throw err;
    }
  };

  const updateTimelineEvent = async (id: string, event: Partial<TimelineEvent>): Promise<void> => {
    try {
      setMasterTimelineEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...event } : evt).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      toast.success('Timeline event updated successfully!');
    } catch (err) {
      toast.error('Failed to update timeline event');
      throw err;
    }
  };

  const deleteTimelineEvent = async (id: string): Promise<void> => {
    try {
      setMasterTimelineEvents(prev => prev.filter(evt => evt.id !== id));
      toast.success('Timeline event deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete timeline event');
      throw err;
    }
  };

  const getFilteredTimelineEvents = useCallback((filters?: TimelineEventFilters): TimelineEvent[] => {
    let processedEvents = [...masterTimelineEvents];

    if (filters) {
      // 1. Filter by Search Term
      if (filters.searchTerm) {
        const lowerSearchTerm = filters.searchTerm.toLowerCase();
        processedEvents = processedEvents.filter(event =>
          event.title.toLowerCase().includes(lowerSearchTerm) ||
          (event.details && event.details.toLowerCase().includes(lowerSearchTerm))
        );
      }

      // 2. Filter by Category
      if (filters.categoryFilter && filters.categoryFilter !== 'all') {
        processedEvents = processedEvents.filter(event => event.category === filters.categoryFilter);
      }

      // 3. Filter by Date
      if (filters.dateFilter && filters.dateFilter !== 'all') {
        const now = new Date();
        processedEvents = processedEvents.filter(event => {
          const eventDate = parseISO(event.date);
          switch (filters.dateFilter) {
            case 'today':
              return isToday(eventDate);
            case 'past_7_days':
              return isWithinInterval(eventDate, { start: subDays(now, 7), end: now });
            case 'past_30_days':
              return isWithinInterval(eventDate, { start: subDays(now, 30), end: now });
            default:
              return true;
          }
        });
      }
    }

    // 4. Sort Events (already sorted by date desc when data is modified, but can be adjusted here if needed)
    if (filters?.sortOrder === 'asc') {
      processedEvents.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    } else {
      // Default or 'desc'
      processedEvents.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }

    return processedEvents;
  }, [masterTimelineEvents]);


  const contextValue: HealthDataContextType = {
    medications,
    appointments,
    documents,
    timelineEvents: masterTimelineEvents,
    vitalSigns,
    exportEventCategories,
    setExportEventCategories,
    purgeUserData: () => {
      ['medications', 'appointments', 'documents', 'vitals', 'timeline'].forEach(key => localStorage.removeItem(ns(key)));
      setMedications([]);
      setAppointments([]);
      setDocuments([]);
      setVitalSigns([]);
      setMasterTimelineEvents([]);
    },
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

  return (
    <HealthDataContext.Provider value={contextValue}>
      {children}
    </HealthDataContext.Provider>
  );
};
