
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, TimelineEvent, Medication, Appointment, VitalSigns, Document } from '@/types';
import { format, parseISO, differenceInYears } from 'date-fns';

export interface PDFExportOptions {
  medications?: Medication[];
  appointments?: Appointment[];
  vitalSigns?: VitalSigns[];
  documents?: Document[];
  includeTimeline?: boolean;
  importantNotes?: string;
}

const addFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')} | Medimo Health Record | Page ${i}/${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    );
  }
};

const getAge = (dob: string): number | null => {
  try {
    return differenceInYears(new Date(), parseISO(dob));
  } catch {
    return null;
  }
};

export const generateTimelinePDF = (
  user: User,
  timelineEvents: TimelineEvent[],
  options: PDFExportOptions = {}
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let y = 15;

    const age = getAge(user.dob);
    const activeMeds = (options.medications || []).filter(m => m.status === 'active');

    // ==========================================
    // SECTION 1: EMERGENCY HEADER (Compact)
    // ==========================================

    // Red banner for allergies FIRST
    const allergies = Array.isArray(user.allergies) ? user.allergies : [];
    if (allergies.length > 0) {
      doc.setFillColor(220, 38, 38); // Red
      doc.rect(margin, y, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`⚠ ALLERGIES: ${allergies.join(' • ')}`, margin + 3, y + 8);
      y += 16;
    }

    // Patient identity line
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, margin, y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const identityInfo = [
      age ? `${age} years` : null,
      user.bloodType ? `Blood: ${user.bloodType}` : null,
      user.organDonor ? 'Organ Donor' : null
    ].filter(Boolean).join(' • ');
    doc.text(identityInfo, margin, y + 5);
    y += 12;

    // ==========================================
    // SECTION 2: CRITICAL INFO (Compact Grid)
    // ==========================================

    const col1 = margin;
    const col2 = margin + contentWidth / 2;

    // Conditions
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS', col1, y);
    doc.setFont('helvetica', 'normal');
    const conditions = Array.isArray(user.conditions) ? user.conditions : [];
    const conditionsText = conditions.length > 0
      ? conditions.join(', ')
      : 'None reported';
    doc.text(conditionsText, col1, y + 4, { maxWidth: contentWidth / 2 - 5 });

    // Emergency Contact (right column)
    doc.setFont('helvetica', 'bold');
    doc.text('EMERGENCY CONTACT', col2, y);
    doc.setFont('helvetica', 'normal');
    if (user.emergencyContact) {
      doc.text(`${user.emergencyContact.name || 'N/A'} (${user.emergencyContact.relationship || 'N/A'})`, col2, y + 4);
      doc.text(user.emergencyContact.phone || 'N/A', col2, y + 8);
    } else {
      doc.text('No emergency contact', col2, y + 4);
    }

    y += 15;

    // ==========================================
    // SECTION 3: CURRENT MEDICATIONS (Table)
    // ==========================================

    if (activeMeds.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CURRENT MEDICATIONS', margin, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Medication', 'Dosage', 'Frequency', 'Prescriber']],
        body: activeMeds.map(m => [
          m.name,
          m.dosage,
          m.frequency,
          m.prescribedBy || '—'
        ]),
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 7
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 45 }
        }
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // ==========================================
    // SECTION 4: LATEST VITALS (Compact)
    // ==========================================

    const vitalSigns = options.vitalSigns || [];
    if (vitalSigns.length > 0) {
      const latest = vitalSigns[vitalSigns.length - 1];

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('LATEST VITALS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.text(`(${format(parseISO(latest.recordedDate), 'MMM d, yyyy')})`, margin + 25, y);
      doc.setTextColor(0);
      y += 4;

      const vitalsData = [
        latest.bloodPressureSystolic && latest.bloodPressureDiastolic
          ? `BP: ${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}` : null,
        latest.heartRate ? `HR: ${latest.heartRate} bpm` : null,
        latest.oxygenSaturation ? `SpO2: ${latest.oxygenSaturation}%` : null,
        latest.temperature ? `Temp: ${latest.temperature}°C` : null,
        latest.weight ? `Weight: ${latest.weight} kg` : null
      ].filter(Boolean).join(' • ');

      doc.setFontSize(8);
      doc.text(vitalsData, margin, y);
      y += 8;
    }

    // ==========================================
    // SECTION 5: INSURANCE (If available)
    // ==========================================

    if (user.insurance) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('INSURANCE', margin, y);
      y += 4;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user.insurance.provider} • Member: ${user.insurance.memberId}`, margin, y);
      y += 8;
    }

    // ==========================================
    // SECTION 6: IMPORTANT NOTES (If provided)
    // ==========================================

    if (options.importantNotes) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPORTANT NOTES', margin, y);
      y += 4;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(options.importantNotes, margin, y, { maxWidth: contentWidth });
      y += 10;
    }

    // Divider before timeline
    if (options.includeTimeline !== false && timelineEvents.length > 0) {
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // ==========================================
      // SECTION 7: MEDICAL TIMELINE
      // ==========================================

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Timeline', margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Event', 'Details', 'Category']],
        body: timelineEvents.slice(0, 50).map(event => {
          const details = event.details || '';
          return [
            format(parseISO(event.date), 'MMM d, yyyy'),
            event.title,
            details.substring(0, 60) + (details.length > 60 ? '...' : ''),
            event.category
          ];
        }),
        theme: 'striped',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 7
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 80 },
          3: { cellWidth: 25 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }

    // ==========================================
    // SECTION 8: UPCOMING APPOINTMENTS
    // ==========================================

    const appointments = options.appointments || [];
    const upcomingAppts = appointments
      .filter(a => parseISO(a.dateTime) > new Date())
      .sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime())
      .slice(0, 3);

    if (upcomingAppts.length > 0) {
      y = (doc as any).lastAutoTable?.finalY + 8 || y + 8;

      if (y > doc.internal.pageSize.height - 40) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('UPCOMING APPOINTMENTS', margin, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Time', 'Appointment', 'Doctor', 'Location']],
        body: upcomingAppts.map(a => [
          format(parseISO(a.dateTime), 'MMM d'),
          format(parseISO(a.dateTime), 'HH:mm'),
          a.title,
          a.doctorName || '—',
          a.location || '—'
        ]),
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 7
        }
      });
    }

    addFooter(doc);
    doc.save(`${user.name.replace(/\s+/g, '_')}_Medical_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
