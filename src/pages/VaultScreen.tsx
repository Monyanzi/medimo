
import React, { useState, useMemo } from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, AlertTriangle, Search, FileText } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import DocumentItem from '@/components/vault/DocumentItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
    const totalSizeFormatted = (totalSize / (1024 * 1024)).toFixed(1);
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
            <Card key={i} className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)]">
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
        <div className="text-center py-12 text-[var(--medimo-critical)]">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <p>Error loading documents: {error}</p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <EmptyState
          illustration="/illustrations/empty-vault.png"
          title="Your Vault Awaits"
          description="Securely store medical records, prescriptions, lab results, and insurance documents all in one place."
        />
      );
    }

    if (filteredAndSortedDocuments.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-[var(--medimo-text-muted)] mb-4" />
          <p className="text-[var(--medimo-text-secondary)]">No documents match your current filters.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-3 rounded-lg">
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
    <div className="min-h-screen bg-[var(--medimo-bg-primary)] flex flex-col">
      {/* Desktop Sidebar - hidden on mobile */}
      <DesktopSidebar />

      {/* Main content with sidebar offset on desktop */}
      <div className="xl:pl-64 transition-all duration-300 flex-1 flex flex-col">
        <Header />

        <main className="flex-grow px-4 py-6 pb-28 lg:pb-8 max-w-5xl mx-auto w-full lg:px-8">
          {/* Human-Friendly Stats - Encouraging, not clinical */}
          <div className="flex items-center gap-4 mb-6 reveal-1">
            <div className="flex-1 p-4 bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl font-bold text-[var(--medimo-text-primary)]">
                    {stats.totalDocuments} {stats.totalDocuments === 1 ? 'record' : 'records'}
                  </p>
                  <p className="text-sm text-[var(--medimo-text-muted)]">
                    {stats.categories > 0 ? `Across ${stats.categories} categories` : 'Start your health library'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--medimo-text-muted)]">
                    {parseFloat(stats.totalSize) < 1 ? 'Just getting started' :
                      parseFloat(stats.totalSize) < 10 ? 'Growing nicely' :
                        'Plenty of room left'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 h-1.5 bg-[var(--medimo-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--medimo-accent)] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((parseFloat(stats.totalSize) / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--medimo-text-muted)]">{stats.totalSize} MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl mb-6 reveal-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[var(--medimo-text-primary)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--medimo-accent-soft)] flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-[var(--medimo-accent)]" />
                </div>
                <span className="font-display font-semibold">Health Vault</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search documents, descriptions, or tags..."
                    className="pl-10 border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] focus:ring-[var(--medimo-accent)] rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--medimo-text-muted)]" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 rounded-lg border-[var(--medimo-border)]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Medical Records">Medical Records</SelectItem>
                      <SelectItem value="Lab Results">Lab Results</SelectItem>
                      <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Images">Images</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32 rounded-lg border-[var(--medimo-border)]">
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
                    <SelectTrigger className="w-32 rounded-lg border-[var(--medimo-border)]">
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
                    className="rounded-lg border-[var(--medimo-border)] hover:border-[var(--medimo-accent)]"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>

                  {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-lg border-[var(--medimo-border)]">
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
            <Card className="bg-[var(--medimo-accent-soft)] border border-[var(--medimo-accent)]/20 rounded-xl reveal-3">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-[var(--medimo-accent)] mt-0.5" />
                  <div>
                    <h4 className="font-display font-medium text-[var(--medimo-text-primary)]">Organize Your Documents</h4>
                    <p className="text-sm text-[var(--medimo-text-secondary)] mt-1">
                      Use tags and categories to keep your health documents organized. You can search by document name, description, or tags.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default VaultScreen;
