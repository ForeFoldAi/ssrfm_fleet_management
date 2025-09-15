import { Outlet } from "react-router-dom";
import { TopHeaderSimple } from "./TopHeaderSimple";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { Package, LogOut } from "lucide-react";
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[20px] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SSRFM</h1>
              <p className="text-xs text-gray-500">Industries</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RoleSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:border-red-300 rounded-[20px]"
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
