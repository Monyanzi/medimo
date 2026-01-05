
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
  const { user, logout } = useAuth();

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
    if (notification.type === 'appointment') {
      navigate('/');
    } else if (notification.type === 'medication') {
      navigate('/');
    }
  };

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor;

  return (
    <>
      <header className="sticky top-0 bg-[var(--medimo-bg-elevated)] border-b border-[var(--medimo-border)] px-4 py-3 z-40 elev-surface">
        <div className="flex items-center justify-between max-w-6xl mx-auto lg:px-4">
          {/* Logo - Hidden on xl: desktop where sidebar is visible */}
          <Link
            to="/"
            className="flex items-center space-x-2 group xl:opacity-0 xl:pointer-events-none"
          >
            <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)] tracking-tight group-hover:text-[var(--medimo-accent)] transition-colors">
              Medimo
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-1">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--medimo-accent-soft)] text-[var(--medimo-text-secondary)] hover:text-[var(--medimo-accent)] transition-colors"
              title={`Current theme: ${theme}`}
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-lg hover:bg-[var(--medimo-accent-soft)] text-[var(--medimo-text-secondary)] hover:text-[var(--medimo-accent)] transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-[10px] bg-[var(--medimo-critical)] text-white flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] elev-overlay rounded-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-[var(--medimo-text-primary)]">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-[var(--medimo-accent)] hover:text-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)]"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-[var(--medimo-text-secondary)] text-center py-4">
                      No notifications
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${notification.isRead
                            ? 'bg-[var(--medimo-bg-primary)]'
                            : 'bg-[var(--medimo-accent-soft)] border border-[var(--medimo-accent)]/20'
                            }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--medimo-text-primary)]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-[var(--medimo-text-secondary)] mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[var(--medimo-text-muted)] mt-1 font-mono">
                                {format(parseISO(notification.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[var(--medimo-accent)] rounded-full ml-2 mt-1 pulse-gentle" />
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
              className="p-2 rounded-lg hover:bg-[var(--medimo-accent-soft)] text-[var(--medimo-text-secondary)] hover:text-[var(--medimo-accent)] transition-colors"
              title="Emergency QR Code"
            >
              <QrCode className="h-5 w-5" />
            </Button>

            {/* User Avatar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-1 rounded-full hover:bg-transparent"
            >
              <Avatar className="h-8 w-8 bg-[var(--medimo-accent)] ring-2 ring-[var(--medimo-accent-soft)]">
                <AvatarFallback className="bg-[var(--medimo-accent)] text-white font-display font-semibold text-sm">
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
