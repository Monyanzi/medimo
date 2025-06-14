
import React from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

const VaultScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-main font-inter">
      <Header />
      
      <main className="px-4 py-6 pb-24">
        <Card className="bg-surface-card border-border-divider shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <FolderOpen className="h-5 w-5 text-primary-action" />
              <span>Health Vault</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-text-secondary">
                Document vault feature coming soon. This will store all your health documents securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default VaultScreen;
