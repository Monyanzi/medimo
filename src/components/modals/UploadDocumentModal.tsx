
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Image, X } from "lucide-react";
import { useHealthData } from "@/contexts/HealthDataContext";
import { Document } from "@/types";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onOpenChange }) => {
  const { addDocument } = useHealthData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<Document['category']>('Other');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      const name = file.name.toLowerCase();
      if (name.includes('lab') || name.includes('test') || name.includes('result')) {
        setCategory('Lab Results');
      } else if (name.includes('prescription') || name.includes('rx')) {
        setCategory('Prescriptions');
      } else if (name.includes('insurance') || name.includes('card')) {
        setCategory('Insurance');
      } else if (file.type.startsWith('image/')) {
        setCategory('Images');
      } else {
        setCategory('Medical Records');
      }
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const getFileTypeFromMimeType = (mimeType: string): Document['fileType'] => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.includes('lab') || category === 'Lab Results') return 'Lab Report';
    if (category === 'Prescriptions') return 'Prescription';
    if (category === 'Insurance') return 'Insurance Card';
    return 'Medical Record';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const mockStoragePath = `/documents/${selectedFile.name}`;

      const documentData: Omit<Document, 'id'> = {
        fileName: fileName || selectedFile.name,
        fileType: getFileTypeFromMimeType(selectedFile.type),
        uploadDate: new Date().toISOString(),
        storagePath: mockStoragePath,
        category,
        fileSize: selectedFile.size,
        description: description || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      };

      await addDocument(documentData);

      setSelectedFile(null);
      setFileName('');
      setCategory('Other');
      setDescription('');
      setTags('');

      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to your health vault
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-action transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="h-6 w-6 text-blue-500" />
                  ) : (
                    <FileText className="h-6 w-6 text-red-500" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Click to select or drag and drop your file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>

          {/* File Name */}
          <div>
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter a descriptive name"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: Document['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medical Records">Medical Records</SelectItem>
                <SelectItem value="Lab Results">Lab Results</SelectItem>
                <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Imaging">Imaging (X-rays, MRI, CT)</SelectItem>
                <SelectItem value="Images">Photos & Images</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (e.g., blood test, annual checkup)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
