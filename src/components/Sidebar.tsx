import { NavLink } from "react-router-dom";
import { Package, List, Shield, Activity, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { useSidebar } from "../contexts/SidebarContext";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";

export const Sidebar = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const { isExpanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

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
        { to: "/supervisor-requests", label: "Outstanding Materials", icon: List, permission: "request:view_own" },
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

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#fafafa] border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-16'
    }`}>
      {/* Floating Toggle Button - Centered */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 p-0 bg-[#fafafa] border-2 border-gray-300 hover:border-primary hover:bg-primary hover:text-primary-foreground text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            {isExpanded ? (
              <ChevronLeft className="w-3 h-3 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-3 h-3 transition-transform duration-200" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="rounded-[20px]">
          <p>{isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex flex-col h-full">

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const navLink = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group flex items-center ${isExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-[20px] font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-gray-700 hover:text-primary-foreground hover:bg-primary/90"
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                )}
              </NavLink>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    {navLink}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="rounded-[20px]">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t border-gray-200">
          {!isExpanded ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-center border-gray-300 hover:border-primary hover:bg-primary/20 hover:text-primary-foreground text-gray-700 bg-gray-100 text-sm px-4 py-3 rounded-[20px] transition-all duration-300 font-semibold"
                >
                  <LogOut className="w-4 h-4 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-[20px]">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full gap-3 border-gray-300 hover:border-primary hover:bg-primary/20 hover:text-primary-foreground text-gray-700 bg-gray-100 text-sm px-4 py-3 rounded-[20px] transition-all duration-300 font-semibold"
            >
              <LogOut className="w-4 h-4 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};