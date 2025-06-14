
import React from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import FAB from '@/components/shared/FAB'; // Added FAB import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, AlertTriangle, Search } from 'lucide-react'; // Added AlertTriangle and Search
import { useHealthData } from '@/contexts/HealthDataContext';
import DocumentItem from '@/components/vault/DocumentItem';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Input } from '@/components/ui/input'; // For search (basic)

const VaultScreen: React.FC = () => {
  const { documents, isLoading, error } = useHealthData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-surface-card border-border-divider shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-destructive-action">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <p>Error loading documents: {error}</p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="text-center py-8">
          <FolderOpen className="h-12 w-12 mx-auto text-text-secondary mb-2" />
          <p className="text-text-secondary">Your health vault is empty.</p>
          <p className="text-sm text-text-secondary">Upload documents using the '+' button below.</p>
        </div>
      );
    }

    if (filteredDocuments.length === 0 && searchTerm) {
      return (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-text-secondary mb-2" />
          <p className="text-text-secondary">No documents found for "{searchTerm}".</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <DocumentItem key={doc.id} document={doc} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-main font-inter flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-6 pb-24"> {/* Added flex-grow */}
        <Card className="bg-surface-card border-border-divider shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <FolderOpen className="h-6 w-6 text-primary-action" />
              <span>Health Vault</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input 
                type="text"
                placeholder="Search documents..."
                className="pl-10 border-border-divider focus:border-primary-action"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            </div>
            {renderContent()}
          </CardContent>
        </Card>
      </main>

      <FAB /> {/* Added FAB component */}
      <BottomNavigation />
    </div>
  );
};

export default VaultScreen;
