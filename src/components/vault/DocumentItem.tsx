
import React from 'react';
import { Document } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, File as FileIcon, Download } from 'lucide-react'; // Added Download icon
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils'; // We'll need to ensure this utility exists or create it

interface DocumentItemProps {
  document: Document;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.toLowerCase() === 'pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    // Add more specific icons for other types if needed
    return <FileIcon className="h-6 w-6 text-gray-500" />;
  };

  return (
    <Card className="mb-4 bg-surface-card border-border-divider shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.fileType)}
            <CardTitle className="text-lg font-medium text-text-primary truncate" title={document.fileName}>
              {document.fileName}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => console.log('Download:', document.fileName)}>
            <Download className="h-5 w-5 text-primary-action" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-text-secondary space-y-1">
          <p>Type: {document.fileType}</p>
          <p>Uploaded: {formatDate(document.uploadDate)}</p>
        </div>
        {/* Placeholder for future actions like 'View' or 'Delete' */}
      </CardContent>
    </Card>
  );
};

export default DocumentItem;
