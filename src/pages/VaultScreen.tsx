
import React, { useState, useMemo } from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import FAB from '@/components/shared/FAB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, AlertTriangle, Search, Filter, FileText } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import DocumentItem from '@/components/vault/DocumentItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Document } from '@/types';

const VaultScreen: React.FC = () => {
  const { documents, isLoading, error } = useHealthData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesType = typeFilter === 'all' || doc.fileType === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchTerm, categoryFilter, typeFilter, sortBy, sortOrder]);

  const getStorageStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const totalSizeFormatted = (totalSize / (1024 * 1024)).toFixed(1); // MB
    return {
      totalDocuments: documents.length,
      totalSize: totalSizeFormatted,
      categories: [...new Set(documents.map(doc => doc.category))].length
    };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

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

    if (filteredAndSortedDocuments.length === 0) {
      return (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-text-secondary mb-2" />
          <p className="text-text-secondary">No documents match your current filters.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-2">
            Clear Filters
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredAndSortedDocuments.map((doc) => (
          <DocumentItem key={doc.id} document={doc} />
        ))}
      </div>
    );
  };

  const stats = getStorageStats();

  return (
    <div className="min-h-screen bg-background-main font-inter flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-6 pb-24">
        {/* Storage Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-surface-card border-border-divider shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-action">{stats.totalDocuments}</div>
              <div className="text-xs text-text-secondary">Documents</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-card border-border-divider shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-action">{stats.totalSize}</div>
              <div className="text-xs text-text-secondary">MB Used</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-card border-border-divider shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-action">{stats.categories}</div>
              <div className="text-xs text-text-secondary">Categories</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-surface-card border-border-divider shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <FolderOpen className="h-6 w-6 text-primary-action" />
              <span>Health Vault</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Search documents, descriptions, or tags..."
                  className="pl-10 border-border-divider focus:border-primary-action"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Medical Records">Medical Records</SelectItem>
                    <SelectItem value="Lab Results">Lab Results</SelectItem>
                    <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Images">Images</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Lab Report">Lab Report</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Insurance Card">Insurance Card</SelectItem>
                    <SelectItem value="Medical Record">Medical Record</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'size') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>

                {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {renderContent()}
          </CardContent>
        </Card>

        {/* Tips Card */}
        {documents.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Organize Your Documents</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Use tags and categories to keep your health documents organized. You can search by document name, description, or tags.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <FAB />
      <BottomNavigation />
    </div>
  );
};

export default VaultScreen;
