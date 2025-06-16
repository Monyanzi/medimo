
import React, { useState } from 'react';
import { Document } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, File as FileIcon, Download, Eye, Trash2, Image, FileMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useHealthData } from '@/contexts/HealthDataContext';
import DocumentViewer from './DocumentViewer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentItemProps {
  document: Document;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document }) => {
  const { deleteDocument } = useHealthData();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'Image':
        return <Image className="h-6 w-6 text-blue-500" />;
      case 'Lab Report':
        return <FileMinus className="h-6 w-6 text-green-500" />;
      case 'Prescription':
        return <FileText className="h-6 w-6 text-purple-500" />;
      case 'Insurance Card':
        return <FileText className="h-6 w-6 text-orange-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medical Records':
        return 'bg-blue-100 text-blue-800';
      case 'Lab Results':
        return 'bg-green-100 text-green-800';
      case 'Prescriptions':
        return 'bg-purple-100 text-purple-800';
      case 'Insurance':
        return 'bg-orange-100 text-orange-800';
      case 'Images':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    console.log('Attempting to download:', document.fileName, 'from mock path:', document.storagePath);
    // For mock purposes, actual download from a relative path like '/documents/...' won't work.
    // Instead, we can simulate the intent or show a message.
    // If storagePath was a full external URL, it might work.
    if (document.storagePath && !document.storagePath.startsWith('/')) { // Basic check if it's an external URL
        const link = window.document.createElement('a');
        link.href = document.storagePath;
        link.download = document.fileName;
        link.click();
        toast.success(`Download started for ${document.fileName}`);
    } else {
        toast.info(`Download not available for "${document.fileName}" in this mock version. Path: ${document.storagePath}`);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(document.id);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="mb-4 bg-surface-card border-border-divider shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(document.fileType)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-medium text-text-primary truncate" title={document.fileName}>
                  {document.fileName}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatFileSize(document.fileSize)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewerOpen(true)}
                title="View document"
              >
                <Eye className="h-4 w-4 text-primary-action" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDownload}
                title="Download document"
              >
                <Download className="h-4 w-4 text-primary-action" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{document.fileName}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-text-secondary space-y-1">
            <p>Type: {document.fileType}</p>
            <p>Uploaded: {formatDate(document.uploadDate)}</p>
            {document.description && (
              <p className="text-text-primary mt-2">{document.description}</p>
            )}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DocumentViewer 
        document={document}
        isOpen={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </>
  );
};

export default DocumentItem;
