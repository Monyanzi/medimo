
import QRCode from 'qrcode';
import { User, Medication } from '@/types';

// Enhanced QR data for emergency scanning
export interface QRCodeData {
  // Identity
  qrId: string;
  userName: string;
  medicalId: string;
  generatedAt: string;

  // CRITICAL MEDICAL DATA
  bloodType: string;
  allergies: string[];
  conditions: string[];
  currentMedications: string[]; // "Lisinopril 10mg"

  // Emergency contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Optional: Important notes
  importantNotes?: string;
}

export const generateUniqueQRId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `QR-${timestamp}-${random}`;
};

export const generateQRCodeData = (
  user: User,
  medications: Medication[] = [],
  importantNotes?: string
): QRCodeData => {
  const activeMeds = medications
    .filter(m => m.status === 'active')
    .map(m => `${m.name} ${m.dosage}`)
    .slice(0, 5); // Limit to keep QR scannable

  return {
    qrId: generateUniqueQRId(),
    userName: user.name,
    medicalId: user.id,
    generatedAt: new Date().toISOString(),

    // Critical medical data
    bloodType: user.bloodType,
    allergies: user.allergies,
    conditions: user.conditions,
    currentMedications: activeMeds,

    // Emergency contact
    emergencyContactName: user.emergencyContact.name,
    emergencyContactPhone: user.emergencyContact.phone,
    emergencyContactRelationship: user.emergencyContact.relationship,

    // Optional notes
    importantNotes: importantNotes
  };
};

export const generateQRCodeImage = async (qrData: QRCodeData): Promise<string> => {
  // Generate compact plain-text content for emergency responders
  // Keep it short to fit in QR code limits (~2000 chars safe)
  const textContent = generateCompactText(qrData);

  try {
    const qrCodeUrl = await QRCode.toDataURL(textContent, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'L', // Lower error correction for more data capacity
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate compact plain-text for QR code (fits within QR limits)
export const generateCompactText = (qrData: QRCodeData): string => {
  const parts = [
    `MEDICAL EMERGENCY CARD`,
    ``,
    `Name: ${qrData.userName}`,
    `Blood: ${qrData.bloodType || '?'}`,
  ];

  if (qrData.allergies.length > 0) {
    parts.push(``, `ALLERGIES: ${qrData.allergies.join(', ')}`);
  }

  if (qrData.conditions.length > 0) {
    parts.push(``, `CONDITIONS: ${qrData.conditions.join(', ')}`);
  }

  if (qrData.currentMedications.length > 0) {
    parts.push(``, `MEDS: ${qrData.currentMedications.join(', ')}`);
  }

  if (qrData.emergencyContactName) {
    parts.push(
      ``,
      `EMERGENCY CONTACT:`,
      `${qrData.emergencyContactName}${qrData.emergencyContactRelationship ? ` (${qrData.emergencyContactRelationship})` : ''}`,
      qrData.emergencyContactPhone || ''
    );
  }

  if (qrData.importantNotes) {
    // Truncate notes if too long
    const notes = qrData.importantNotes.length > 150 
      ? qrData.importantNotes.substring(0, 147) + '...'
      : qrData.importantNotes;
    parts.push(``, `NOTES: ${notes}`);
  }

  return parts.filter(p => p !== undefined).join('\n');
};

export const saveQRCodeToStorage = (qrData: QRCodeData, qrImageUrl: string): void => {
  const qrCodeStorage = {
    data: qrData,
    imageUrl: qrImageUrl,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem('medimo_qr_code', JSON.stringify(qrCodeStorage));
};

export const loadQRCodeFromStorage = (): { data: QRCodeData; imageUrl: string } | null => {
  try {
    const stored = localStorage.getItem('medimo_qr_code');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading QR code from storage:', error);
  }
  return null;
};

export const regenerateQRCode = async (
  user: User,
  medications: Medication[] = [],
  importantNotes?: string
): Promise<{ data: QRCodeData; imageUrl: string }> => {
  const qrData = generateQRCodeData(user, medications, importantNotes);
  const qrImageUrl = await generateQRCodeImage(qrData);
  saveQRCodeToStorage(qrData, qrImageUrl);

  return { data: qrData, imageUrl: qrImageUrl };
};

// Format QR data for human-readable display
export const formatQRDataForDisplay = (qrData: QRCodeData): string => {
  const lines = [
    `🏥 MEDICAL EMERGENCY CARD`,
    ``,
    `Name: ${qrData.userName}`,
    `Blood Type: ${qrData.bloodType}`,
    ``,
    `⚠️ ALLERGIES: ${qrData.allergies.length > 0 ? qrData.allergies.join(', ') : 'None'}`,
    ``,
    `CONDITIONS: ${qrData.conditions.length > 0 ? qrData.conditions.join(', ') : 'None'}`,
    ``,
    `💊 MEDICATIONS: ${qrData.currentMedications.length > 0 ? qrData.currentMedications.join(', ') : 'None'}`,
    ``,
    `📞 EMERGENCY: ${qrData.emergencyContactName} (${qrData.emergencyContactRelationship})`,
    `   ${qrData.emergencyContactPhone}`
  ];

  if (qrData.importantNotes) {
    lines.push(``, `📝 NOTES: ${qrData.importantNotes}`);
  }

  return lines.join('\n');
};
