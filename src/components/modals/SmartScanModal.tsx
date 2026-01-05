
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, FileText, Pill, Calendar, CreditCard, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

interface SmartScanModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SmartScanModal: React.FC<SmartScanModalProps> = ({ isOpen, onOpenChange }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scanTypes = [
    {
      id: 'prescription',
      title: 'Prescription Bottle',
      description: 'Scan medication labels to auto-add to your list',
      icon: Pill,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      id: 'appointment',
      title: 'Appointment Card',
      description: 'Extract appointment details automatically',
      icon: Calendar,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      id: 'insurance',
      title: 'Insurance Card',
      description: 'Save your insurance information securely',
      icon: CreditCard,
      color: 'text-green-500 bg-green-50'
    },
    {
      id: 'lab',
      title: 'Lab Results',
      description: 'Import test results and values',
      icon: FlaskConical,
      color: 'text-orange-500 bg-orange-50'
    },
    {
      id: 'document',
      title: 'Medical Document',
      description: 'Scan any medical document or report',
      icon: FileText,
      color: 'text-gray-500 bg-gray-50'
    }
  ];

  const startCamera = async () => {
    setIsScanning(true);
    setCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please ensure permissions are granted.");
      setCameraActive(false);
      setIsScanning(false);
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
    setIsScanning(false);
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
        // const imageDataUrl = canvas.toDataURL('image/png'); // Can be used to display preview or upload
        stopCamera();
        setScanResult("Image captured successfully!");
        toast.success("Image captured and processed");
      }
    }
  };

  // Stop camera when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const handleScanType = (scanType: string) => {
    if (scanType === 'Camera') {
      startCamera();
    } else {
      setIsScanning(true);
      // Simulate OCR processing for non-camera options
      setTimeout(() => {
        setIsScanning(false);
        setScanResult(`Scanned ${scanType} successfully!`);
        toast.success(`${scanType} information extracted and ready to save`);
      }, 2000);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsScanning(true);

      // Simulate OCR processing
      setTimeout(() => {
        setIsScanning(false);
        setScanResult(`Processed ${file.name} successfully!`);
        toast.success('Document processed and information extracted');
      }, 2000);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
    setCameraActive(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) stopCamera();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md font-inter">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Smart Scan</DialogTitle>
        </DialogHeader>

        {cameraActive ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex space-x-3 w-full">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={captureImage} className="flex-1 bg-primary-action hover:bg-primary-action/90">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        ) : isScanning && !cameraActive ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-action mx-auto mb-4"></div>
            <p className="text-text-secondary">Processing your scan...</p>
          </div>
        ) : scanResult ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-text-primary font-medium mb-4">{scanResult}</p>
            <div className="flex space-x-3">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Scan Another
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              Choose what you'd like to scan. Our AI will extract the information automatically.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {scanTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer transition-shadow hover:elev-raised"
                    onClick={() => handleScanType(type.title)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${type.color}`}>
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

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                onClick={handleFileUpload}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button
                onClick={() => handleScanType('Camera')}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SmartScanModal;
