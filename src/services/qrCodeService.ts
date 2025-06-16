
import QRCode from 'qrcode';
import { User } from '@/types';
// import { format, parseISO } from 'date-fns'; // No longer needed for dob formatting in QR

export interface QRCodeData {
  qrId: string; // Unique ID for the QR instance itself
  userName: string;
  medicalId: string; // User's main ID
  emergencyContactName: string;
  emergencyContactPhone: string;
  generatedAt: string;
}

export const generateUniqueQRId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `QR-${timestamp}-${random}`;
};

export const generateQRCodeData = (user: User): QRCodeData => {
  return {
    qrId: generateUniqueQRId(), // Use qrId for the instance ID
    userName: user.name,
    medicalId: user.id, // User's primary ID
    emergencyContactName: user.emergencyContact.name,
    emergencyContactPhone: user.emergencyContact.phone,
    generatedAt: new Date().toISOString()
  };
};

export const generateQRCodeImage = async (qrData: QRCodeData): Promise<string> => {
  const dataString = JSON.stringify(qrData);
  
  try {
    const qrCodeUrl = await QRCode.toDataURL(dataString, {
      width: 300,
      margin: 2,
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

export const regenerateQRCode = async (user: User): Promise<{ data: QRCodeData; imageUrl: string }> => {
  const qrData = generateQRCodeData(user);
  const qrImageUrl = await generateQRCodeImage(qrData);
  saveQRCodeToStorage(qrData, qrImageUrl);
  
  return { data: qrData, imageUrl: qrImageUrl };
};
