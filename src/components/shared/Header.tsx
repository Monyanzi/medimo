
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, QrCode, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import QRCodeModal from '@/components/modals/QRCodeModal';
import { format, parseISO } from 'date-fns';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);

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
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate to relevant section based on notification type
    if (notification.type === 'appointment') {
      navigate('/');
    } else if (notification.type === 'medication') {
      navigate('/');
    }
  };

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;

  return (
    <>
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
              title={`Current theme: ${theme}`}
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
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive-action flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-surface-card border border-border-divider">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-primary-action hover:text-primary-action/80"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No notifications
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.isRead 
                              ? 'bg-surface-secondary' 
                              : 'bg-accent-success/10 border border-accent-success/20'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                {notification.title}
                              </p>
                              <p className="text-xs text-text-secondary mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-text-secondary mt-1">
                                {format(parseISO(notification.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-accent-success rounded-full ml-2 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* QR Code */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQRCode}
              className="p-2 hover:bg-accent-success/20"
              title="Emergency QR Code"
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

      <QRCodeModal isOpen={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
};

export default Header;
