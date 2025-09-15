import logo from "/logo.png";
import { NavLink } from "react-router-dom";
import { Package, FileText, Plus, List, Users, Settings, Shield, Database, Activity, LogOut, Building2, ChevronDown, Menu, X } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "../hooks/use-toast";
import { useState, useEffect } from "react";

export const Navigation = () => {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        { to: "/supervisor-requests", label: "Outstanding Materials ", icon: List, permission: "request:view_own" },
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
    if (navItems.length <= 4) return navItems.length;
    return 4; // Show first 4 items on desktop, rest in dropdown
  };

  const visibleItemsCount = getVisibleItemsCount();
  const visibleItems = navItems.slice(0, visibleItemsCount);
  const dropdownItems = navItems.slice(visibleItemsCount);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gradient-to-r from-foreground to-foreground backdrop-blur-lg border-b border-primary/60 shadow-lg shadow-black/20' 
        : 'bg-gradient-to-r from-foreground to-foreground backdrop-blur-md border-b border-primary/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company Logo & Name */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <img src={logo} alt="Minar Logo" className="w-11 h-11 object-contain" />
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">
              SSRFM Industries
              </h1>
              <p className="text-xs text-warning -mt-1 font-medium">Smart Supply & Resource Management</p>
            </div>
            
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-white">
                Minar
              </h1>
            </div>
          </div>

          {/* Navigation Links - Desktop - Moved to right side */}
          <div className="hidden lg:flex items-center space-x-1 ml-auto mr-4">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `group relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 ring-1 ring-primary/30"
                        : "text-sidebar-foreground hover:text-primary-foreground hover:bg-primary/90 hover:shadow-sm"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-1" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8 group-hover:-translate-x-1/2" />
                </NavLink>
              );
            })}
            
            {/* Dropdown menu for additional items */}
            {dropdownItems.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="group relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium text-sidebar-foreground hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  <Settings className="w-4 h-4 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
                  <span className="text-sm font-semibold">More</span>
                  <ChevronDown className={`w-3 h-3 transition-all duration-300 ${
                    isMoreMenuOpen ? 'rotate-180 text-primary-foreground' : 'group-hover:text-primary-foreground group-hover:translate-y-0.5'
                  }`} />
                  <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8 group-hover:-translate-x-1/2" />
                </button>
                
                {isMoreMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-3 w-72 bg-sidebar backdrop-blur-lg rounded-3xl shadow-xl border border-primary/60 z-20 overflow-hidden ring-1 ring-primary/10">
                      <div className="p-4">
                        <div className="text-xs font-bold text-warning uppercase tracking-wider mb-3 px-3">
                          Additional Menu
                        </div>
                        <div className="space-y-1">
                          {dropdownItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMoreMenuOpen(false)}
                                className={({ isActive }) =>
                                  `group flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                      : "text-sidebar-foreground hover:text-primary-foreground hover:bg-primary/90"
                                  }`
                                }
                              >
                                <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2" />
                                <span className="text-sm font-semibold">{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher */}
            <div className="hidden md:block">
              <RoleSwitcher />
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="group gap-2 border-primary hover:border-primary hover:bg-primary/20 hover:text-primary-foreground text-sidebar-foreground bg-sidebar-accent text-sm px-4 py-2 rounded-2xl transition-all duration-300 font-semibold"
            >
              <LogOut className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            </Button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-2xl bg-sidebar-accent hover:bg-primary/20 text-sidebar-foreground hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 transition-all duration-300 group-hover:rotate-90" />
              ) : (
                <Menu className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-4 border-t border-primary/60">
            {/* User Profile - Mobile (without name) */}
            <div className="flex items-center space-x-3 p-4 mb-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl">
              <div className="md:hidden">
                <RoleSwitcher />
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex flex-col items-center space-y-2 p-4 rounded-2xl font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-sidebar-foreground hover:text-primary-foreground hover:bg-primary/90 bg-secondary/30"
                      }`
                    }
                  >
                    <Icon className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <span className="text-xs font-bold text-center">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            
            {/* Mobile Actions */}
            <div className="pt-4 border-t border-primary/60">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="group gap-2 border-primary hover:border-primary hover:bg-primary/20 hover:text-primary-foreground text-sidebar-foreground bg-sidebar-accent transition-all duration-300 rounded-2xl font-semibold px-6"
                >
                  <LogOut className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
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