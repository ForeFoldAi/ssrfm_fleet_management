import { NavLink } from "react-router-dom";
import { 
  Package, 
  FileText, 
  Plus, 
  List, 
  CheckCircle, 
  BarChart3, 
  Home,
  User,
  Settings,
  Bell,
  LogOut
} from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";

export const MobileNavigation = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  // Get role-specific navigation items
  const getNavigationItems = () => {
    const userRole = currentUser?.role;
    
    // Dashboard item - exclude for supervisor role
    const baseItems = userRole !== "site_supervisor" ? [
      { 
        to: "/", 
        label: "Home", 
        icon: Home,
        permission: null
      }
    ] : [];

    const roleSpecificItems = {
      site_supervisor: [
        { 
          to: "/my-requests", 
          label: "My Requests", 
          icon: FileText,
          permission: "request:view_own"
        },
        { 
          to: "/materials", 
          label: "Materials", 
          icon: Package,
          permission: "material:view"
        }
      ],
      inventory_manager: [
        { 
          to: "/requests", 
          label: "Requests", 
          icon: List,
          permission: "request:view_all"
        },
        { 
          to: "/materials", 
          label: "Stock Register", 
          icon: Package,
          permission: "material:view"
        },
        
      ],
      company_owner: [
        { 
          to: "/approvals",
          label: "Approvals",
          icon: CheckCircle,
          permission: "request:approve_unlimited"
        },
        
        { 
          to: "/inventory", 
          label: "Stock Register", 
          icon: Package,
          permission: "material:view"
        }
      ],
      system_administrator: [
        { 
          to: "/requests", 
          label: "Requests", 
          icon: List,
          permission: "request:view_all"
        },
        { 
          to: "/materials", 
          label: "Materials", 
          icon: Package,
          permission: "material:view"
        },
        { 
          to: "/stock", 
          label: "Stock", 
          icon: BarChart3,
          permission: "material:view"
        }
      ]
    };

    if (!userRole) return baseItems;

    const roleItems = roleSpecificItems[userRole] || [];
    return [...baseItems, ...roleItems.filter(item => 
      item.permission === null || hasPermission(item.permission)
    )];
  };

  const navItems = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
        
        {/* More menu button */}
        {navItems.length > 4 && (
          <div className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 text-gray-600 hover:text-blue-600 hover:bg-gray-50">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </div>
        )}
      </div>
    </nav>
  );
};
