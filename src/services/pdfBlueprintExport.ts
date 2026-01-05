import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, TimelineEvent, Medication, Appointment, VitalSigns, Document } from '@/types';
import { format, parseISO } from 'date-fns';

/**
 * Blueprint-driven PDF export (v1 scaffold)
 * This module introduces a more structured, brandable export pipeline inspired by the reference PDF.
 * It keeps the existing simpler export service untouched while enabling progressive enhancement.
 */

export interface BlueprintExportContext {
  medications?: Medication[];
  appointments?: Appointment[];
  vitalSigns?: VitalSigns[];
  documents?: Document[];
  timelineEvents: TimelineEvent[]; // already filtered
}

export interface BlueprintStyleConfig {
  brandName?: string;
  primary: [number, number, number];
  neutralText: [number, number, number];
  subtleText: [number, number, number];
  accentSuccess: [number, number, number];
  accentWarning: [number, number, number];
  accentCritical: [number, number, number];
  accentInfo: [number, number, number];
  headingFontSize: number;
  subheadingFontSize: number;
  bodyFontSize: number;
  monoFontSize: number;
  dividerColor: [number, number, number];
  watermark?: string;
  coverBandHeight?: number;
}

export interface BlueprintExportOptions {
  style?: Partial<BlueprintStyleConfig>;
  maxMedications?: number;
  maxAppointments?: number;
  includeDocumentsSummary?: boolean;
  includeVitalsPanel?: boolean;
  includeCover?: boolean;
  includeWatermark?: boolean;
  fileLabel?: string; // appended to filename
}

const DEFAULT_STYLE: BlueprintStyleConfig = {
  brandName: 'Medimo Health Compass',
  // Teal tone similar to screenshot (#06B6B5 / #0d9488 family)
  primary: [6, 182, 181],
  neutralText: [17, 24, 39],
  subtleText: [71, 85, 105],
  accentSuccess: [16, 185, 129],
  accentWarning: [185, 148, 68],
  accentCritical: [182, 90, 84],
  accentInfo: [79, 111, 168],
  headingFontSize: 22,
  subheadingFontSize: 14,
  bodyFontSize: 11,
  monoFontSize: 9,
  dividerColor: [210, 214, 217],
  watermark: '', // not in provided reference
  coverBandHeight: 0, // no colored band in reference
};

// Utility: merge style deep (shallow suffices here)
const mergeStyle = (overrides?: Partial<BlueprintStyleConfig>): BlueprintStyleConfig => ({ ...DEFAULT_STYLE, ...(overrides || {}) });

// Layout helpers
const ensureSpace = (doc: jsPDF, y: number, needed: number): number => {
  const h = doc.internal.pageSize.height;
  if (y + needed > h - 20) { doc.addPage(); return 20; }
  return y;
};

const divider = (doc: jsPDF, y: number, style: BlueprintStyleConfig) => {
  doc.setDrawColor(...style.dividerColor);
  doc.setLineWidth(0.4);
  doc.line(20, y, doc.internal.pageSize.width - 20, y);
};

const heading = (doc: jsPDF, text: string, y: number, style: BlueprintStyleConfig) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(style.subheadingFontSize);
  doc.setTextColor(...style.primary);
  doc.text(text, 20, y);
  return y + 8;
};

const labelValue = (doc: jsPDF, label: string, value: string, x: number, y: number, style: BlueprintStyleConfig) => {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(style.bodyFontSize);
  doc.setTextColor(...style.neutralText); doc.text(label, x, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...style.subtleText);
  doc.text(value || '—', x + 28, y);
  return y + 6;
};

