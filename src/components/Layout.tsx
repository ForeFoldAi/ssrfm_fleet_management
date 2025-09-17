import { Outlet } from "react-router-dom";
import { TopHeaderSimple } from "./TopHeaderSimple";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "../contexts/RoleContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";

export const Layout = () => {
  const { logout } = useRole();
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();

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
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Minar Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white">SSRFM</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
