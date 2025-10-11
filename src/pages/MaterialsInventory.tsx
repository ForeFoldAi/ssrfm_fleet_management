import { useState, useEffect } from "react";
import { Plus, Search, List, Table, Package, Settings, FileText, ClipboardList, Factory, Hourglass, ArrowUpRight, ShoppingBasket } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MaterialsTab } from "../components/MaterialsTab";
import { MachinesTab } from "../components/MachinesTab";
import { MaterialIssuesTab } from "../components/MaterialIssuesTab";
import { MaterialOrderBookTab } from "@/components/MaterialOrderBookTab";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

const MaterialsInventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize activeTab from URL params, localStorage, or default to "materials"
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      return tabFromUrl;
    }
    return localStorage.getItem('materials-inventory-active-tab') || "materials";
  });
  
  // Check if we're on a nested route (like material-request)
  const isNestedRoute = location.pathname.includes('/material-request');
  
  // Handle state parameter for active tab (from back navigation)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Persist activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('materials-inventory-active-tab', activeTab);
  }, [activeTab]);

  // Handle tab changes and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', newTab);
    setSearchParams(newSearchParams, { replace: true });
  };
  
  // If we're on a nested route, render the outlet instead of the main content
  if (isNestedRoute) {
    return <Outlet />;
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0 pb-24 sm:pb-0">
      {/* Header */}
      {/*
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Stock Register
        </h1>
      </div>
      */}
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Desktop Tabs - Top positioned */}
        <TabsList className="hidden sm:grid w-4/5 grid-cols-4 h-auto p-1 bg-secondary/10 rounded-lg shadow-sm">
           <TabsTrigger 
            value="materials" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Hourglass className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Stock In Hand</span>
            <span className="xs:hidden sm:hidden"> Stock In Hand</span>
        </TabsTrigger>
          
          
          
          <TabsTrigger 
            value="material-issues" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <span className="relative w-4 h-4">
              <Package className="w-4 h-4" />
              <ArrowUpRight className="w-2 h-2 absolute -top-1 -right-1" />
            </span>
            <span className="hidden xs:inline sm:inline">Issued Materials</span>
            <span className="xs:hidden sm:hidden">Issue</span>
          </TabsTrigger>
          
<TabsTrigger 
            value="material-order-book" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <ShoppingBasket className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Purchased Materials</span>
            <span className="xs:hidden sm:hidden">Purchased</span>
          </TabsTrigger>

          
          <TabsTrigger 
            value="machines" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Factory className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Machines</span>
            <span className="xs:hidden sm:hidden">Machines</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile Tabs - Fixed at Bottom */}
        <TabsList className="sm:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 h-auto p-2 bg-gradient-to-r from-foreground to-foreground backdrop-blur-xl shadow-2xl border-t border-warning/20">
          <TabsTrigger 
            value="materials" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <Hourglass className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Stock</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="material-issues" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <span className="relative w-5 h-5">
              <Package className="w-5 h-5" />
              <ArrowUpRight className="w-2 h-2 absolute -top-1 -right-1" />
            </span>
            <span className="text-[10px] leading-tight">Issues</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="material-order-book" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <ShoppingBasket className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Purchased</span>
          </TabsTrigger>

          <TabsTrigger 
            value="machines" 
            className="flex flex-col items-center gap-1 px-1 py-2 text-xs font-semibold data-[state=active]:bg-warning data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white/70 data-[state=inactive]:text-white/70"
          >
            <Factory className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Machines</span>
          </TabsTrigger>
        </TabsList>

        {/* Custom Tab Content - Keep all components mounted to prevent reloading */}
        <div className="mt-4">
          {/* Material Issues Tab */}
          <div className={activeTab === "material-issues" ? "block" : "hidden"}>
          <MaterialIssuesTab />
          </div>

          {/* Materials Tab */}
          <div className={activeTab === "materials" ? "block" : "hidden"}>
          <MaterialsTab />
          </div>

          {/* Material Order Book Tab */}
          <div className={activeTab === "material-order-book" ? "block" : "hidden"}>
          <MaterialOrderBookTab />
          </div>

          {/* Machines Tab */}
          <div className={activeTab === "machines" ? "block" : "hidden"}>
          <MachinesTab />
          </div>
        </div>
      </Tabs>
      
      {/* Fixed Footer - Hidden on mobile, shown on desktop */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 py-2 z-10">
        <p className="text-center text-sm text-muted-foreground">
          Developed & Maintained by{' '}
          <a 
            href="https://forefoldai.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline transition-colors duration-200"
          >
            ForeFold AI
          </a>
        </p>
      </div>
    </div>
  );
};

export default MaterialsInventory;