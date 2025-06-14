
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, FolderOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      isActive: location.pathname === '/'
    },
    {
      path: '/timeline',
      icon: Clock,
      label: 'Timeline',
      isActive: location.pathname === '/timeline'
    },
    {
      path: '/vault',
      icon: FolderOpen,
      label: 'Vault',
      isActive: location.pathname === '/vault'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      isActive: location.pathname.startsWith('/profile')
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border-divider font-inter z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                item.isActive
                  ? "text-primary-action"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-success/20"
              )}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1",
                  item.isActive && "fill-current"
                )} 
              />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
