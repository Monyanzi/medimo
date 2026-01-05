
import React, { useState } from 'react';
import { toast } from 'sonner';
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
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'Image':
        return <Image className="h-6 w-6 text-blue-600" />;
      case 'Lab Report':
        return <FileMinus className="h-6 w-6 text-emerald-600" />;
      case 'Prescription':
        return <FileText className="h-6 w-6 text-violet-600" />;
      case 'Insurance Card':
        return <FileText className="h-6 w-6 text-amber-600" />;
      default:
        return <FileIcon className="h-6 w-6 text-slate-500" />;
    }
  };

  const getIconBackground = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return 'bg-red-50';
      case 'Image':
        return 'bg-blue-50';
      case 'Lab Report':
        return 'bg-emerald-50';
      case 'Prescription':
        return 'bg-violet-50';
      case 'Insurance Card':
        return 'bg-amber-50';
      default:
        return 'bg-slate-50';
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
    if (document.storagePath && !document.storagePath.startsWith('/')) {
      const link = window.document.createElement('a');
      link.href = document.storagePath;
      link.download = document.fileName;
      link.click();
      toast.success(`Download started for ${document.fileName}`);
    } else {
      toast.info(`Download not available for "${document.fileName}"`);
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
      <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl card-hover overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Large Icon Container - Apple style */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBackground(document.fileType)}`}>
              {getFileIcon(document.fileType)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-[var(--medimo-text-primary)] truncate" title={document.fileName}>
                    {document.fileName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-1 text-[10px] font-medium rounded-full uppercase tracking-wide ${getCategoryColor(document.category)}`}>
                      {document.category}
                    </span>
                    <span className="text-xs text-[var(--medimo-text-muted)]">
                      {formatFileSize(document.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Actions - Compact */}
                <div className="flex items-center -mr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewerOpen(true)}
                    className="h-9 w-9 rounded-lg hover:bg-[var(--medimo-accent-soft)]"
                    title="View"
                  >
                    <Eye className="h-4 w-4 text-[var(--medimo-accent)]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-9 w-9 rounded-lg hover:bg-[var(--medimo-accent-soft)]"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-[var(--medimo-accent)]" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg hover:bg-[var(--hc-accent-critical-soft)]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-[var(--medimo-critical)]" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{document.fileName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-[var(--medimo-critical)] hover:bg-[var(--medimo-critical)]/90 rounded-xl"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Meta - Compact single line */}
              <p className="text-xs text-[var(--medimo-text-muted)] mt-2">
                {formatDate(document.uploadDate)} • {document.fileType}
              </p>

              {/* Description - Only if present */}
              {document.description && (
                <p className="text-sm text-[var(--medimo-text-secondary)] mt-2 line-clamp-2">
                  {document.description}
                </p>
              )}

              {/* Tags - Minimal */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-[var(--medimo-bg-primary)] text-[var(--medimo-text-secondary)] text-[10px] rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="text-[10px] text-[var(--medimo-text-muted)]">
                      +{document.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
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
