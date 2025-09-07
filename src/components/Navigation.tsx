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
    const baseItems = [
      { 
        to: "/", 
        label: "Dashboard", 
        icon: Activity, 
        permission: null 
      },
    ];

    const roleSpecificItems = {
      "Site Supervisor": [
        { to: "/material-request", label: "Request Materials", icon: Plus, permission: "create_requests" },
        { to: "/requests-list", label: "My Requests", icon: List, permission: "view_own_requests" },
      ],
      "Inventory Manager": [
        { to: "/materials-inventory", label: "Inventory", icon: Package, permission: "manage_inventory" },
        { to: "/requests-list", label: "All Requests", icon: List, permission: "view_all_requests" },
        { to: "/stock-management", label: "Stock Management", icon: Database, permission: "manage_stock" },
      ],
      "Company Owner": [
        { to: "/approval-center", label: "Approval Center", icon: Shield, permission: "approve_requests" },
        { to: "/materials-inventory", label: "Inventory", icon: Package, permission: "view_inventory" },
        { to: "/requests-list", label: "All Requests", icon: List, permission: "view_all_requests" },
        { to: "/analytics", label: "Analytics", icon: Activity, permission: "view_analytics" },
        { to: "/organizational-management", label: "Organization", icon: Users, permission: "manage_organization" },
        { to: "/settings", label: "Settings", icon: Settings, permission: "manage_settings" },
      ],
      "System Administrator": [
        { to: "/materials-inventory", label: "Inventory", icon: Package, permission: "manage_inventory" },
        { to: "/requests-list", label: "All Requests", icon: List, permission: "view_all_requests" },
        { to: "/analytics", label: "Analytics", icon: Activity, permission: "view_analytics" },
        { to: "/organizational-management", label: "Organization", icon: Users, permission: "manage_organization" },
        { to: "/settings", label: "Settings", icon: Settings, permission: "manage_settings" },
        { to: "/stock-management", label: "Stock Management", icon: Database, permission: "manage_stock" },
      ]
    };

    const userRole = currentUser?.role;
    if (!userRole) return baseItems;

    const roleItems = roleSpecificItems[userRole] || [];
    return [...baseItems, ...roleItems.filter(item => 
      item.permission === null || hasPermission(item.permission)
    )];
  };

  const navItems = getNavigationItems();
  
  // Determine how many items to show based on screen size
  const getVisibleItemsCount = () => {
    if (navItems.length <= 3) return navItems.length;
    return 3; // Show first 3 items, rest in dropdown
  };

  const visibleItemsCount = getVisibleItemsCount();
  const visibleItems = navItems.slice(0, visibleItemsCount);
  const dropdownItems = navItems.slice(visibleItemsCount);

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="rounded-2xl shadow-lg shadow-black/5 border border-gray-300/50" style={{ backgroundColor: '#e5e5e5' }}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Company Logo & Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">SSRFM Industries</h1>
              <p className="text-xs text-gray-500 hidden lg:block">Smart Supply & Resource Management</p>
            </div>
          </div>

          {/* Navigation Links - Desktop & Tablet */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-xs lg:text-sm font-semibold">{item.label}</div>
                  </div>
                </NavLink>
              );
            })}
            
            {/* Dropdown menu for additional items */}
            {dropdownItems.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs lg:text-sm font-semibold">More</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                      <div className="p-2">
                        {dropdownItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsMoreMenuOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                  isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                }`
                              }
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{item.label}</span>
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
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <div className="hidden lg:block">
              <RoleSwitcher />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1 lg:gap-2 border-gray-300 hover:bg-gray-200 text-xs lg:text-sm px-2 lg:px-3"
            >
              <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border bg-secondary/50">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                </NavLink>
              );
            })}
            
            <div className="pt-3 border-t border-gray-300/50">
              <div className="flex items-center justify-between">
                <RoleSwitcher />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};