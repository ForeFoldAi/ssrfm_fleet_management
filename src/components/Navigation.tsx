import { NavLink } from "react-router-dom";
import { Package, FileText, Plus, List, Users, Settings, Shield, Database, Activity, LogOut, Building2, ChevronDown } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { useState } from "react";

export const Navigation = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  // Role-specific navigation items
  const getNavigationItems = () => {
    const userRole = currentUser?.role;
    
    // Dashboard item - exclude for supervisor role
    const baseItems = userRole !== "site_supervisor" ? [
      { 
        to: "/", 
        label: "Dashboard", 
        icon: Activity, 
        permission: null 
      },
    ] : [];

    const roleSpecificItems: Record<string, any[]> = {
      "site_supervisor": [
        { to: "/supervisor-requests", label: "My Requests", icon: List, permission: "request:view_own" },
        { to: "/materials-inventory", label: "Stock Register", icon: Package, permission: "material:view" },
      ],
      "inventory_manager": [
        { to: "/requests-list", label: "All Requests", icon: List, permission: "request:view_all" },
        { to: "/materials-inventory", label: "Stock Register", icon: Package, permission: "material:view" },
      ],
      "company_owner": [
        { to: "/approval-center", label: "Approval Center", icon: Shield, permission: "request:approve_unlimited" },
        { to: "/materials-inventory", label: "Stock Register", icon: Package, permission: "material:view" },
      ]
    };

    if (!userRole) return baseItems;

    const roleItems = roleSpecificItems[userRole] || [];
    return [...baseItems, ...roleItems.filter(item => 
      item.permission === null || hasPermission(item.permission)
    )];
  };

  const navItems = getNavigationItems();
  
  // Determine how many items to show based on screen size
  const getVisibleItemsCount = () => {
    if (navItems.length <= 5) return navItems.length;
    return 5; // Show first 5 items on desktop, rest in dropdown
  };

  const visibleItemsCount = getVisibleItemsCount();
  const visibleItems = navItems.slice(0, visibleItemsCount);
  const dropdownItems = navItems.slice(visibleItemsCount);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company Logo & Name */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">SSRFM Industries</h1>
              <p className="text-xs text-gray-500 -mt-1">Smart Supply & Resource Management</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">SSRFM</h1>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </NavLink>
              );
            })}
            
            {/* Dropdown menu for additional items */}
            {dropdownItems.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <Settings className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  <span className="text-sm font-semibold">More</span>
                  <ChevronDown className={`w-3 h-3 transition-all duration-200 ${isMoreMenuOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600'}`} />
                </button>
                
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Additional Menu</div>
                        {dropdownItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsMoreMenuOpen(false)}
                              className={({ isActive }) =>
                                `group flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${
                                  isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                }`
                              }
                            >
                              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Role Switcher and Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
            <RoleSwitcher />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="group gap-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-sm px-3 py-2 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-100">
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                      `group flex flex-col items-center space-y-2 p-3 rounded-2xl font-medium transition-all duration-200 ${
                      isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`
                  }
                >
                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold text-center">{item.label}</span>
                </NavLink>
              );
            })}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="md:hidden">
                <RoleSwitcher />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="group gap-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};