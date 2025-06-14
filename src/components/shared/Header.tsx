
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, QrCode, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('medimo_theme', nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleQRCode = () => {
    // TODO: Open QR Code modal
    console.log('Opening QR Code modal');
  };

  const handleNotifications = () => {
    // TODO: Open notifications dropdown
    console.log('Opening notifications');
  };

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;

  return (
    <header className="bg-surface-card border-b border-border-divider px-4 py-3 font-inter">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and User name */}
        <div className="flex flex-col">
          <Link 
            to="/" 
            className="text-xl font-bold text-primary-action hover:text-primary-action/80 transition-colors"
          >
            Medimo
          </Link>
          {user && (
            <span className="text-sm text-text-secondary">{user.name}</span>
          )}
        </div>

        {/* Right side - Icons */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 hover:bg-accent-success/20"
          >
            <ThemeIcon className="h-5 w-5 text-text-secondary" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="p-2 hover:bg-accent-success/20 relative"
              >
                <Bell className="h-5 w-5 text-text-secondary" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive-action rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">2</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-surface-card border border-border-divider">
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-accent-success/10 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">Medication Reminder</p>
                    <p className="text-xs text-text-secondary">Take Lisinopril 10mg - Due in 30 minutes</p>
                  </div>
                  <div className="p-3 bg-accent-success/10 rounded-lg">
                    <p className="text-sm font-medium text-text-primary">Upcoming Appointment</p>
                    <p className="text-xs text-text-secondary">Cardiology Follow-up tomorrow at 9:30 AM</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 text-text-secondary hover:text-text-primary"
                  size="sm"
                >
                  Mark all as read
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* QR Code */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQRCode}
            className="p-2 hover:bg-accent-success/20"
          >
            <QrCode className="h-5 w-5 text-text-secondary" />
          </Button>

          {/* User Avatar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-1 hover:bg-accent-success/20 rounded-full"
          >
            <Avatar className="h-8 w-8 bg-accent-success">
              <AvatarFallback className="bg-accent-success text-text-primary font-medium text-sm">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
