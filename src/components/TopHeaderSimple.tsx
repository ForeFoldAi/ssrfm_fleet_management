import logo from '/logo.png';
import { useRole } from '../contexts/RoleContext';
import { RoleSwitcher } from './RoleSwitcher';
import { Bell, FileText, Clock, User, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import materialIndentsApi from '../lib/api/material-indents';
import { MaterialIndent } from '../lib/api/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatDateToDDMMYYYY } from '../lib/utils';
import { getFirebaseToken } from '@/config/firebase';
import { notificationApi } from '@/lib/api/notification';

export const TopHeaderSimple = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<MaterialIndent[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications for company owners (only pending approval indents)
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser?.role === 'company_owner') {
        try {
          console.log('Fetching notifications for company owner...');
          // Fetch only pending_approval status for notifications
          const response = await materialIndentsApi.getAll({
            page: 1,
            limit: 10,
            status: 'pending_approval',
            sortBy: 'id',
            sortOrder: 'DESC',
          });
          console.log('Notifications response:', response);
          console.log('Notification count:', response.meta.itemCount);
          console.log('Notification data:', response.data);
          setNotificationCount(response.meta.itemCount);
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotificationCount(0);
          setNotifications([]);
        }
      } else {
        // Reset notifications if not company owner
        setNotificationCount(0);
        setNotifications([]);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleViewIndent = (indentId: number) => {
    setIsNotificationOpen(false);
    navigate(`/request-details/${indentId}`);
  };

  const handleViewAll = () => {
    setIsNotificationOpen(false);
    navigate('/materials-inventory', {
      state: { activeTab: 'material-order-book' },
    });
  };

  const handleGetFirebaseToken = async () => {
    const token = await getFirebaseToken();
    if (token) {
      await notificationApi.subscribeToNotification({
        token,
        deviceModel: window.navigator.userAgent,
        platform: 'web',
        appVersion: import.meta.env.VITE_APP_VERSION,
      });
    }
  };

  if (!currentUser) return null;

  return (
    <header className='fixed top-0 left-0 right-0 z-50  bg-gradient-to-r from-foreground to-foreground backdrop-blur-md   shadow-sm'>
      <div className='max-w-full mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Company Logo & Name */}
          <div className='flex items-center space-x-4'>
            <img
              src={logo}
              alt='Sree Sai Logo'
              className='h-12 w-auto object-contain'
            />
          </div>

          {/* Profile Section - Right Side */}
          <div className='flex items-center space-x-4'>
            {/* Notification Icon - Only for Company Owner */}
            {currentUser?.role === 'company_owner' && (
              <div className='relative' ref={notificationRef}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='relative text-white hover:text-warning hover:bg-white/10 rounded-full h-10 w-10 p-0'
                  onClick={handleNotificationClick}
                >
                  <Bell className='w-5 h-5' />
                  {notificationCount > 0 && (
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs border-2 border-foreground rounded-full'>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <Card className='absolute right-0 top-12 w-96 shadow-lg border-2 border-border'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base flex items-center justify-between'>
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <Badge variant='secondary' className='text-xs'>
                            {notificationCount} pending
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                      {notifications.length > 0 ? (
                        <div className='max-h-96 overflow-y-auto'>
                          {notifications.map((indent) => {
                            const firstItem =
                              indent.items && indent.items.length > 0
                                ? indent.items[0]
                                : null;
                            const materialName =
                              firstItem?.material?.name || 'Unknown Material';
                            const requestedBy =
                              indent.requestedBy?.name || 'Unknown User';
                            const requestDate =
                              indent.requestDate || new Date().toISOString();

                            return (
                              <div
                                key={indent.id}
                                className='p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors'
                                onClick={() => handleViewIndent(indent.id)}
                              >
                                <div className='flex items-start gap-3'>
                                  <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0'>
                                    <FileText className='w-4 h-4 text-yellow-600' />
                                  </div>
                                  <div className='flex-1 min-w-0'>
                                    <div className='font-medium text-sm text-foreground mb-1'>
                                      New Indent Request
                                    </div>
                                    <div className='text-xs text-muted-foreground space-y-1'>
                                      <div className='flex items-center gap-1'>
                                        <FileText className='w-3 h-3' />
                                        <span className='font-medium truncate'>
                                          {materialName}
                                        </span>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                        <User className='w-3 h-3' />
                                        <span className='truncate'>
                                          By: {requestedBy}
                                        </span>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                        <Calendar className='w-3 h-3' />
                                        <span>
                                          {formatDateToDDMMYYYY(requestDate)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className='bg-yellow-500 text-white text-xs flex-shrink-0'>
                                    Pending
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}

                          {/* View All Button */}
                          <div className='p-3 border-t border-border'>
                            <Button
                              variant='outline'
                              className='w-full text-sm'
                              onClick={handleViewAll}
                            >
                              View All Requests
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className='p-8 text-center'>
                          <Bell className='w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50' />
                          <p className='text-sm text-muted-foreground'>
                            No pending notifications
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            {/* Enable notification button */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleGetFirebaseToken}
            >
              <Bell className='w-5 h-5' />
              Enable
            </Button>
            <RoleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
