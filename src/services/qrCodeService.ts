
import QRCode from 'qrcode';
import { User } from '@/types';
import { format, parseISO } from 'date-fns';

export interface QRCodeData {
  id: string;
  name: string;
  dob: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  organDonor: string;
  medicalId: string;
  generatedAt: string;
}

export const generateUniqueQRId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `QR-${timestamp}-${random}`;
};

export const generateQRCodeData = (user: User): QRCodeData => {
  return {
    id: generateUniqueQRId(),
    name: user.name,
    dob: format(parseISO(user.dob), 'MM/dd/yyyy'),
    bloodType: user.bloodType,
    allergies: user.allergies.length > 0 ? user.allergies.join(', ') : 'None',
    conditions: user.conditions.length > 0 ? user.conditions.join(', ') : 'None',
    emergencyContact: {
      name: user.emergencyContact.name,
      phone: user.emergencyContact.phone,
      relationship: user.emergencyContact.relationship
    },
    organDonor: user.organDonor ? 'Yes' : 'No',
    medicalId: user.id,
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
