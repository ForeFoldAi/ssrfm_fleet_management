import { Outlet } from "react-router-dom";
import { TopHeaderSimple } from "./TopHeaderSimple";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { LogOut, Bell, FileText, User, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { RoleSwitcher } from "./RoleSwitcher";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRole } from "../contexts/RoleContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import materialIndentsApi from "../lib/api/material-indents";
import { MaterialIndent } from "../lib/api/types";
import { formatDateToDDMMYYYY } from "../lib/utils";

export const Layout = () => {
  const { logout, currentUser } = useRole();
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<MaterialIndent[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
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
          console.log('Fetching mobile notifications for company owner...');
          // Fetch only pending_approval status for notifications
          const response = await materialIndentsApi.getAll({
            page: 1,
            limit: 10,
            status: 'pending_approval',
            sortBy: 'id',
            sortOrder: 'DESC',
          });
          console.log('Mobile notifications response:', response);
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
    navigate('/materials-inventory', { state: { activeTab: 'material-order-book' } });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Header */}
      <div className="hidden md:block ">
        <TopHeaderSimple />
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-foreground to-foreground backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Sree Sai Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white">SSRFM</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Notification Icon - Only for Company Owner */}
            {currentUser?.role === 'company_owner' && (
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-white hover:text-warning hover:bg-white/10 rounded-full h-9 w-9 p-0"
                  onClick={handleNotificationClick}
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-foreground rounded-full">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <Card className="absolute right-0 top-12 w-80 shadow-lg border-2 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {notificationCount} pending
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                                             {notifications.length > 0 ? (
                         <div className="max-h-80 overflow-y-auto">
                           {notifications.map((indent) => {
                             const firstItem = indent.items && indent.items.length > 0 ? indent.items[0] : null;
                             const materialName = firstItem?.material?.name || 'Unknown Material';
                             const requestedBy = indent.requestedBy?.name || 'Unknown User';
                             const requestDate = indent.requestDate || new Date().toISOString();
                             
                             return (
                               <div
                                 key={indent.id}
                                 className="p-2 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                 onClick={() => handleViewIndent(indent.id)}
                               >
                                 <div className="flex items-start gap-2">
                                   <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                     <FileText className="w-3 h-3 text-yellow-600" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <div className="font-medium text-xs text-foreground mb-1">
                                       New Indent Request
                                     </div>
                                     <div className="text-xs text-muted-foreground space-y-0.5">
                                       <div className="truncate">
                                         <span className="font-medium">{materialName}</span>
                                       </div>
                                       <div className="truncate">By: {requestedBy}</div>
                                       <div>{formatDateToDDMMYYYY(requestDate)}</div>
                                     </div>
                                   </div>
                                   <Badge className="bg-yellow-500 text-white text-[10px] flex-shrink-0">
                                     New
                                   </Badge>
                                 </div>
                               </div>
                             );
                           })}
                          
                          {/* View All Button */}
                          <div className="p-2">
                            <Button
                              variant="outline"
                              className="w-full text-xs"
                              size="sm"
                              onClick={handleViewAll}
                            >
                              View All Requests
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-muted-foreground">No pending notifications</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <RoleSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-1 px-2 py-1 text-xs text-white hover:text-warning hover:border-warning border-white rounded-[20px] bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`pt-20 md:pt-24 px-6 pb-24 md:pb-8 transition-all duration-300 ${
        isExpanded ? 'md:pl-72' : 'md:pl-24'
      }`}>
        <div className="max-w mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};
