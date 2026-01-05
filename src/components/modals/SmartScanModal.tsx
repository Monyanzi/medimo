
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, FileText, Pill, Calendar, CreditCard, FlaskConical, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useHealthData } from '@/contexts/HealthDataContext';

interface SmartScanModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type ScanType = 'prescription' | 'appointment' | 'insurance' | 'lab' | 'document' | null;
type Step = 'select' | 'capture' | 'review' | 'manual-entry';

const SmartScanModal: React.FC<SmartScanModalProps> = ({ isOpen, onOpenChange }) => {
  const { addDocument, addMedication, addAppointment } = useHealthData();
  
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<ScanType>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manual entry form data
  const [formData, setFormData] = useState({
    // Medication fields
    medicationName: '',
    dosage: '',
    frequency: '',
    // Appointment fields
    appointmentTitle: '',
    doctorName: '',
    dateTime: '',
    location: '',
    // Document fields
    documentName: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scanTypes = [
    {
      id: 'prescription' as ScanType,
      title: 'Prescription / Medication',
      description: 'Capture medication label and add to your list',
      icon: Pill,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      id: 'appointment' as ScanType,
      title: 'Appointment Card',
      description: 'Capture appointment details',
      icon: Calendar,
      color: 'text-violet-500 bg-violet-50'
    },
    {
      id: 'insurance' as ScanType,
      title: 'Insurance Card',
      description: 'Save insurance card to your vault',
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-50'
    },
    {
      id: 'lab' as ScanType,
      title: 'Lab Results',
      description: 'Save lab results document',
      icon: FlaskConical,
      color: 'text-orange-500 bg-orange-50'
    },
    {
      id: 'document' as ScanType,
      title: 'Other Document',
      description: 'Save any medical document',
      icon: FileText,
      color: 'text-slate-500 bg-slate-50'
    }
  ];

  const resetModal = () => {
    setStep('select');
    setSelectedType(null);
    setCapturedImage(null);
    setCapturedFile(null);
    setCameraError(null);
    setIsProcessing(false);
    setFormData({
      medicationName: '',
      dosage: '',
      frequency: '',
      appointmentTitle: '',
      doctorName: '',
      dateTime: '',
      location: '',
      documentName: '',
    });
    stopCamera();
  };

  const startCamera = async () => {
    setCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please grant permission or upload an image instead.");
      setCameraActive(false);
      toast.error("Camera access denied or unavailable");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        
        // Convert to File for storage
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedFile(file);
          }
        }, 'image/jpeg', 0.9);
        
        stopCamera();
        setStep('review');
      }
    }
  };

  const handleSelectType = (type: ScanType) => {
    setSelectedType(type);
    setStep('capture');
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setStep('review');
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveToVault = async () => {
    if (!capturedFile || !selectedType) return;
    
    setIsProcessing(true);
    try {
      const categoryMap: Record<string, 'Medical Records' | 'Lab Results' | 'Prescriptions' | 'Insurance' | 'Other'> = {
        'prescription': 'Prescriptions',
        'appointment': 'Medical Records',
        'insurance': 'Insurance',
        'lab': 'Lab Results',
        'document': 'Other'
      };
      
      // Create a document entry
      await addDocument({
        fileName: formData.documentName || capturedFile.name,
        fileType: capturedFile.type,
        uploadDate: new Date().toISOString(),
        storagePath: URL.createObjectURL(capturedFile), // Local blob URL for demo
        category: categoryMap[selectedType] || 'Other',
        fileSize: capturedFile.size,
        description: `Smart Scan: ${scanTypes.find(t => t.id === selectedType)?.title}`,
        tags: ['smart-scan', selectedType]
      });
      
      toast.success('Document saved to vault!');
      
      // If it's a medication or appointment, offer manual entry
      if (selectedType === 'prescription' || selectedType === 'appointment') {
        setStep('manual-entry');
      } else {
        onOpenChange(false);
        resetModal();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveMedication = async () => {
    if (!formData.medicationName) {
      toast.error('Please enter a medication name');
      return;
    }
    
    setIsProcessing(true);
    try {
      await addMedication({
        name: formData.medicationName,
        dosage: formData.dosage || 'As directed',
        frequency: formData.frequency || 'As needed',
        status: 'active',
        notes: 'Added via Smart Scan'
      });
      
      toast.success('Medication added successfully!');
      onOpenChange(false);
      resetModal();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAppointment = async () => {
    if (!formData.appointmentTitle || !formData.dateTime) {
      toast.error('Please enter appointment title and date/time');
      return;
    }
    
    setIsProcessing(true);
    try {
      await addAppointment({
        title: formData.appointmentTitle,
        doctorName: formData.doctorName || 'Not specified',
        location: formData.location || 'Not specified',
        dateTime: new Date(formData.dateTime).toISOString(),
        status: 'scheduled',
        notes: 'Added via Smart Scan'
      });
      
      toast.success('Appointment added successfully!');
      onOpenChange(false);
      resetModal();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast.error('Failed to add appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop camera when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              Choose what you'd like to scan. Take a photo or upload an existing image.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {scanTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
                    onClick={() => handleSelectType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${type.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary">{type.title}</h4>
                          <p className="text-sm text-text-secondary">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'capture':
        return (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { stopCamera(); setStep('select'); }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {cameraActive ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Scanning overlay */}
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
                  </div>
                </div>
                <p className="text-sm text-text-secondary text-center">
                  Position the {scanTypes.find(t => t.id === selectedType)?.title.toLowerCase()} within the frame
                </p>
                <div className="flex space-x-3 w-full">
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={captureImage} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-8">
                {cameraError && (
                  <p className="text-sm text-red-500 text-center mb-2">{cameraError}</p>
                )}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button onClick={startCamera} size="lg" className="w-full">
                    <Camera className="h-5 w-5 mr-2" />
                    Open Camera
                  </Button>
                  <Button onClick={handleFileUpload} variant="outline" size="lg" className="w-full">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-text-muted text-center mt-2">
                  Tip: For best results, ensure good lighting and a clear view of the text
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setCapturedImage(null); setCapturedFile(null); setStep('capture'); }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retake
            </Button>

            {capturedImage && (
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img 
                  src={capturedImage} 
                  alt="Captured scan" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="docName">Document Name (optional)</Label>
                <Input
                  id="docName"
                  placeholder={`${scanTypes.find(t => t.id === selectedType)?.title} - ${new Date().toLocaleDateString()}`}
                  value={formData.documentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentName: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => { setCapturedImage(null); setCapturedFile(null); setStep('capture'); }} 
                variant="outline" 
                className="flex-1"
              >
                Retake
              </Button>
              <Button 
                onClick={handleSaveToVault} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save to Vault
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'manual-entry':
        return (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-text-secondary">
                Image saved! Now add the details:
              </p>
            </div>

            {selectedType === 'prescription' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="medName">Medication Name *</Label>
                  <Input
                    id="medName"
                    placeholder="e.g., Lisinopril"
                    value={formData.medicationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicationName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 10mg"
                      value={formData.dosage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      placeholder="e.g., Once daily"
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button 
                    onClick={() => { onOpenChange(false); resetModal(); }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleSaveMedication} 
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Saving...' : 'Add Medication'}
                  </Button>
                </div>
              </div>
            )}

            {selectedType === 'appointment' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="apptTitle">Appointment Title *</Label>
                  <Input
                    id="apptTitle"
                    placeholder="e.g., Annual Checkup"
                    value={formData.appointmentTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor Name</Label>
                  <Input
                    id="doctor"
                    placeholder="e.g., Dr. Smith"
                    value={formData.doctorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTime">Date & Time *</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., City Medical Center"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button 
                    onClick={() => { onOpenChange(false); resetModal(); }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleSaveAppointment} 
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Saving...' : 'Add Appointment'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetModal();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Smart Scan
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Capture medical documents with your camera'}
            {step === 'capture' && `Scanning: ${scanTypes.find(t => t.id === selectedType)?.title}`}
            {step === 'review' && 'Review your captured image'}
            {step === 'manual-entry' && 'Enter the details from your scan'}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SmartScanModal;
