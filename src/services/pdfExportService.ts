
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, TimelineEvent } from '@/types';
import { format, parseISO } from 'date-fns';

export const generateTimelinePDF = (user: User, timelineEvents: TimelineEvent[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.name}`, 20, yPos);
    yPos += 10;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Emergency Health Summary', 20, yPos);
    yPos += 20;

    // Digital Health Key Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Patient Info - Left Column
    const leftCol = 20;
    const rightCol = pageWidth / 2 + 10;
    
    doc.text('Patient ID:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${user.id}`, leftCol + 25, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('DOB:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(parseISO(user.dob), 'MM/dd/yyyy'), leftCol + 25, yPos);

    // Right Column
    let rightYPos = yPos - 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Blood Type:', rightCol, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(user.bloodType, rightCol + 25, rightYPos);
    rightYPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Organ Donor:', rightCol, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(user.organDonor ? 'Yes' : 'No', rightCol + 30, rightYPos);

    yPos += 15;

    // Critical Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Critical Information', leftCol, yPos);
    yPos += 10;

    // Allergies
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Allergies:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    const allergiesText = user.allergies.length > 0 ? user.allergies.join(', ') : 'None reported';
    doc.text(allergiesText, leftCol + 25, yPos);
    yPos += 8;

    // Conditions
    doc.setFont('helvetica', 'bold');
    doc.text('Conditions:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    const conditionsText = user.conditions.length > 0 ? user.conditions.join(', ') : 'None reported';
    doc.text(conditionsText, leftCol + 30, yPos);
    yPos += 8;

    // Emergency Contact
    doc.setFont('helvetica', 'bold');
    doc.text('Emergency Contact:', leftCol, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`${user.emergencyContact.name} (${user.emergencyContact.relationship})`, leftCol + 5, yPos);
    yPos += 6;
    doc.text(user.emergencyContact.phone, leftCol + 5, yPos);
    yPos += 15;

    // Insurance (if available)
    if (user.insurance) {
      doc.setFont('helvetica', 'bold');
      doc.text('Insurance:', leftCol, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Provider: ${user.insurance.provider}`, leftCol + 5, yPos);
      yPos += 6;
      doc.text(`Policy #: ${user.insurance.policyNumber}`, leftCol + 5, yPos);
      yPos += 6;
      doc.text(`Member ID: ${user.insurance.memberId}`, leftCol + 5, yPos);
      yPos += 15;
    }

    // Medical Timeline Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Timeline', leftCol, yPos);
    yPos += 10;

    // Prepare timeline data for table
    const timelineData = timelineEvents.map(event => [
      format(parseISO(event.date), 'MMM d, yyyy'),
      format(parseISO(event.date), 'h:mm a'),
      event.title,
      event.details,
      event.category
    ]);

    // Create timeline table using autoTable
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Time', 'Event', 'Details', 'Category']],
      body: timelineData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 60 },
        4: { cellWidth: 25 }
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Save the PDF
    doc.save(`${user.name.replace(/\s+/g, '_')}_Medical_Timeline_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('There was an error generating the PDF. Please try again.');
  }
};
