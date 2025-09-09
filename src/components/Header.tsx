import { NavLink } from "react-router-dom";
import { Package, FileText, Plus, List, Users, Settings, Shield, Database, Activity, LogOut, Building2 } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { useState, useEffect } from "react";

export const Header = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
     
    ];

    const roleSpecificItems = {
      site_supervisor: [
        { 
          to: "/material-request", 
          label: "New Request", 
          icon: Plus,
          description: "Create Request",
          permission: "request:create"
        },
        { 
          to: "/my-requests", 
          label: "My Requests", 
          icon: FileText,
          description: "Track Status",
          permission: "request:view_own"
        },
        { 
          to: "/materials", 
          label: "Materials", 
          icon: Package,
          description: "View Catalog",
          permission: "material:view"
        }
      ],
      inventory_manager: [
        { 
          to: "/requests", 
          label: "All Requests", 
          icon: List,
          description: "Manage & Approve",
          permission: "request:view_all"
        },
        { 
          to: "/materials", 
          label: "Materials", 
          icon: Package,
          description: "Manage Inventory",
          permission: "material:view"
        },
        { 
          to: "/material-request", 
          label: "New Request", 
          icon: Plus,
          description: "Quick Add",
          permission: "request:create"
        }
      ],
      system_administrator: [
        { 
          to: "/users",
          label: "Users",
          icon: Users,
          description: "Manage Users",
          permission: "user:create"
        },
        { 
          to: "/requests", 
          label: "All Requests", 
          icon: List,
          description: "System Overview",
          permission: "request:view_all"
        },
        { 
          to: "/materials", 
          label: "Materials", 
          icon: Package,
          description: "Full Control",
          permission: "material:view"
        },
        { 
          to: "/system",
          label: "System",
          icon: Settings,
          description: "Configuration",
          permission: "system:configure"
        },
        { 
          to: "/audit",
          label: "Audit",
          icon: Database,
          description: "System Logs",
          permission: "audit:view"
        }
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

  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Loading Company Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 sm:h-3 w-24 sm:w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
            
            {/* Loading User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block h-8 sm:h-10 w-24 sm:w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-7 w-12 sm:h-8 sm:w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Company Logo and Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">SSRFM Industries</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Powered by ForeFold AI</p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <RoleSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <RoleSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>


      </div>
    </header>
  );
};