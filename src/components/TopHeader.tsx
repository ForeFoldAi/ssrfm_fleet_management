import { useRole } from "../contexts/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { LogOut, User, Building2 } from "lucide-react";

export const TopHeader = () => {
  const { currentUser, logout } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Company Branding */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">IMMs</h1>
              <p className="text-xs text-gray-500 hidden sm:block">powered by Forefold AI</p>
            </div>
          </div>

          {/* User Details and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Info - Hidden on small mobile */}
            <div className="hidden xs:flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">
                  {currentUser.name}
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="hidden sm:block">
              <RoleSwitcher />
            </div>

            {/* Mobile Role Switcher - Compact */}
            <div className="sm:hidden">
            <RoleSwitcher />
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1 sm:gap-2 border-gray-200 hover:bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};