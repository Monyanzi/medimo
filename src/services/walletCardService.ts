
import jsPDF from 'jspdf';
import { User, Medication } from '@/types';
import { format } from 'date-fns';
import { generateQRCodeImage, generateQRCodeData } from './qrCodeService';

export interface WalletCardOptions {
    includePhoto?: boolean;
    importantNotes?: string;
}

export const generateWalletCardPDF = async (user: User, medications: Medication[] = [], options: WalletCardOptions = {}) => {
    try {
        // A4 size: 210 x 297 mm
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Card Dimensions (Credit Card Size ID-1: 85.60 x 53.98 mm)
        const cardWidth = 85.6;
        const cardHeight = 54;
        const cornerRadius = 3;
        const margin = 3;

        // Positioning centered on A4
        const startX = (210 - cardWidth) / 2;
        const frontY = 30;
        const backY = frontY + cardHeight + 15;

        // ==========================================
        // FRONT SIDE - Emergency Information
        // ==========================================

        // Card background with subtle shadow effect
        doc.setDrawColor(180);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(startX, frontY, cardWidth, cardHeight, cornerRadius, cornerRadius, 'FD');

        // Header Strip - Teal brand gradient
        doc.setFillColor(13, 148, 136); // Teal-600
        doc.rect(startX, frontY, cardWidth, 10, 'F');

        // Header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICAL EMERGENCY CARD', startX + margin, frontY + 6.5);

        // Medimo branding
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Medimo', startX + cardWidth - margin, frontY + 6.5, { align: 'right' });

        let contentY = frontY + 13;

        // ⚠️ ALLERGIES BANNER - Priority #1
        if (user.allergies && user.allergies.length > 0) {
            doc.setFillColor(220, 38, 38); // Red-600
            doc.roundedRect(startX + margin, contentY, cardWidth - margin * 2, 7, 1.5, 1.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            const allergyText = '⚠ ALLERGIES: ' + user.allergies.slice(0, 4).join(', ');
            doc.text(allergyText, startX + margin + 2, contentY + 4.5, { maxWidth: cardWidth - margin * 2 - 4 });
            contentY += 9;
        }

        // Two-column layout
        const leftCol = startX + margin;
        const rightCol = startX + cardWidth - 28; // Space for QR
        const colWidth = cardWidth - 28 - margin * 2;

        // Patient Name (Large, prominent)
        doc.setTextColor(17, 24, 39); // Gray-900
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const displayName = user.name.length > 20 ? user.name.substring(0, 18) + '...' : user.name;
        doc.text(displayName, leftCol, contentY + 3);
        contentY += 5;

        // DOB, Age, Blood Type line
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99); // Gray-600
        const birthYear = new Date(user.dob).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        const identityLine = `Born ${birthYear} (${age}y) • ${user.bloodType || 'Blood type unknown'}`;
        doc.text(identityLine, leftCol, contentY + 2);
        contentY += 6;

        // Emergency Contact Section
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('EMERGENCY CONTACT', leftCol, contentY + 2);
        contentY += 3;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(55, 65, 81);
        doc.text(`${user.emergencyContact.name}`, leftCol, contentY + 2);
        doc.text(`(${user.emergencyContact.relationship})`, leftCol, contentY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(user.emergencyContact.phone, leftCol, contentY + 8);

        // QR Code (Right side)
        const qrData = await generateQRCodeData(user, medications);
        const qrImage = await generateQRCodeImage(qrData);
        const qrSize = 22;
        doc.addImage(qrImage, 'PNG', rightCol, frontY + 12, qrSize, qrSize);

        // QR label
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('SCAN FOR', rightCol + qrSize / 2, frontY + 35, { align: 'center' });
        doc.text('FULL PROFILE', rightCol + qrSize / 2, frontY + 38, { align: 'center' });

        // ==========================================
        // BACK SIDE - Details
        // ==========================================

        doc.setDrawColor(180);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(startX, backY, cardWidth, cardHeight, cornerRadius, cornerRadius, 'FD');

        let backY2 = backY + 4;
        const halfWidth = (cardWidth - margin * 3) / 2;

        // Left Column: Medications
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('CURRENT MEDICATIONS', startX + margin, backY2 + 2);
        backY2 += 4;

        const activeMeds = medications.filter(m => m.status === 'active').slice(0, 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(55, 65, 81);

        if (activeMeds.length > 0) {
            activeMeds.forEach((med, i) => {
                const medText = `• ${med.name} ${med.dosage || ''}`.trim();
                doc.text(medText.substring(0, 30), startX + margin, backY2 + 2 + (i * 3), { maxWidth: halfWidth });
            });
        } else {
            doc.text('No medications listed', startX + margin, backY2 + 2);
        }

        // Right Column: Conditions  
        const rightColStart = startX + margin + halfWidth + margin;
        let rightY = backY + 4;

        doc.setTextColor(17, 24, 39);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('CONDITIONS', rightColStart, rightY + 2);
        rightY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(55, 65, 81);

        if (user.conditions && user.conditions.length > 0) {
            user.conditions.slice(0, 4).forEach((cond, i) => {
                doc.text(`• ${cond.substring(0, 18)}`, rightColStart, rightY + 2 + (i * 3));
            });
        } else {
            doc.text('None listed', rightColStart, rightY + 2);
        }

        // Important Notes Section (bottom of back)
        const notesY = backY + 28;
        if (options.importantNotes || user.importantNotes) {
            const notes = options.importantNotes || user.importantNotes || '';
            doc.setFillColor(254, 243, 199); // Amber-100
            doc.roundedRect(startX + margin, notesY, cardWidth - margin * 2, 12, 1, 1, 'F');

            doc.setTextColor(146, 64, 14); // Amber-800
            doc.setFontSize(5);
            doc.setFont('helvetica', 'bold');
            doc.text('IMPORTANT NOTES:', startX + margin + 2, notesY + 3);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 53, 15);
            const truncatedNotes = notes.length > 80 ? notes.substring(0, 77) + '...' : notes;
            doc.text(truncatedNotes, startX + margin + 2, notesY + 6, { maxWidth: cardWidth - margin * 2 - 4 });
        }

        // Footer disclaimer
        doc.setFontSize(4.5);
        doc.setTextColor(156, 163, 175);
        doc.text('This card indicates consent for emergency medical data access.', startX + cardWidth / 2, backY + cardHeight - 2, { align: 'center' });

        // Cut instructions
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(7);
        doc.text('✂ Cut along the card borders', startX, frontY - 3);
        doc.text('Front', startX, frontY - 1);
        doc.text('Back (fold or print separately)', startX, backY - 3);

        doc.save(`${user.name.replace(/\s+/g, '_')}_Emergency_Card.pdf`);

    } catch (error) {
        console.error('Error generating Wallet Card:', error);
        throw new Error('Failed to generate Wallet Card');
    }
};
