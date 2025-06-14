
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document } from '@/types';
import { FileText, Image, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, isOpen, onOpenChange }) => {
  if (!document) return null;

  const handleDownload = () => {
    // In a real app, this would download the actual file
    console.log('Downloading document:', document.fileName);
    // Create a mock download link
    const link = window.document.createElement('a');
    link.href = '#';
    link.download = document.fileName;
    link.click();
  };

  const isImage = document.fileType === 'Image' || document.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = document.fileType === 'PDF' || document.fileName.endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {document.fileType === 'Image' ? (
                <Image className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-red-500" />
              )}
              <span>{document.fileName}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex justify-center p-4">
              <img 
                src="/placeholder.svg" 
                alt={document.fileName}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : isPDF ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <FileText className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <p className="text-gray-600 mb-4">PDF Preview</p>
              <p className="text-sm text-gray-500">
                PDF viewer would be integrated here in a production environment
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-600 mb-2">Document Preview</p>
              <p className="text-sm text-gray-500">
                Preview not available for this file type
              </p>
            </div>
          )}
          
          {/* Document Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Document Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2">{document.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2">{document.fileType}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2">{(document.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <span className="ml-2">{new Date(document.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
            {document.description && (
              <div className="mt-2">
                <span className="text-gray-500">Description:</span>
                <p className="mt-1 text-sm">{document.description}</p>
              </div>
            )}
            {document.tags && document.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-500">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {document.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