const addFooter = (doc: jsPDF, style: BlueprintStyleConfig) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text(
      `${style.brandName} | Generated ${format(new Date(), 'yyyy-MM-dd HH:mm')} | Page ${i} / ${pageCount}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }
};

// Simple classification similar to main export
const classify = (kind: string, v?: number) => {
  if (v == null) return '—';
  switch (kind) {
    case 'hr': return v < 60 ? 'Low' : v > 100 ? 'High' : 'Normal';
    case 'sys': return v < 90 ? 'Low' : v > 130 ? 'High' : 'Normal';
    case 'dia': return v < 60 ? 'Low' : v > 85 ? 'High' : 'Normal';
    case 'tmp': return v < 36 ? 'Low' : v > 37.5 ? 'High' : 'Normal';
    case 'spo': return v < 94 ? 'Low' : 'Normal';
    default: return 'Normal';
  }
};

export const generateTimelineBlueprintPDF = (user: User, ctx: BlueprintExportContext): jsPDF => {
  const style = mergeStyle();
  const doc = new jsPDF();
  let y = 22;

  // Sanitize text for core-helvetica (WinAnsi) to avoid weird spaced glyph fallback
  const sanitize = (val: any): string => {
    if (val == null) return '';
    return String(val)
      // Replace unsupported bullets & dashes
      .replace(/[•]/g, '|')
      .replace(/[–—]/g, '-')
      // Replace subscript 2 in SpO₂
      .replace(/SpO₂/g, 'SpO2')
      .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2').replace(/₃/g, '3')
      // Collapse accidental multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Header Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(style.headingFontSize);
  doc.setTextColor(...style.neutralText);
  doc.text(user.name, 20, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(style.subheadingFontSize);
  doc.text('Emergency Health Summary', 20, y); // Subtitle

  // QR (optional if user.qrCode)
  if (user.qrCode?.imageUrl) {
    // Attempt to embed if base64 already; otherwise skip
    try {
      doc.addImage(user.qrCode.imageUrl, 'PNG', doc.internal.pageSize.width - 70, 15, 50, 50);
    } catch { }
  }

  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(style.subheadingFontSize);
  doc.setTextColor(...style.primary);
  doc.text('Digital Health Key', 20, y);
  y += 8;
  doc.setTextColor(...style.neutralText);
  doc.setFontSize(style.bodyFontSize);

  const lineGap = 5;
  const labelX = 20;
  const valueX = 58;

  const writeLabelValue = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold'); doc.text(label, labelX, y);
    doc.setFont('helvetica', 'normal'); doc.text(value || '—', valueX, y, { maxWidth: doc.internal.pageSize.width - valueX - 20 });
    y += lineGap;
  };

  // Core concise lines
  writeLabelValue('Blood Type:', user.bloodType || '—');
  writeLabelValue('Organ Donor:', user.organDonor ? 'Yes' : 'No');

  // Wrapped lists (each on its own block below label)
  const wrapWidth = doc.internal.pageSize.width - valueX - 20;
  const writeListBlock = (label: string, items: string[]) => {
    doc.setFont('helvetica', 'bold'); doc.text(label, labelX, y); // label line
    if (!items || !items.length) {
      doc.setFont('helvetica', 'normal'); doc.text('None', valueX, y);
      y += lineGap;
      return;
    }
    doc.setFont('helvetica', 'normal');
    const bulletItems = items.map(i => `• ${i}`);
    const lines: string[] = [];
    bulletItems.forEach(b => {
      const wrapped = doc.splitTextToSize(b, wrapWidth);
      wrapped.forEach(w => lines.push(w));
    });
    doc.text(lines, valueX, y);
    y += lineGap * lines.length;
  };

  writeListBlock('Conditions:', user.conditions || []);
  writeListBlock('Allergies:', user.allergies || []);
  y += 2;

  // Emergency Contact
  const ec = user.emergencyContact;
  if (ec?.name || ec?.phone) {
    doc.setFont('helvetica', 'bold'); doc.text('Emergency Contact:', labelX, y); y += lineGap;
    doc.setFont('helvetica', 'normal');
    if (ec?.name) { doc.text(`Name: ${ec.name}`, valueX, y); y += lineGap; }
    if (ec?.relationship) { doc.text(`Relation: ${ec.relationship}`, valueX, y); y += lineGap; }
    if (ec?.phone) { doc.text(`Phone: ${ec.phone}`, valueX, y); y += lineGap; }
  } else {
    writeLabelValue('Emergency Contact:', 'None on file');
  }
  y += 2;

  // Insurance
  if (user.insurance) {
    doc.setFont('helvetica', 'bold'); doc.text('Insurance:', labelX, y); y += lineGap;
    doc.setFont('helvetica', 'normal');
    if (user.insurance.provider) { doc.text(`Provider: ${user.insurance.provider}`, valueX, y); y += lineGap; }
    if (user.insurance.memberId) { doc.text(`Member ID: ${user.insurance.memberId}`, valueX, y); y += lineGap; }
    if (user.insurance.policyNumber) { doc.text(`Policy #: ${user.insurance.policyNumber}`, valueX, y); y += lineGap; }
  }

  y += 4; // compact spacing before timeline heading

  // Medical Timeline heading (teal)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(style.subheadingFontSize + 2);
  doc.setTextColor(...style.primary);
  doc.text('Medical Timeline', 20, y); y += 6;
  doc.setTextColor(...style.neutralText);

  // Normalization helpers
  const normalizeEventLabel = (ev: TimelineEvent): string => {
    switch (ev.category) {
      case 'Medication':
        if (/started|added/i.test(ev.title)) return 'Medication Started';
        if (/stopped|deleted|discontinued/i.test(ev.title)) return 'Medication Stopped';
        if (/dose|changed|adjust/i.test(ev.title)) return 'Medication Dose Change';
        return 'Medication Update';
      case 'Vitals':
        if (/summary/i.test(ev.title)) return 'Vitals Summary';
        if (/zone/i.test(ev.title)) return 'Vital Threshold Event';
        return 'Vitals Entry';
      case 'Appointment':
        if (/scheduled|new/i.test(ev.title)) return 'Appointment Scheduled';
        if (/updated|rescheduled/i.test(ev.title)) return 'Appointment Updated';
        if (/cancel/i.test(ev.title)) return 'Appointment Cancelled';
        return 'Appointment';
      case 'Document':
        if (/lab/i.test(ev.title)) return 'Lab Result';
        if (/imaging|scan/i.test(ev.title)) return 'Imaging Document';
        return 'Document';
      default:
        return ev.title || 'Event';
    }
  };

  const extractKeyValues = (ev: TimelineEvent): string => {
    // Attempt pattern extraction from details if present
    if (ev.details) {
      const pattern = /(BP\s*\d{2,3}\/\d{2,3}|HR\s*\d{2,3}|SpO2?\s*\d{2,3}%|Temp\s*\d{2,3}\.?\d?°?C?|Glucose\s*\d{2,3})/gi;
      const matches = ev.details.match(pattern);
      if (matches && matches.length) return matches.join('; ');
    }
    return '';
  };

  const timelineSource = ctx.timelineEvents || [];
  const rows = timelineSource.map(ev => {
    const normalized = normalizeEventLabel(ev);
    return [
      `${format(parseISO(ev.date), 'MMM d, yyyy')}\n${format(parseISO(ev.date), 'HH:mm')}`,
      sanitize(ev.category),
      sanitize(normalized),
      sanitize(extractKeyValues(ev)),
      sanitize(ev.notes || '')
    ];
  });

  if (!rows.length) {
    rows.push(['—', '—', 'No Timeline Events', 'No data in selected range', '—']);
  }

  // Fit columns within A4 portrait (210mm width). jsPDF default unit is 'mm'.
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 20; const rightMargin = 20;
  const usable = pageWidth - leftMargin - rightMargin; // e.g., ~170mm
  const fractions = [0.17, 0.14, 0.21, 0.26, 0.22]; // sum ≈1
  const colWidths = fractions.map(f => +(usable * f).toFixed(2));

  autoTable(doc, {
    startY: y,
    head: [['Date / Time', 'Category', 'Event', 'Key Values', 'Notes']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [210, 214, 217], lineWidth: 0.25, overflow: 'linebreak' },
    headStyles: { fillColor: style.primary, textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: colWidths[0] },
      1: { cellWidth: colWidths[1] },
      2: { cellWidth: colWidths[2] },
      3: { cellWidth: colWidths[3] },
      4: { cellWidth: colWidths[4] }
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didDrawPage: (data) => {
      // Adjust table to left margin if autoTable changed start
      doc.setFontSize(8);
    }
  });

  addFooter(doc, style);
  const filename = `${user.name.replace(/\s+/g, '_')}_Timeline_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
  return doc;
};
